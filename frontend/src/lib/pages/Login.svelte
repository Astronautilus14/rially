<script lang="ts">
  import settings from "../settings.json"
  import { navigate } from "svelte-routing";

  function handelSubmit(event) {
    const data = new FormData(event.target);
    const username = data.get("username");
    const password = data.get("password");
    if (!username || !password) return;

    fetch(`${settings.api_url}/auth/login`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    })
    .then(res => res.json())
    .then(data => {
      localStorage.setItem("rially::token", data.token);
      navigate("/grading", { replace: true })
    })
    .catch(console.error)
  }
</script>

<main>
  <h1>Login</h1>
  <form on:submit|preventDefault={handelSubmit}>
    <label for="username">Username</label>
    <input type="text" name="username" id="username" required>
    <label for="password">Password</label>
    <input type="password" name="password" id="password" required>
    <input type="submit" value="Log in">
  </form>
</main>

<style lang="scss">
  main {
    display: flex;
    align-items: center;
    flex-direction: column;

    form {
      display: flex;
      flex-direction: column;
      gap: 10px
    }
  }
</style>