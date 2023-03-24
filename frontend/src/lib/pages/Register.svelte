<script lang="ts">
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

<main data-bs-theme="dark">
  <div class="card">
    <div class="card-body">
      <h1 class="card-title">Register now!</h1>
      <hr />
      {#if succes}
        <h2>
          Success! You can now return to the discord server, have a magical
          ride!
        </h2>
      {:else}
        <form on:submit|preventDefault={registerSubmit}>
          <div class="section">
            <label class="form-label" for="username">Username</label>
            <input
              class="form-control form-control-lg"
              type="text"
              name="username"
              placeholder="Miel Monteur"
            />
            <div class="form-text">Your username is visible to everyone</div>
          </div>

          <div>
            <label class="form-label" for="name">Name</label>
            <input
              class="form-control form-control-lg"
              type="text"
              name="name"
            />
            <div class="form-text">
              So the committee knows your not a goblin!
            </div>
          </div>

          <input
            type="submit"
            class="btn btn-primary"
            value={loading ? "Give me a moment..." : "Register"}
          />
        </form>
        {#if error}
          <p class="error">{error}</p>
        {/if}
      {/if}
    </div>
  </div>
</main>

<style lang="scss">
  //   main {
  //     display: flex;
  //     align-items: center;
  //     flex-direction: column;

  //     form {
  //       display: flex;
  //       flex-direction: column;
  //       gap: 3em;

  //       span {
  //         display: flex;
  //         flex-direction: column;
  //         gap: 1em;

  //         .sub-label {
  //           font-size: 0.8rem;
  //         }
  //       }
  //     }

  //     .error {
  //       color: red;
  //       text-align: center;
  //     }
  //   }
</style>
