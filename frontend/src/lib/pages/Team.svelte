<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";

  export let id: string;
  let error = "";
  let loading = true;

  let team;
  onMount(() => {
    fetch(`${settings.api_url}/teams/${id}`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then( async (res) => {
        if (res.ok) return res.json();
        throw Error((await res.json()).message);
      })
      .then((data) => {
        team = data;
      })
      .catch((e) => (error = e))
      .finally(() => (loading = false));
  });

  let loadingTeamDelete = false;
  function handleTeamDelete() {
    if (loadingTeamDelete) return;
    loadingTeamDelete = true;
    fetch(`${settings.api_url}/teams`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        "Content-Type": "application/json",
      },
      method: "DELETE",
      body: JSON.stringify({
        teamId: team.id,
      }),
    })
      .then((res) => {
        if (res.ok) {
          navigate("/teams", { replace: true });
          return;
        }
        res.json().then((data) => (error = data.message));
      })
      .catch((e) => {
        error = e;
      })
      .finally(() => (loadingTeamDelete = false));
  }

  let loadingMemberDeletes = {};
  function handleMemberDelete(id: number) {
    if (loadingMemberDeletes[id]) return;
    loadingMemberDeletes[id] = true;
    fetch(`${settings.api_url}/teams/member`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        "Content-Type": "application/json",
      },
      method: "DELETE",
      body: JSON.stringify({
        userId: id,
      }),
    })
      .then((res) => {
        if (res.ok) return team.members = team.members.filter(member => member.id !== id);
        res.json().then((data) => (error = data.message));
      })
      .catch((e) => (error = e))
      .finally(() => {
        loadingMemberDeletes[id] = false;
        delete loadingMemberDeletes[id]
        error = "";
      });
  }

  let loadingChangeName = false;
  async function handleChangeName(event) {
    if (loadingChangeName) return;
    const data = new FormData(event.target);
    const newName = data.get("newName");
    if (!newName) return;

    loadingChangeName = true;
    fetch(`${settings.api_url}/teams`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify({
        newName,
        teamId: team.id
      }),
    })
      .then((res) => {
        if (res.ok) {
          team.name = newName;
          return;
        };
        if (res.status === 401 || res.status === 403) return navigate("/login", {replace: true});
        res.json().then((data) => (error = data.message));
      })
      .catch((e) => (error = e))
      .finally(() => {
        loadingChangeName = false;
        error = "";
      });
  }
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title={loading ? "Loading..." : team?.name}>
        <div class="row">
          {#if loading}
            <p>Loading...</p>
          {:else}
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
                <button class="btn btn-danger" on:click={handleTeamDelete}
                  >{loadingTeamDelete ? "Loading..." : "Delete team"}</button
                >
              {/if}
            </div>
          {/if}
        </div>
      </GlassCard>
    </div>
  </div>
</main>

<style lang="scss">
  //   * {
  //     margin: 0;
  //     padding: 0;
  //     box-sizing: border-box;
  //   }

  //   main {
  //     padding: 2rem;

  //     hr {
  //       margin: 1rem;
  //     }

  //     .error {
  //       color: red;
  //     }

  //     .user, .data {
  //       padding: 0.5rem;
  //       margin: 0.5rem;
  //       background-color: lightblue;
  //       width: fit-content;
  //     }

  //     form {
  //       display: flex;
  //       flex-direction: column;
  //       width: fit-content;
  //       gap: 5px;
  //       margin: 0.5rem 0;
  //     }

  //     .delete {
  //       background-color: red;
  //       color: white;
  //       padding: 5px;
  //       margin-top: 1rem;
  //       font-size: 0.7rem;
  //     }
  //   }
</style>
