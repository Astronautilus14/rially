<script lang="ts">
  import { onMount } from "svelte";
  import settings from "../settings.json"

  export let id: string;
  export let type: string;

  let submission;

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

  }
</script>

<main>
  <h1>Submission</h1>
  <hr>
  <p>Location: {submission?.location}</p>
  <p>Team id: {submission?.teamId}</p>
  <img src={submission?.fileLink} alt="Submission" width="400">
  <form on:submit|preventDefault={grade}>
    <input type="number" name="score" id="score" required>
    <input type="submit" value="Submit">
  </form>
</main>