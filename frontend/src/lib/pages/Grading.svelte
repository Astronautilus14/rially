<script lang="ts">
  import settings from "../settings.json";
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import { io } from "socket.io-client"

  // Establish a websocket connection with the specified server URL
  const socket = io(settings.socketServerUrl);

  let mounted = false;
  // A list of 'pending' submissions. These are waiting on grading.
  let pending: { id: number; active: boolean; type: string }[] = [];
  let error = "";

  // When a new submission comes in, handle it
  socket.on("submission", (id: number, type: string) => {
    // Create a temporary array for reordering submissions
    let temp: { id: number; active: boolean; type: string }[] = [];
    let pushed = false;
    const newSubmission = { id, type, active: false };

    // Handle the logic to put the new submission in the correct place
    // The order is puzzle, challenge, crazy88 with each category having the oldest on top.
    // This way, when grading, the submission with the highest priority is always on top.
    if (newSubmission.type === "crazy88") return (pending = [...pending, newSubmission]);

    for (const submission of pending) {
      if (!pushed) {
        if (newSubmission.type === "puzzle" && submission.type !== "puzzle") {
          pushed = true;
          temp.push(newSubmission);
        } else if (newSubmission.type === "challenge" && submission.type === "crazy88") {
          pushed = true;
          temp.push(newSubmission);
        }
      }
      temp.push(submission);
    }
    if (!pushed) temp.push({ id, type, active: false });
    pending = temp;
  });

  // List that keeps track of submissions that have started grading while the client was still mounting (loading) 
  let toSetActive: { id: number; type: string }[] = [];

  // When the grading of a submission has started (by someone else)
  socket.on("grading-started", (id: number, type: string) => {
    // If the client has finished mounting, set the submission as active
    if (mounted) return setActive(id, type);
    // Otherwise, add it to the list of submissions to set as active later
    toSetActive.push({ id, type });
  });

  // When the grading of a submission is done (by someone else)
  socket.on("grading-finished", (id: number, type: string) => {
    // Remove the submission from the pending list
    pending = pending.filter(
      (submission) => submission.id !== id && submission.type !== type
    );
  });

  // When someone stopped grading a submission
  socket.on("grading-cancled", (id: number, type: string) => {
    // Set the submission as inactive
    setActive(id, type, false);
  });

  // Helper function that sets a submission to 'active',
  // meaning someone else is currently grading that submission
  function setActive(id: number, type: string, value = true) {
    pending = pending.map((submission) => {
      if (submission.id === id && submission.type === type)
        submission.active = value;
      return submission;
    });
  }

  // Function that triggers when you start grading a submission
  function grade(submission: {
    type: string;
    id: number;
    active: boolean
  }) {
    // If someone else is already grading that submission, return
    if (submission.active) return;
    // Let everyone know you will start grading
    socket.emit("grading-started", submission.id, submission.type);
    // Go to the grading page
    navigate(`/submission/${submission.type}/${submission.id}`);
  }

  // When the mounting (loading) is finished
  onMount(async () => {
    // Get all submissions that are waiting for a grade
    fetch(`${settings.api_url}/submissions`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then(async (response) => {
        // If the response is OK, parse the JSON
        if (response.ok) return response.json();

        // If not logged in, redirect to the login page
        if (response.status === 403 || response.status === 401)
          return navigate("/login", { replace: true });

        throw new Error((await response.json()).message);
      })
      .then((data) => {
        // Add the submissions to the list of pending submissions
        // There might already be some submissions in that list if they came in while loading
        pending = [...pending, ...data.pending];
        mounted = true;
        // Set all the submissions that are currently being graded to 'active'
        for (const submission of toSetActive) {
          setActive(submission.id, submission.type);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Grading">
        <!-- Display an error message if there is an error -->
        {#if error}
          <p class="error">{error}</p>
        {/if}

        <!-- Display a message if there are no new submissions -->
        {#if pending.length === 0}
          <p><i>There are no new submissions...</i></p>
        {/if}
        
        <!-- Display a list of pending submissions -->
        <ul class="list-group mb-3">
          {#each pending as submission}
            <li class="list-group-item">
              <div>
                <!-- Display the type of submission as a badge -->
                <span class="badge bg-secondary">
                  {submission.type.toLowerCase()} submission
                </span>
                <!-- Allow grading if the submission is not active -->
                <button
                  class={(submission.active ? "unclickable bg-secondary" : "") +
                    " btn btn-primary mx-2"}
                  on:click={() => {
                    grade(submission);
                  }}
                >
                  Grade
                </button>
              </div>
            </li>
          {/each}
        </ul>
      </GlassCard>
    </div>
  </div>
</main>

<!-- TODO: See styling for disabled button at /settings -->
<style>
  .unclickable {
    cursor: not-allowed;
    outline: none;
    border: none;
  }
</style>