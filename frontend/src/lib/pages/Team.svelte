<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";
  import { fetchPlusPlus } from "../../stores/dbStore";
  import { isLoading, showError } from "../../stores/loadingStore";
  import { Pencil } from "svelte-bootstrap-icons";
  import { toast } from "@zerodevx/svelte-toast";

  export let id: string;
  let error = "";

  let team;
  onMount(() => {
    fetchPlusPlus(`/teams/${id}`).then((data) => {
      team = data;
    });
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
    fetchPlusPlus("/teams/member", "DELETE", { userId: id }).finally(() => {
      team.members = team.members.filter((member) => member.id !== id);
      loadingMemberDeletes[id] = false;
      delete loadingMemberDeletes[id];
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
    console.log("Changing name");
    fetchPlusPlus("/teams", "PATCH", { newName, teamId: team.id }).finally(
      () => {
        team.name = newName;
        loadingChangeName = false;
        error = "";
      }
    );
  }
    
  let changeUserNameFocus = null;
  function handleChangeUsername(newName: string, userId: number, oldName: string, target) {
    if (!newName || !userId) return;

    fetch(`${settings.api_url}/teams/member`, {
      method: "PATCH",
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId, newName
      })
    })
    .then( async (res) => {
      if (res.ok) return   toast.push("Succes", {
        duration: 2000,
        theme: {
          "--toastBackground": "#96be25",
          "--toastColor": "white",
          "--toastBarBackground": "white",
        },
      });
      if (res.status === 401 || res.status === 403) return navigate("/login", { replace: true });
      throw new Error((await res.json()).message);
    })
    .catch( (error) => {
      target.value = oldName;
      showError(error);
    })
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && changeUserNameFocus !== null) handleChangeUsername(changeUserNameFocus.target.value, changeUserNameFocus.id, changeUserNameFocus.old, changeUserNameFocus.target)
  }
</script>

<svelte:window on:keydown={onKeyDown} />

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
                        <td>
                          {#if member.name === "admin"}
                          admin
                          {:else}
                          <input 
                            type="text"
                            name="username"
                            value={member.username}
                            class="seamlessInput" 

                            on:blur={(event) => {
                              changeUserNameFocus = null;
                              // @ts-expect-error
                              handleChangeUsername(event.target.username, member.id, member.username, event.target);
                            }}

                            on:focus={(event) => {
                              changeUserNameFocus = { target: event.target, id: member.id, old: member.username }
                            }}
                          />
                          <Pencil />
                          {/if}
                        </td>
                        <td>
                          {member.discordId
                            ? member.discordId
                            : "Not connected"}
                        </td>
                        <td>
                          {#if member.username !== "admin"}
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

<style lang="scss">
  th {
    max-width: 1%;
    white-space: nowrap;
  }

  td:has(.seamlessInput) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: none;
    margin: 0;
    box-shadow: none;

    .seamlessInput {
      background: none;
      border: none;
      outline: none;
      box-shadow: none;
      color: var(--bs-body-color);
      max-width: 17ch;
  
      &:hover {
        text-decoration: underline;
        color: white
      }
    }
  }
</style>