<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";

  let users = [];
  let readNote = false;
  let committeeId: number;
  let error = "";

  onMount( () => {
    fetch(`${settings.api_url}/teams/users`, {
      headers: {
        Authorization: localStorage.getItem("rially::token")
      }
    })
    .then( async (res) => {
      if (res.ok) return users = await res.json();
      if (res.status === 401 || res.status === 403) return navigate("/login", {replace: true});
      error = (await res.json()).message;
    });

    fetch(`${settings.api_url}/teams/committee`, {
      headers: {
        Authorization: localStorage.getItem("rially::token")
      }
    })
    .then( async (res) => {
      if (res.ok) return committeeId = (await res.json()).id;
      if (res.status === 401 || res.status === 403) return navigate("/login", {replace: true});
      error = (await res.json()).message;
    })
    .catch((e) => error = e)
    .finally(() => changePassLoading = false);
  })
  
  let changePassLoading = false;
  function handleChangePassword(event: any) {
    const data = new FormData(event.target);
    const oldPassword = data.get("oldPassword");
    const newPassword = data.get("newPassword");
    if (!oldPassword || !newPassword) return;

    changePassLoading = true;
    fetch(`${settings.api_url}/auth/changepassword`, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    })
    .then( async (res) => {
      if (res.ok) return navigate("/", {replace: true});
      if (res.status === 401 || res.status === 403) return navigate("/login", {replace: true});
      throw new Error((await res.json()).message);
    })
    .catch((e) => error = e);
  }

  let addUserLoading = false;
  let addUserSucces = false;
  function handleAddUserToCommittee(event: any) {
    addUserSucces = false;
    const data = new FormData(event.target);
    const id = Number(data.get("user"));
    if (Number.isNaN(id) || addUserLoading) return;

    addUserLoading = true;
    fetch(`${settings.api_url}/teams/member`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: id,
        newTeamId: committeeId,
      })
    })
    .then( async (res) => {
      if (res.ok) return addUserSucces = true;
      if (res.status === 401 || res.status === 403) return navigate("/login", {replace: true});
      error = (await res.json()).message;
    })
    .catch((e) => error = e)
    .finally(() => {
      addUserLoading = false;
      readNote = false;
    })
  }
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Settings">
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <div>
          <h3>Change password</h3>
          <form on:submit|preventDefault={handleChangePassword} class="mb-3">
            <input type="password" name="oldPassword" class="form-control" placeholder="Old password">
            <input type="password" name="newPassword" class="form-control" placeholder="New password">
            <input type="submit" value="Change password" class="btn btn-primary">
          </form>
        </div>

        <div>
          <h3>Add user to committee</h3>
          <form on:submit|preventDefault={handleAddUserToCommittee}>
            <select name="user" class="form-select">
              {#each users as user}
              <option value={user.id}>{user.username}</option>
              {/each}
            </select>
            <p>NOTE: This action gives the selected user the right to see full names, submissions etc. It also removes the user form his original team if he was in one.</p>
            <label for="readNote">
              <input type="checkbox" name="readNote" bind:checked={readNote}>
              Yes, I know what I'm about to do.
            </label>
            {#if readNote}
              <input type="submit" value={addUserLoading ? "Loading..." : "Add"} class="btn btn-primary">
            {:else}
              <input type="submit" value={addUserLoading ? "Loading..." : "Add"} class="btn btn-primary" disabled>
            {/if}
            {#if addUserSucces}
              <p class="success">User added successfully</p>
            {/if}
          </form>
        </div>
      </GlassCard>
    </div>
  </div>
</main>

<style lang="scss">
  form {
    display: flex;
    flex-direction: column;
    max-width: 400px;
    gap: .75rem;
    align-items: first baseline;
  }

  .btn {
    width: fit-content;
  }

  .success {
    color: limegreen
  }
</style>