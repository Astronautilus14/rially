<script lang="ts">
  import { onMount } from "svelte";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";
  import { isLoading } from "../../stores/loadingStore";

  export let id: string;
  let error = "";

  let team;
  onMount(() => {
    isLoading.set(true);
    fetch(`${settings.api_url}/teams/${id}/public`)
      .then((res) => res.json())
      .then((data) => {
        team = data;
      })
      .catch((e) => (error = e))
      .finally(() => isLoading.set(false));
  });
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Team overview">
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <h2>Team members</h2>
        {#if team}
          {#if team.members.length === 0}
            <p>This team has no members yet</p>
          {/if}
          <table class="table table-striped table-bordered border-white">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Username</th>
              </tr>
            </thead>
            <tbody>
              {#each team.members as member, i}
                <tr>
                  <td>{i + 1}</td>
                  <td>{member.username}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </GlassCard>
    </div>
  </div>
</main>

<style lang="scss">
</style>
