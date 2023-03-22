<script lang="ts">
  import { onMount } from "svelte";
  import settings from "../settings.json"

  let error = "";
  let loading = false;

  let teams = [];
  onMount(() => {
    fetch(`${settings.api_url}/teams`, {
      headers: {
        Authorization: localStorage.getItem("rially::token")
      }
    })
    .then(res => res.json())
    .then((data) => {
      teams = data;
    })
    .catch((e) => error = e)
    .finally(() => loading = false)
  });
</script>

<main>
  <h1>All teams</h1>
  <hr>
  {#if loading}
    <p>Loading...</p>
  {:else}
    {#if error}
      <p class="error">{error}</p>
    {/if}
    {#each teams as team}
      <h2>{team.name}</h2>
    {/each}
  {/if}
</main>