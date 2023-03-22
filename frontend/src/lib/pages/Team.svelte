<script lang="ts">
  import { onMount } from "svelte";
  import settings from "../settings.json"

  export let id: string;
  let error = "";
  let loading = true;

  let team;
  onMount(() => {
    fetch(`${settings.api_url}/teams/${id}`, {
      headers: {
        Authorization: localStorage.getItem("rially::token")
      }
    })
    .then(res => res.json())
    .then((data) => {
      team = data;
    })
    .catch((e) => error = e)
    .finally(() => loading = false)
  });
</script>

<main>
  <h1>{loading ? "Loading..." : team?.name}</h1>
  <hr>
  {#if loading}
    <p>Loading...</p>
  {:else}
    {#if error}
      <p class="error">{error}</p>
    {/if}
    {#each team.members as member}
      <h2>{member.username}</h2>
      <h3>{member.name}</h3>
    {/each}
  {/if}
</main>