<script lang="ts">
  import { isLoading } from "../../stores/loadingStore";
  import { onMount } from "svelte";
  import { Link, navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import { fetchPlusPlus } from "../../stores/dbStore";
  import type { Team } from "../types";

  let error = ""; // Variable to store any potential error messages

  let teams: Team[] = []; // List that contains all teams data

  // After mounting, fetch all teams
  onMount(() => {
    fetchPlusPlus("teams")
    .then((data: Team[]) => {
      teams = data;
    })
    .catch((e) => error = e);
  });

  // Create a new team
  function handleCreateTeam(event: any) {
    // When loading return
    if ($isLoading) return;

    // Get the team name
    const data = new FormData(event.target);
    const teamName = data.get("teamName");
    if (typeof teamName !== "string") return;

    // TODO: When an error happend (from the bot) weird stuff happens
    // Make a request to the backend
    fetchPlusPlus("teams", "POST", { teamName }, true);
  }
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="All teams">
        <!-- If ther is an error -->
        {#if error}
          <!-- Show the error -->
          <p class="error">{error}</p>
        {/if}

        <!-- List of all existing teams -->
        <ul class="list-group mb-3">
          {#each teams as team}
            <li class="list-group-item">
              <Link to={`/teams/${team.id}`} class="card-link">
                {team.name}
              </Link>
            </li>
          {/each}
        </ul>

        <!-- Form to create a new team -->
        <h2>Create new Team</h2>
        <form on:submit|preventDefault={handleCreateTeam}>
          <div class="mb-3">
            <label for="teamName" class="form-label">Team name</label>
            <input type="text" name="teamName" class="form-control" required />
          </div>
          <input
            type="submit"
            class="btn btn-primary"
            value={$isLoading ? "Loading..." : "Create"}
          />
        </form>
      </GlassCard>
    </div>
  </div>
</main>

<style lang="scss">
</style>
