<script lang="ts">
  import { isLoading } from "../../stores/loadingStore";
  import { onMount } from "svelte";
  import settings from "../settings.json";
  import { Link, navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import { fetchPlusPlus } from "../../stores/dbStore";

  let customerror = "";
  let teams = [];
  onMount(() => {
    fetchPlusPlus("teams").then((data) => {
      // @ts-expect-error
      teams = data;
    });
  });

  function handleCreateTeam(event) {
    if ($isLoading) return;
    const data = new FormData(event.target);
    const teamName = data.get("teamName");
    if (!teamName) return;

    fetchPlusPlus("teams", "POST", { teamName }, true);
  }
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="All teams">
        {#if customerror}
          <p class="error">{customerror}</p>
        {/if}
        <ul class="list-group mb-3">
          {#each teams as team}
            <li class="list-group-item">
              <Link to={`/teams/${team.id}`} class="card-link">
                {team.name}
              </Link>
            </li>
          {/each}
        </ul>
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
