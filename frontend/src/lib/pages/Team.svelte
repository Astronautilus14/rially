<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
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

  let loadingTeamDelete = false;
  function handleTeamDelete() {
    loadingTeamDelete = true
    fetch(`${settings.api_url}/teams`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        'Content-Type': 'application/json'
      },
      method: "DELETE",
      body: JSON.stringify({
        teamId: team.id
      })
    })
    .then(res => {
      if (res.ok) {
        navigate("/teams", { replace: true })
        return;
      };
      res.json().then(data => error = data.message)
    })
    .catch((e) => error = e)
    .finally(() => loadingTeamDelete = false)
  }

  let loadingMemberDeletes = {}
  function handleMemberDelete(id: number) {
    loadingMemberDeletes[id] = true
    fetch(`${settings.api_url}/teams/member`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        'Content-Type': 'application/json'
      },
      method: "DELETE",
      body: JSON.stringify({
        userId: id
      })
    })
    .then(res => {
      if (res.ok) return;
      res.json().then(data => error = data.message)
    })
    .catch((e) => error = e)
    .finally(() => {
      delete loadingMemberDeletes[id]
      error = ""
    })
  }
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
      <p>Name: {member.name}</p>
      {#if member.discordId}
      <p>Discord ID: {member.discordId}</p>
      {:else}
      <p>Discord not connected</p>
      {/if}
      {#if !team.isCommittee}
      <button
        class="delete"
        on:click={() => handleMemberDelete(member.id)}
      >
        {loadingMemberDeletes[member.id] ? "Loading..." : "Delete"}
      </button>
      {/if}
    </div>
    {/each}

    <h2>Data</h2>
    <div class="data">
      <p>ID: {id}</p>
      <p>isCommittee: {team.isCommittee.toString()}</p>
      {#if team.channelId && team.roleId}
      <p>Channel ID: {team.channelId}</p>
      <p>Role ID: {team.roleId}</p>
      {:else}
      <p>Discord not connected</p>
      {/if}
    </div>

    <h2>Actions</h2>
    <form>
      <label for="newName">Change team name</label>
      <input type="text" name="newName">
      <input type="submit" value="Change">
    </form>
    {#if !team.isCommittee}
    <button class="delete" on:click={handleTeamDelete}>{loadingTeamDelete ? "Loading..." : "Delete"}</button>
    {/if}
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

    .error {
      color: red;
    }

    .user, .data {
      padding: 0.5rem;
      margin: 0.5rem;
      background-color: lightblue;
      width: fit-content;
    }

    form {
      display: flex;
      flex-direction: column;
      width: fit-content;
      gap: 5px;
      margin: 0.5rem 0;
    }

    .delete {
      background-color: red;
      color: white;
      padding: 5px;
      margin-top: 1rem;
      font-size: 0.7rem;
    }
  }
</style>