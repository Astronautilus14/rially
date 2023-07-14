<script lang="ts">
  import settings from "../settings.json";
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import { io } from "socket.io-client"

  const socket = io(settings.socketServerUrl);

  let mounted = false;
  let pending: { id: number; active: boolean; type: string }[] = [];
  let error = "";

  // When a new submission comes in
  socket.on("submission", (id: number, type: string) => {
    let temp: { id: number; active: boolean; type: string }[] = [];
    let pushed = false;
    const newSubmission = { id, type, active: false };

    // My fanstic algorithm to put the new submission in the correct place.
    // The order is puzzle, challenge, crazy88 with in each categorie the oldest on top.
    // This way when grading you can always click the top one to grade the submission
    // with the most priority
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

  // List that keeps track of submission that have started grading
  // while the client was still mounting (loading) 
  let toSetActive: { id: number; type: string }[] = [];

  // When the grading of a submission has started (by someone else)
  socket.on("grading-started", (id: number, type: string) => {
    if (mounted) return setActive(id, type);
    toSetActive.push({ id, type });
  });

  // When the grading of a submission is done (by someone else)
  socket.on("grading-finished", (id: number, type: string) => {
    pending = pending.filter(
      (submission) => submission.id !== id && submission.type !== type
    );
  });

  // When someone stopped grading a submission
  socket.on("grading-cancled", (id: number, type: string) => {
    setActive(id, type, false);
  });

  // Helper function that sets a submission to 'active',
  // meaning someone else is currenty grading that submission
  function setActive(id: number, type: string, value = true) {
    pending = pending.map((submission) => {
      if (submission.id === id && submission.type === type)
        submission.active = value;
      return submission;
    });
  }

  // Function that triggers when you start grading a submission
  function grade(submission: any) {
    // If someone else is already grading that submission, return
    if (submission.active) return;
    // Let everyone know you will start grading
    socket.emit("grading-started", submission.id, submission.type);
    // Go to the grading page
    navigate(`/submission/${submission.type}/${submission.id}`);
  }

  // When the mounting (loading) is finnished
  onMount(async () => {
    // Get all submission that are waiting on a grade
    fetch(`${settings.api_url}/submissions`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then(async (response) => {
        // If OK, parse the json
        if (response.ok) return response.json();

        // If not logged in, redirect to the login page
        if (response.status === 403 || response.status === 401)
          return navigate("/login", { replace: true });

        throw new Error((await response.json()).message);
      })
      .then((data) => {
        // Add the submission to the list of pending submissions
        // There might already be some submissions in that list if
        // They came in while loading
        pending = [...pending, ...data.pending];
        mounted = true;
        // Set all the submission that are currently being graded to 'active'
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
        {#if error}
          <p class="error">{error}</p>
        {/if}
        {#if pending.length === 0}
          <p><i>There are no new submissions...</i></p>
        {/if}
        <ul class="list-group mb-3">
          {#each pending as submission}
            <li class="list-group-item">
              <div>
                <span class="badge bg-secondary">
                  {submission.type} submission
                </span>
                <button
                  class={(submission.active ? "unclickable" : "") +
                    " btn btn-primary"}
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

<style>
  button.unclickable {
    cursor: default;
    background-color: red;
  }
</style>
