<script lang="ts">
  import { onMount } from "svelte";
  import settings from "../settings.json"

  let error = "";
  let isLoading = {};

  let users = [];
  let teams = [];
  onMount(() => {
    fetch(`${settings.api_url}/teams/lonely`, {
      headers: {
        Authorization: localStorage.getItem("rially::token")
      }
    })
    .then(res => res.json())
    .then((data) => {
      users = data.users;
      teams = data.teams;
    })
  });

  function handleAddUserToTeam(event) {
    const data = new FormData(event.target);
    const teamId = Number(data.get("teamId"));
    const userId = Number(data.get("userId"));

    if (!teamId || !userId) return;
    if (Number.isNaN(teamId) || Number.isNaN(userId)) return;
    isLoading[userId] = true;

    fetch(`${settings.api_url}/teams/member`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        teamId
      })
    })
    .then((res) => {
      if (res.ok) {
        users = users.filter(user => user.id !== userId);
        error = "";
        return;
      }
      res.json().then(data => {
        error = data.message
      })
    })
    .catch((e) => {
      error = e;
    })
    .finally(() => {
      delete isLoading[userId]
    })
  }
</script>

<main>
  <h1>People who need a team</h1>
  <hr>
  {#if error}
    <p class="error">{error}</p>
  {/if}
  {#each users as user}
    <div class="user">
      <h2>{user.name}</h2>
      <p>{user.username}</p>
      <form on:submit|preventDefault={handleAddUserToTeam}>
        <select name="teamId">
          {#each teams as team}
            <option value={team.id}>{team.name}</option>
          {/each}
        </select>
        <input type="hidden" name="userId" value={user.id}>
        <input type="submit" value={isLoading[user] ? "Loading..." : "Submit"}>
      </form>
    </div>
  {/each}
</main>