<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import settings from "../settings.json"

  let data;
  let loading = true;
  let error = "";

  onMount(() => {
    fetch(`${settings.api_url}/submissions/funny`, {
      headers: {
        Authorization: localStorage.getItem("rially::token")
      }
    })
    .then(async (res) => {
      if (res.ok) return data = (await res.json()).submissions;
      error = (await res.json()).message
    })
    .catch(e => error = e)
    .finally(() => loading = false)
  })
</script>

<main>
  <h1>Funny submissions</h1>
  <hr>
  {#if error}
    <p class="error">{error}</p>
  {/if}
  {#if loading}
    <p>Loading...</p>
  {:else}
    {#each data as submission}
      <p>Team: <Link to={`/teams/${submission.team.id}`}>{submission.team.name}</Link></p>
      {#if /.*.(png|jpg|jpeg|gif|webp|avif|apng|bmp)$/i.test(submission?.fileLink)}
        <img src={submission?.fileLink} alt="Submission" width="400">
      {:else if /.*.(mp4|webm|ogg)$/i.test(submission?.fileLink)}
        <!-- svelte-ignore a11y-media-has-caption -->
        <video src={submission?.fileLink} controls />
      {/if}
      <Link to={`/submissions/${submission.type}/${submission.id}`}>More</Link>
    {/each}
  {/if}
</main>