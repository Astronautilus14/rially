<script lang="ts">
  import GlassCard from "../../components/GlassCard.svelte";
  import QuoteCard from "../../components/QuoteCard.svelte";
  import settings from "../settings.json";

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token"); // JWT that contains the user's discord id in the payload
  const apiUrl = settings.api_url;

  let loading = false; // Flag to track if the form is being submitted
  let error = ""; // Variable to store any potential error messages
  let succes = false; // Flag to track if the registration is successful

  const registerSubmit = (event) => {
    if (loading) return; // If the form is already being submitted, return and prevent duplicate submissions
    loading = true; // Set the loading state to true
    error = ""; // Clear any previous error messages
    const data = new FormData(event.target); // Get form data from the event target
    const username = data.get("username"); // Get the username from the form data
    const name = data.get("name"); // Get the name from the form data

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
        if (res.ok) succes = true; // If the response is successful, set the success flag to true
        else error = (await res.json()).message; // If there is an error, store the error message
        loading = false; // Set the loading state to false
      })
      .catch((e) => {
        error = e; // Catch any errors that occur during the fetch request and store the error message
      });
  };
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Register">
        {#if succes} <!-- If the registration is successful -->
          <h5>
            <b>Success!</b><br>You can now return to the Discord server. The committee will put you in your team soon, then you can make submissions. Have a magical ride!
          </h5>
        {:else} <!-- If the registration is not successful or not done yet -->
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
              <!-- Display different text on the button based on the loading state -->
              <input
                type="submit"
                class="btn btn-primary btn-lg"
                value={loading ? "Give me a moment..." : "Register"}
              />
            </div>
          </form>

          {#if error} <!-- If there is an error message -->
            <p class="error">{error}</p> <!-- Display the error message -->
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