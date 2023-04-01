<script lang="ts">
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import QuoteCard from "../../components/QuoteCard.svelte";
  import settings from "../settings.json";
  import { Link } from "svelte-routing";

  let loading = false;
  let error = "";

  const registerSubmit = (event) => {
    if (loading) return;
    loading = true;
    error = "";
    const data = new FormData(event.target);
    const username = data.get("username");
    const name = data.get("name");
    const password = data.get("password");

    fetch(`${settings.api_url}/auth/registerCommittee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        name,
        password,
      }),
    })
      .then(async (res) => {
        if (res.ok) return res.json();
        else error = (await res.json()).message;
        loading = false;
      })
      .then(data => {
        localStorage.setItem("rially::token", data.token);
        navigate("/", {replace: true});
      })
      .catch((e) => {
        error = e;
      });
  };
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Register for committee">
        <form on:submit|preventDefault={registerSubmit}>
          <div class="mb-3">
            <label class="form-label" for="username">Username</label>
            <input
              class="form-control form-control-lg"
              type="text"
              name="username"
              placeholder="BeunhaasHans"
            />
            <div class="form-text">Your username is visible to everyone</div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="name">Name</label>
            <input
              class="form-control form-control-lg"
              type="text"
              name="name"
              placeholder="Niels Rotmensen"
            />
          </div>

          <div class="mb-3">
            <label class="form-label" for="password">Password</label>
            <input
              class="form-control form-control-lg"
              type="password"
              name="password"
              placeholder="****"
            />
          </div>

          <div class="mb-3">
            <input
              type="submit"
              class="btn btn-primary btn-lg"
              value={loading ? "Give me a moment..." : "Register"}
            />
          </div>
        </form>
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <Link to="/login">Already registered? Login here!</Link>
      </GlassCard>
    </div>
  </div>
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <QuoteCard />
    </div>
  </div>
</main>
