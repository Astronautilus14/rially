<script lang="ts">
  import { onMount } from "svelte";
  import settings from "../settings.json";
  import { Link } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";

  let error = "";
  let loading = true;

  let teams = [];
  onMount(() => {
    fetch(`${settings.api_url}/teams`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        teams = data;
      })
      .catch((e) => (error = e))
      .finally(() => (loading = false));
  });

  let createLoading = false;
  function handleCreateTeam(event) {
    const data = new FormData(event.target);
    const teamName = data.get("teamName");
    if (!teamName) return;
    createLoading = true;

    fetch(`${settings.api_url}/teams`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ teamName }),
    })
      .then((res) => {
        if (res.ok) {
          window.location.reload();
          return;
        }
        res.json().then((data) => (error = data.message));
      })
      .catch((e) => (error = e))
      .finally(() => (createLoading = false));
  }
</script>

<main>
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="All teams" keepBootstrap>
        {#if loading}
          <p>Loading...</p>
        {:else}
          {#if error}
            <p class="error">{error}</p>
          {/if}
          <ul class="list-group">
            {#each teams as team}
              <li class="list-group-item">
                <Link to={`/teams/${team.id}`} class="card-link">
                  {team.name}
                </Link>
              </li>
            {/each}
          </ul>
          <h2>Create new team</h2>
          <form on:submit|preventDefault={handleCreateTeam}>
            <label for="teamName">Team name</label>
            <input type="text" name="teamName" required />
            <input
              type="submit"
              value={createLoading ? "Loading..." : "Create"}
            />
          </form>
        {/if}
      </GlassCard>
    </div>
  </div>
</main>

<style lang="scss">
  //   nav {
  //     display: flex;
  //     flex-direction: column;
  //   }

  //   .error {
  //     color: red;
  //   }
</style>
