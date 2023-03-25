<script lang="ts">
  import { onMount } from "svelte";
  import settings from "../settings.json"
  import socket from "../socket";
  import { navigate } from "svelte-routing";

  export let id: string;
  export let type: string;

  let submission;
  let loading = true;
  let error = "";

  onMount( async () => {
    fetch(`${settings.api_url}/submissions/${type}/${id}`, {
      headers: {
        Authorization: localStorage.getItem("rially::token")
      }
    })
    .then( async (res) => {
      if (res.ok) return res.json();
      error = (await res.json()).message
    })
    .then(data => {
      submission = data.submission;
    })
  });

  function grade(score: number) {
    loading = true;

    fetch(`${settings.api_url}/submissions/grade`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem("rially::token")
      },
      body: JSON.stringify({
        type: type,
        id: submission.id,
        grading: score
      })
    })
    .then(() => {
      socket.emit("grading-finished", submission.id, submission.type);
      navigate("/grading", {replace: true});
    })
    .catch((e) => {
      error = e;
      loading = false;
    })
  }

  function handleApprove(event) {
    const data = new FormData(event.target);
    const score = Number(data.get("score"));
    if (Number.isNaN(score)) return;
    grade(score)
  }
</script>

<main>
  <h1>Submission</h1>
  <hr>

  {#if error}
   <p class="error">{error}</p>
  {/if}

  <p>Location: {submission?.location}</p>
  <p>Team id: {submission?.teamId}</p>
  {#if type !== "puzzle"}
    <p>Grade: {submission?.grading ?? "not graded yet"}</p>
  {:else}
    <p>Status: {submission?.status}</p>
  {/if}

  {#if /.*.(png|jpg|jpeg|gif|webp|avif|apng|bmp)$/i.test(submission?.fileLink)}
    <img src={submission?.fileLink} alt="Submission" width="400">
  {:else if /.*.(mp4|webm|ogg)$/i.test(submission?.fileLink)}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video src={submission?.fileLink} controls />
  {/if}

  <div class="actions">
    {#if type !== "puzzle"}
    <form on:submit|preventDefault={handleApprove}>
      <input type="number" name="score" placeholder="Grade" required>
      <input type="submit" value="Approve">
    </form>
    {:else}
    <button on:click={() => grade(1)}>Approve</button>
    {/if}

    <button on:click={() => grade(0)}>Decline</button>
  </div>
</main>

<style lang="scss">
  .error {
    color: red;
  }
</style>