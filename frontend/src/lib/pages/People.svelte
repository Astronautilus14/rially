<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";

  let error = "";
  let isLoading = {};

  let users = [];
  let teams = [];
  onMount(() => {
    fetch(`${settings.api_url}/teams/lonely`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then(async (res) => {
        if (res.ok) return res.json();
        if (res.status === 401 || res.status === 403) return navigate("/login", {replace: true});
        throw new Error((await res.json()).message);
      })
      .then((data) => {
        users = data.users;
        teams = data.teams;
      })
      .catch((e) => {
        error = e;
      });
  });

  function handleAddUserToTeam(event) {
    const data = new FormData(event.target);
    const teamId = Number(data.get("teamId"));
    const userId = Number(data.get("userId"));

    if (!teamId || !userId) return;
    if (Number.isNaN(teamId) || Number.isNaN(userId)) return;
    isLoading[userId] = true;

    fetch(`${settings.api_url}/teams/member`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        teamId,
      }),
    })
      .then((res) => {
        if (res.ok) {
          users = users.filter((user) => user.id !== userId);
          error = "";
          return;
        }
        res.json().then((data) => {
          error = data.message;
        });
      })
      .catch((e) => {
        error = e;
      })
      .finally(() => {
        delete isLoading[userId];
      });
  }
</script>

<main>
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Lonely people">
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <form on:submit|preventDefault={handleAddUserToTeam}>
          <table class="table table-striped table-bordered border-white">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Username</th>
                <th scope="col">Team</th>
                <th scope="col">Submit</th>
              </tr>
            </thead>
            <tbody>
              {#each users as user}
                <tr>
                  <td>
                    {user.name}
                  </td>
                  <td>
                    {user.username}
                  </td>
                  <td>
                    <select name="teamId" class="form-select">
                      {#each teams as team}
                        <option value={team.id}>{team.name}</option>
                      {/each}
                    </select>
                  </td>
                  <input type="hidden" name="userId" value={user.id} />
                  <td>
                    <input
                      type="submit"
                      class="btn btn-primary"
                      value={isLoading[user] ? "Loading..." : "Submit"}
                    />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </form>
      </GlassCard>
    </div>
  </div>
</main>
