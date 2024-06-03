<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";
  import { getRequestHeaders } from "../getRequestHeaders";

  let users: {id: number, username: string}[] = []; // List to store all users
  let readNote = false; // Flag to track if the warning note has been read
  let committeeId: number; // Variable to store the committee ID
  let error = ""; // Variable to store any potential error messages

  onMount(() => {
    fetch(`${settings.api_url}/teams/users`, {
      headers: {
        Authorization: localStorage.getItem("rially::token") ?? '',
      },
    })
      .then(async (res) => {
        // If the response is successful, store the user data in the 'users' list
        if (res.ok) return (users = await res.json());

        // If the response status is 401 (Unauthorized) or 403 (Forbidden), navigate to the login page
        if (res.status === 401 || res.status === 403)
          return navigate("/login", { replace: true });
        
          // If there is an error, store the error message
        error = (await res.json()).message;
      });

    fetch(`${settings.api_url}/teams/committee`, {
      headers: {
        Authorization: localStorage.getItem("rially::token") ?? '',
      },
    })
      .then(async (res) => {
        // If the response is successful, store the committee ID
        if (res.ok) return (committeeId = (await res.json()).id);

        // If the response status is 401 (Unauthorized) or 403 (Forbidden), navigate to the login page
        if (res.status === 401 || res.status === 403)
          return navigate("/login", { replace: true });

        // If there is an error, store the error message
        error = (await res.json()).message;
      })
      .catch((e) => (error = e))
      .finally(() => (changePassLoading = false));
  });

  let changePassLoading = false; // Flag to track if the password change request is being processed
  function handleChangePassword(event: any) {
    if (changePassLoading) return; // If the password change request is already being processed, return
    const data = new FormData(event.target); // Get form data from the event target
    const oldPassword = data.get("oldPassword"); // Get the old password from the form data
    const newPassword = data.get("newPassword"); // Get the new password from the form data
    if (!oldPassword || !newPassword) return; // If either the old password or new password is missing, return

    changePassLoading = true; // Set the loading state to true
    fetch(`${settings.api_url}/auth/changepassword`, {
      method: "POST",
      headers: getRequestHeaders(),
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    })
      .then(async (res) => {
        // If the response is successful, navigate to the homepage
        if (res.ok) return navigate("/", { replace: true });

        // If the response status is 401 (Unauthorized) or 403 (Forbidden), navigate to the login page
        if (res.status === 401 || res.status === 403)
          return navigate("/login", { replace: true });

        // Throw an error with the error message from the response
        throw new Error((await res.json()).message);
      })
      // Update the error variable if an error is thrown
      .catch((e) => (error = e));
  }

  let addUserLoading = false; // Flag to track if the user addition request is being processed
  let addUserSucces = false; // Flag to track if the user addition is successful
  function handleAddUserToCommittee(event: any) {
    if (addUserLoading) return; // If the user addition request is already being processed, return
    addUserSucces = false; // Reset the success flag
    const data = new FormData(event.target); // Get form data from the event target
    const id = Number(data.get("user")); // Get the selected user ID from the form data
    if (Number.isNaN(id) || addUserLoading) return; // If the ID is not a number or the user addition request is already being processed, return

    addUserLoading = true; // Set the loading state to true
    fetch(`${settings.api_url}/teams/member`, {
      method: "DELETE",
      headers: getRequestHeaders(),
      body: JSON.stringify({
        userId: id,
        newTeamId: committeeId,
      }),
    })
      .then(async (res) => {
        // If the response is successful, set the success flag to true
        if (res.ok) return (addUserSucces = true);
        
        // If the response status is 401 (Unauthorized) or 403 (Forbidden), navigate to the login page
        if (res.status === 401 || res.status === 403)
          return navigate("/login", { replace: true });

        // If there is an error, store the error message
        error = (await res.json()).message; 
      })
      .catch((e) => (error = e))
      .finally(() => {
        addUserLoading = false; // Set the loading state to false
        readNote = false; // Reset the readNote flag
      });
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
    color: limegreen;
  }
</style>