<script lang="ts">
  import { onMount } from "svelte";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";
  import { isLoading } from "../../stores/loadingStore";

  export let id: string; // Team id from the url
  let error = ""; // Initialize an error variable as an empty string

  let team: {
    name: string;
    Users: { username: string }[];
  };

  onMount(() => {
    isLoading.set(true); // Set the loading state to true
    fetch(`${settings.api_url}/teams/${id}/public`) // Fetch team data from the API endpoint
      .then((res) => res.json())
      .then((data) => {
        team = data.team; // Assign the fetched data to the "team" variable
      })
      .catch((e) => (error = e)) // Handle any errors and assign the error message to the "error" variable
      .finally(() => isLoading.set(false)); // Set the loading state to false after fetching data
  });
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Team overview">
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <!-- Conditionally render the team data if it exists -->
        {#if team}
          <h2>{team.name}</h2>
          <!-- If the team has no members, display a message -->
          {#if team.Users.length === 0}
            <p>This team has no members yet</p>
          {/if}
          <table class="table table-striped table-bordered border-white">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Username</th>
              </tr>
            </thead>
            <tbody>
              <!-- Iterate over the team members and display them in the table -->
              {#each team.Users as user, i}
                <tr>
                  <td>{i + 1}</td>
                  <td>{user.username}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </GlassCard>
    </div>
  </div>
</main>