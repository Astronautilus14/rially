<script lang="ts">
  import { onMount } from "svelte";
  import settings from "../settings.json"

  export let id: string;
  let error = "";
  let loading = true;

  let team;
  onMount(() => {
    fetch(`${settings.api_url}/teams/${id}/public`)
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
    <h2>Team members</h2>
    {#if team.members.length === 0}
      <p>This team has no members yet</p>
    {/if}
    {#each team.members as member}
    <div class="user">
      <p>Username: {member.username}</p>
    </div>
    {/each}
  {/if}
</main>

<style lang="scss">
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  main {
    padding: 2rem;

    hr {
      margin: 1rem;
    }

    .user, .data {
      padding: 0.5rem;
      margin: 0.5rem;
      background-color: lightblue;
      width: fit-content;
    }
  }
</style>