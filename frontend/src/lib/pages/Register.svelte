<script lang="ts">
  import settings from "../settings.json"

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
        token
      })
    })
    .then( async (res) => {
      if (res.ok) succes = true;
      else error = (await res.json()).message;
      loading = false;
    })
    .catch((e) => {
      error = e
    })
  }
</script>

<main>
  <h1>RIAlly</h1>
  <hr>
{#if succes}
  <h2>Success! You can now return to the discord server, have a magical ride!</h2>
{:else}
  <form on:submit|preventDefault={registerSubmit}>
    <span>
      <label for="username">Username</label>
      <label class="sub-label" for="username">This will be visible to everyone</label>
      <input type="text" name="username">
    </span>

    <span>
      <label for="name">Name</label>
      <label class="sub-label" for="name">So the committee knows your not a goblin!</label>
      <input type="text" name="name">
    </span>

    <input type="submit" value={loading ? "Give me a moment...": "Register"}>
  </form>
  {#if error}
    <p class="error">{error}</p>
  {/if}
{/if}
</main>

<style lang="scss">
  main {
    display: flex;
    align-items: center;
    flex-direction: column;

    form {
      display: flex;
      flex-direction: column;
      gap: 20px;

      span {
        display: flex;
        flex-direction: column;
        gap: 5px;
        
        .sub-label {
          font-size: .8rem;
        }
      }
    }

    .error {
      color: red;
      text-align: center;
    }
  }
</style>