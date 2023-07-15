<script lang="ts">
  import settings from "../settings.json";
  import { Link, navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import { isLoggedIn } from "../../stores/accountStore";

  let loading = false;

  function handelSubmit(event) {
    if (loading) return; // If form is currently loading, return
    const data = new FormData(event.target); // Retrieve form data
    const username = data.get("username"); // Get value of username field
    const password = data.get("password"); // Get value of password field
    if (!username || !password) return; // If username or password is missing, return early

    loading = true; // Set loading to true
    fetch(`${settings.api_url}/auth/login`, { // Make a POST request to login endpoint
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
      if (res.ok) return res.json(); // If response is successful, parse JSON data
      return Promise.reject(res); // Otherwise, reject the promise
    })
    .then((data) => {
      localStorage.setItem("rially::token", data.token); // Store token in local storage
      isLoggedIn.set(true); // Set the isLoggedIn store to true
      navigate("/grading", { replace: true }); // Navigate to the "/grading" page
    })
    .catch(async (res) => {
      console.error(res); // Log the error response
      alert((await res.json()).message); // Display an alert with the error message
    })
    .finally(() => {
      loading = false; // Set loading back to false
    });
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
