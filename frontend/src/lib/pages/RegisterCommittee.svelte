<script lang="ts">
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import QuoteCard from "../../components/QuoteCard.svelte";
  import settings from "../settings.json";
  import { Link } from "svelte-routing";

  let loading = false; // Flag to track if the form is being submitted
  let error = ""; // Variable to store any potential error messages

  const registerSubmit = (event) => {
    if (loading) return; // If the form is already being submitted, return and prevent duplicate submissions
    loading = true; // Set the loading state to true
    error = ""; // Clear any previous error messages
    const data = new FormData(event.target); // Get form data from the event target
    const username = data.get("username"); // Get the username from the form data
    const name = data.get("name"); // Get the name from the form data
    const password = data.get("password"); // Get the password from the form data

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
        if (res.ok) return res.json(); // If the response is successful, return the JSON data
        else error = (await res.json()).message; // If there is an error, store the error message
        loading = false; // Set the loading state to false
      })
      .then(data => {
        localStorage.setItem("rially::token", data.token); // Store the received token in local storage
        navigate("/", {replace: true}); // Navigate to the homepage
      })
      .catch((e) => {
        error = e; // Catch any errors that occur during the fetch request and store the error message
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

        <Link to="/login">Already registered? Login here!</Link> <!-- Link to the login page -->
      </GlassCard>
    </div>
  </div>
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <QuoteCard />
    </div>
  </div>
</main>