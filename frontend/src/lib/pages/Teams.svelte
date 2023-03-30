<script lang="ts">
  import { isLoading } from "../../stores/loadingStore";
  import { onMount } from "svelte";
  import settings from "../settings.json";
  import { Link, navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";

  let error = "";
  let teams = [];
  onMount(() => {
    isLoading.set(true);
    fetch(`${settings.api_url}/teams`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 401 || res.status === 403)
          return navigate("/login", { replace: true });
        res.json().then((data) => (error = data.message));
      })
      .then((data) => {
        teams = data;
      })
      .catch((e) => (error = e))
      .finally(() => isLoading.set(false));
  });

  function handleCreateTeam(event) {
    const data = new FormData(event.target);
    const teamName = data.get("teamName");
    if (!teamName) return;
    isLoading.set(true);

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
      .finally(() => isLoading.set(false));
  }
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="All teams">
        {#if error}
          <p class="error">{error}</p>
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
