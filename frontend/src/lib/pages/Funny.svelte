<script lang="ts">
  import { onMount } from "svelte";
  import { isLoading } from "../../stores/loadingStore";
  import { Link, navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";
  import type { Submission } from "../types";
  import FileDisplay from "../../components/FileDisplay.svelte";

  let data: Submission[] = []; // Array to store the fetched data
  let error = ""; // Variable to store any potential error messages

  onMount(() => {
    isLoading.set(true); // Set the loading state to true before fetching data

    // Fetch data from the API
    fetch(`${settings.api_url}/submissions/funny`, {
      headers: {
        Authorization: localStorage.getItem("rially::token") ?? '', // Include authorization token from local storage
      },
    })
      .then(async (res) => {
        if (res.ok) return (data = (await res.json()).funny); // If the response is successful, store the submissions in the data array

        if (res.status === 401 || res.status === 403)
          return navigate("/login", { replace: true }); // If the response status is 401 (Unauthorized) or 403 (Forbidden), navigate to the login page

        error = (await res.json()).message; // If there is an error, store the error message
      })
      .catch((e) => (error = e)) // Catch any errors that occur during the fetch request and store the error message
      .finally(() => isLoading.set(false)); // Set the loading state to false after the fetch request is complete
  });
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Funny submissions">
        <!-- Display an error message if there is an error -->
        {#if error}
          <p class="error">{error}</p>
        {/if}
        
        <div class="row row-cols-4">
          <!-- Loop through the data array and iterate over each submission -->
          {#each data as submission}
            <div class="card col mx-2" style="width: 18rem;">
              <FileDisplay fileLink={submission.fileLink} />
              <div class="card-body">
                <h5 class="card-title">
                  Team
                  <!-- Link to the team's page -->
                  <Link to={`/teams/${submission.Team.id}`}>
                    {submission.Team.name}
                  </Link>
                </h5>
                <!-- Link to the submission's page -->
                <Link
                  class="btn btn-primary"
                  to={`/submission/${submission.type}/${submission.id}`}
                >
                  More
                </Link>
              </div>
            </div>
          {/each}
        </div>
      </GlassCard>
    </div>
  </div>
</main>