<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import settings from "../settings.json"

  let data;
  let error = "";
  let loading = true;

  onMount(() => {
    fetch(`${settings.api_url}/leaderboard`)
    .then(async (res) => {
      if (res.ok) return res.json()
      throw new Error((await res.json()))
    })
    .then(body => data = body.teams )
    .catch((e) => error = e )
    .finally(() => loading = false)
  });
</script>

<main>
  <h1>Leaderboard</h1>
  <hr>
  {#if loading}
  <p>Loading...</p>
  {:else}
  {#if error}
  <p class="error">{error}</p>
  {/if}
  <table>
    <thead>
      <th>Team</th>
      <th>Score</th>
    </thead>
      {#each data as team}
        <tr>
          <td><Link to={`/teams/${team.id}/public`}>{team.name}</Link></td>
          <td>{team.score}</td>
        </tr>
      {/each}
  </table>
  {/if}
</main>