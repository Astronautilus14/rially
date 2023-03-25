<script lang="ts">
  import GlassCard from "../../components/GlassCard.svelte";
  import QuoteCard from "../../components/QuoteCard.svelte";
  import settings from "../settings.json";

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const apiUrl = settings.api_url;

  let loading = false;
  let error = "";
  let succes = false;

  const registerSubmit = (event) => {
    loading = true;
    error = "";
    const data = new FormData(event.target);
    const username = data.get("username");
    const name = data.get("name");

    fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        name,
        token,
      }),
    })
      .then(async (res) => {
        if (res.ok) succes = true;
        else error = (await res.json()).message;
        loading = false;
      })
      .catch((e) => {
        error = e;
      });
  };
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Register">
        {#if succes}
          <h2>
            Success! You can now return to the discord server, have a magical
            ride!
          </h2>
        {:else}
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
              <div class="form-text">
                So the committee knows you're not a goblin!
              </div>
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
        {/if}
      </GlassCard>
    </div>
  </div>
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <QuoteCard />
    </div>
  </div>
</main>
