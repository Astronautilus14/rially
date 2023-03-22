<script lang="ts">
  import { onMount } from "svelte";
  import settings from "../settings.json"
  import socket from "../socket";
  import { navigate } from "svelte-routing";

  export let id: string;
  export let type: string;

  let submission;
  let loading = false;
  let error = "";

  onMount( async () => {
    fetch(`${settings.api_url}/submissions/${type}/${id}`, {
      headers: {
        Authorization: localStorage.getItem("rially::token")
      }
    })
    .then(res => res.json())
    .then(data => {
      submission = data.submission;
      console.log(submission)
    })
  });

  function grade(event) {
    const data = new FormData(event.target);
    const score = Number(data.get("score"));
    if (Number.isNaN(score)) return;
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
</script>

<main>
  <h1>Submission</h1>
  <hr>
  {#if error}
   <p class="error">{error}</p>
  {/if}
  <p>Location: {submission?.location}</p>
  <p>Team id: {submission?.teamId}</p>
  <img src={submission?.fileLink} alt="Submission" width="400">
  <form on:submit|preventDefault={grade}>
    <input type="number" name="score" id="score" required>
    <input type="submit" value="Submit">
  </form>
</main>

<style lang="scss">
  .error {
    color: red;
  }
</style>