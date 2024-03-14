<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";
  import { fetchPlusPlus } from "../../stores/dbStore";
  import { isLoading, showError } from "../../stores/loadingStore";
  import { Pencil } from "svelte-bootstrap-icons";
  import { toast } from "@zerodevx/svelte-toast";
  import type { Team } from "../types";

  export let id: string; // Team's ID from the URL
  let error = ""; // Variable to store any potential error messages

  let team: Team; // Data about the team

  // When the component is mounted
  onMount(async () => {
    // Fetch data about the team
    team = await fetchPlusPlus(`/teams/${id}`) as Team;
  });

  // Flag that indicates if a delete request is loading
  let loadingTeamDelete = false;
  function handleTeamDelete() {
    // If the user delete request is already being processed, return
    if (loadingTeamDelete) return;
    loadingTeamDelete = true;

    // Make a request to delete the team
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
      .then(async (res) => {
        // If the response is successful
        if (res.ok) {
          // Navigate back to the teams page
          navigate("/teams", { replace: true });
          return;
        }

        // If an error occurred, throw the error with the error message
        throw new Error((await res.json()).message);
      })
      // If an error occurred, set the error message
      .catch((e) => {
        error = e;
      })
      .finally(() => (loadingTeamDelete = false));
  }

  // Key-Value pair that keeps track of loading state of member delete requests
  let loadingMemberDeletes: { [key: number]: boolean } = {};
  function handleMemberDelete(id: number) {
    // If the user delete request is already being processed, return
    if (loadingMemberDeletes[id]) return;
    loadingMemberDeletes[id] = true;

    // Make a request to delete a user from a team
    fetchPlusPlus("/teams/member", "DELETE", { userId: id }).finally(() => {
      // Remove the member from the team's member list
      team.Users = team.Users.filter((member) => member.id !== id);
      loadingMemberDeletes[id] = false;
      delete loadingMemberDeletes[id];
      error = "";
    });
  }

  let loadingChangeName = false;
  async function handleChangeName(event: any) {
    if (loadingChangeName) return;

    const data = new FormData(event.target);
    const newName = data.get("newName");
    if (typeof newName !== "string") return;

    loadingChangeName = true;
    fetchPlusPlus("/teams", "PATCH", { newName, teamId: team.id })
      .finally(() => {
        // Update the team's name with the new name
        team.name = newName;
        loadingChangeName = false;
        error = "";
      });
  }

  let changeUserNameFocus: { target: any; id: number; old: string } = null;
  function handleChangeUsername(newName: string, userId: number, oldName: string, target: any) {
    if (!newName || !userId) return;

    fetch(`${settings.api_url}/teams/member`, {
      method: "PATCH",
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        newName,
      }),
    })
      .then(async (res) => {
        if (res.ok)
          return toast.push("Succes", {
            duration: 2000,
            theme: {
              "--toastBackground": "#96be25",
              "--toastColor": "white",
              "--toastBarBackground": "white",
            },
          });
        if (res.status === 401 || res.status === 403)
          return navigate("/login", { replace: true });
        throw new Error((await res.json()).message);
      })
      .catch((error) => {
        target.value = oldName;
        showError(error);
      });
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && changeUserNameFocus !== null)
      handleChangeUsername(
        changeUserNameFocus.target.value,
        changeUserNameFocus.id,
        changeUserNameFocus.old,
        changeUserNameFocus.target
      );
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
              {#if team.Users.length === 0}
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
                    {#each team.Users as user}
                      <tr>
                        <td>{user.name}</td>
                        <td>
                          {#if user.name === "admin"}
                          admin
                          {:else}
                          <input
                            type="text"
                            name="username"
                            value={user.username}
                            class="seamlessInput"

                            on:blur={(event) => {
                              changeUserNameFocus = null;
                              // @ts-expect-error
                              handleChangeUsername(event.target.username, user.id, user.username, event.target);
                            }}

                            on:focus={(event) => {
                              changeUserNameFocus = { target: event.target, id: user.id, old: user.username };
                            }}
                          />
                          <Pencil />
                          {/if}
                        </td>
                        <td>
                          {user.discordId ? user.discordId : "Not connected"}
                        </td>
                        <td>
                          {#if user.username !== "admin"}
                            <button
                              class="delete btn btn-danger"
                              on:click={() => handleMemberDelete(user.id)}
                            >
                              {loadingMemberDeletes[user.id]
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
                  Delete team
                </button>
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
        color: white;
      }
    }
  }
</style>