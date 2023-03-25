<script lang="ts">
  import settings from "../settings.json";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";

  function handelSubmit(event) {
    const data = new FormData(event.target);
    const username = data.get("username");
    const password = data.get("password");
    if (!username || !password) return;

    fetch(`${settings.api_url}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("rially::token", data.token);
        navigate("/grading", { replace: true });
      })
      .catch(console.error);
  }
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Login">
        <form on:submit|preventDefault={handelSubmit}>
          <!-- <label for="username">Username</label>
          <input type="text" name="username" id="username" required />
          <label for="password">Password</label>
          <input type="password" name="password" id="password" required />
          <input type="submit" value="Log in" /> -->
          <div class="mb-3">
            <label class="form-label" for="username">Username</label>
            <input
              class="form-control form-control-lg"
              type="text"
              name="username"
              placeholder="BeunhaasHans"
            />
            <div class="form-text">What are you called?</div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="password">Password</label>
            <input
              class="form-control form-control-lg"
              type="password"
              name="password"
              placeholder="*******"
            />
            <div class="form-text">Password123 is not secure</div>
          </div>

          <div class="mb-3">
            <button class="btn btn-primary btn-lg" type="submit">Log in</button>
          </div>
        </form>
      </GlassCard>
    </div>
  </div>
</main>

<style lang="scss">
</style>
