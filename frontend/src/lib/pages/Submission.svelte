<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import settings from "../settings.json";
  import { io } from "socket.io-client";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import { Link } from "svelte-routing";

  export let id: string;
  export let type: string;

  const socket = io(settings.socketServerUrl); // Initialize Socket.IO client

  let submission; // Variable to store the submission data
  let loading = true; // Flag to track if data is loading
  let error = ""; // Variable to store error messages
  let isFunny = false; // Flag to track if submission is funny
  let isGraded = false; // Flag to track if submission is graded
  let speedPlace: number; // Variable to store speed place (1st, 2nd...)

  onMount(async () => {
    // Perform actions when component is mounted
    fetch(`${settings.api_url}/submissions/${type}/${id}`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then(async (res) => {
        // If the response is successful, parse the body
        if (res.ok) return res.json();

        // If the response status is 401 (Unauthorized) or 403 (Forbidden), navigate to the login page
        if (res.status === 401 || res.status === 403)
          return navigate("/login", { replace: true });

        // If there is an error, store the error message
        error = (await res.json()).message;
      })
      .then((data) => {
        submission = data.submission;
        isFunny = data.submission.isFunny;
        isGraded = data.submission.grading ? true : false;
        speedPlace = data.speedPlace;
      })
      .finally(() => (loading = false));
  });

  function grade(score: number) {
    // If the user grade request is already being processed, return
    if (loading) return;
    loading = true;

    fetch(`${settings.api_url}/submissions/grade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("rially::token"),
      },
      body: JSON.stringify({
        type: type,
        id: submission.id,
        grading: score,
        isFunny,
      }),
    })
      .then(() => {
        // Send to the other user's that you finished grading this submission
        socket.emit("grading-finished", submission.id, submission.type);
        isGraded = true;
        // Navigate back to the grading page
        navigate("/grading", { replace: true });
      })
      .catch((e) => (error = e))
      .finally(() => (loading = false));
  }

  function handleApprove(event) {
    const data = new FormData(event.target);
    const score = Number(data.get("score"));
    if (Number.isNaN(score)) return;
    grade(score);
  }

  // When the page is destroyed (closed)
  onDestroy(() => {
    // If the grading is finished, return
    if (isGraded) return; 
    // Let the other clients know you stopped grading
    socket.emit("grading-canceled", submission.id, type);
  });
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Submission">
        <div class="row">
          {#if loading}
            <p>Loading...</p>
          {:else}
            <!-- If there is an error -->
            {#if error}
            <!-- Display the error -->
              <p class="error">{error}</p>
            {/if}

            <div class="col-md-3 col-6">
              {#if submission?.location}
                <p>Location: {submission?.location}</p>
              {/if}
              {#if submission?.number}
                <p>Number: {submission?.number}</p>
              {/if}
              <p>Team: <Link to={`/teams/${submission?.team.id}`}>{submission?.team?.name}</Link></p>
              <p>Grade: {submission?.grading ?? "not graded yet"}</p>
              <p>
                Speed place: {speedPlace}{speedPlace === 1
                  ? "st"
                  : speedPlace === 2
                  ? "nd"
                  : speedPlace === 3
                  ? "rd"
                  : "th"}
              </p>
              <p>
                Submission time: {new Date(submission?.timeSubmitted)
                  .toTimeString()
                  .split(" ")[0]}
              </p>
            </div>

            <div class="actions col-6 col-md-3">
              <label class="form-check-label" for="ifFunny">Is funny</label>
              <input
                type="checkbox"
                class="form-check-input"
                name="isFunny"
                bind:checked={isFunny}
              />
              <form on:submit|preventDefault={handleApprove} class="">
                <input
                  type="number"
                  value={type === "puzzle"
                    ? (5 + Math.max(4 - speedPlace, 0)).toString()
                    : null}
                  name="score"
                  placeholder="Grade"
                  class="form-control mb-3"
                  min="1"
                  required
                />
                <input
                  type="submit"
                  class="btn btn-primary mb-3"
                  value={isGraded ? "Regrade" : "Approve"}
                />
              </form>

              {#if !isGraded}
                <button class="btn btn-danger mb-3" on:click={() => grade(0)}
                  >Decline</button
                >
              {/if}
            </div>

            <div class="col-12 col-md-6">
              {#if /.*.(png|jpg|jpeg|gif|webp|avif|apng|bmp)$/i.test(submission?.fileLink)}
                <img
                  class="img-fluid"
                  style="max-height: 60vh; max-width: 40vw;"
                  src={submission?.fileLink}
                  alt="Submission"
                />
              {:else if /.*.(mp4|webm|ogg)$/i.test(submission?.fileLink)}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video src={submission?.fileLink} controls />
              {:else}
                <p>
                  File type not supported. Click <a href={submission?.fileLink}
                    >here</a
                  > to download it.
                </p>
              {/if}
            </div>
          {/if}
        </div>
      </GlassCard>
    </div>
  </div>
</main>