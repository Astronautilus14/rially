<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";
  import { fetchPlusPlus } from "../../stores/dbStore";
  import { isLoading } from "../../stores/loadingStore";

  export let id: string;
  let error = "";

  let team;
  onMount(() => {
    fetchPlusPlus(`/teams/${id}`).then((data) => {
      team = data;
    });
  });

  function handleTeamDelete() {
    fetchPlusPlus("/teams", "DELETE", { teamId: team.id }).finally(() => {
      navigate("/teams", { replace: true });
    });
  }

  let loadingMemberDeletes = {};
  function handleMemberDelete(id: number) {
    loadingMemberDeletes[id] = true;
    fetchPlusPlus("/teams/member", "DELETE", { userId: id }).finally(() => {
      team.members = team.members.filter((member) => member.id !== id);
      loadingMemberDeletes[id] = false;
      delete loadingMemberDeletes[id];
      error = "";
    });
  }

  let loadingChangeName = false;
  async function handleChangeName(event) {
    const data = new FormData(event.target);
    const newName = data.get("newName");
    if (!newName) return;

    loadingChangeName = true;
    console.log("Changing name");
    fetchPlusPlus("/teams", "PATCH", { newName, teamId: team.id }).finally(
      () => {
        team.name = newName;
        loadingChangeName = false;
        error = "";
      }
    );
  }
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title={$isLoading ? "Loading..." : team?.name}>
        {#if team}
          <div class="row">
            {#if error}
              <p class="error">{error}</p>
            {/if}
            <div class="col-12 col-md-6">
              <h2>Team members</h2>
              {#if team.members.length === 0}
                <p>This team has no members yet</p>
              {:else}
                <table class="table table-striped table-bordered border-white">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Username</th>
                      <th scope="col">Discord ID</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each team.members as member}
                      <tr>
                        <td>{member.name}</td>
                        <td>{member.username}</td>
                        <td>
                          {member.discordId
                            ? member.discordId
                            : "Not connected"}
                        </td>
                        <td>
                          {#if !team.isCommittee}
                            <button
                              class="delete btn btn-danger"
                              on:click={() => handleMemberDelete(member.id)}
                            >
                              {loadingMemberDeletes[member.id]
                                ? "Loading..."
                                : "Delete"}
                            </button>
                          {/if}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {/if}
            </div>

            <div class="col-12 col-md-2">
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
            </div>

            <div class="col-12 col-md-4">
              <h2>Actions</h2>
              <form class="mb-3" on:submit|preventDefault={handleChangeName}>
                <label for="newName" class="form-label">Change team name</label>
                <input type="text" name="newName" class="form-control mb-3" />
                <input
                  type="submit"
                  value={loadingChangeName ? "Loading..." : "Change team name"}
                  class="btn btn-large btn-primary"
                />
              </form>
              {#if !team.isCommittee}
                <button class="btn btn-danger" on:click={handleTeamDelete}>
                  Delete team</button
                >
              {/if}
            </div>
          </div>
        {:else}
          <p>Team not found</p>
        {/if}
      </GlassCard>
    </div>
  </div>
</main>
