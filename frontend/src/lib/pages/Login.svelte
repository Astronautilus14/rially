<script lang="ts">
  import settings from "../settings.json";
  import { Link, navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import { isLoggedIn } from "../../stores/accountStore";

  let loading = false;

  function handelSubmit(event) {
    if (loading) return;
    const data = new FormData(event.target);
    const username = data.get("username");
    const password = data.get("password");
    if (!username || !password) return;

    loading = true;
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
      .then((res) => {
        if (res.ok) return res.json();
        return Promise.reject(res);
      })
      .then((data) => {
        localStorage.setItem("rially::token", data.token);
        isLoggedIn.set(true);
        navigate("/grading", { replace: true });
      })
      .catch( async (res) => {
        console.log(res);
        alert((await res.json()).message);
      })
      .finally(() => {
        loading = false;
      })
  }
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Login for committee">
        <form on:submit|preventDefault={handelSubmit}>
          <div class="mb-3">
            <label class="form-label" for="username">Username</label>
            <input
              class="form-control form-control-lg"
              type="text"
              name="username"
              placeholder="BeunhaasHans"
              required
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
              required
            />
            <div class="form-text">Password123 is not secure</div>
          </div>

          <div class="mb-3">
            <button class="btn btn-primary btn-lg" type="submit">{loading ? "Loading..." : "Log in"}</button>
          </div>
        </form>
        <Link to="/register/committee">No account? Register first!</Link>
      </GlassCard>
    </div>
  </div>
</main>

<style lang="scss">
</style>
