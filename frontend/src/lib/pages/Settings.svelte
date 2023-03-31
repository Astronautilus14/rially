<script lang="ts">
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";

  let error = "";

  function handleChangePassword(event: any) {
    const data = new FormData(event.target);
    const oldPassword = data.get("oldPassword");
    const newPassword = data.get("newPassword");
    if (!oldPassword || !newPassword) return;

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
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Settings">
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <h3>Change password</h3>
        <form on:submit|preventDefault={handleChangePassword} class="mb-3">
          <input type="password" name="oldPassword" class="form-control" placeholder="Old password">
          <input type="password" name="newPassword" class="form-control" placeholder="New password">
          <input type="submit" value="Change password" class="btn btn-primary">
        </form>
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
  }

  .btn {
    width: fit-content;
  }
</style>