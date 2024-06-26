<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import { isLoggedIn } from "../../stores/accountStore";
  import { isLoading } from "../../stores/loadingStore";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";
  import { getRequestHeaders } from "../getRequestHeaders";

  type scoreboardData = {
    id: number,
    name: string,
    score: number
  }[]

  let data: scoreboardData;  // Stores the fetched leaderboard data
  let error = "";  // Stores any error message
  let isPublic = false;  // Flag indicating if the leaderboard is public or not

  onMount(async () => {
    isLoading.set(true);  // Set the loading state to true
    await fetchStanding();  // Fetch the initial leaderboard data
    isLoading.set(false);  // Set the loading state to false after fetching

    // Fetch the standing every 2 minutes
    setInterval(fetchStanding, 2 * 60 * 1000);
  });

  async function fetchStanding() {
    fetch(`${settings.api_url}/leaderboard${$isLoggedIn ? "" : "/public"}`, {
      headers: {
        Authorization: localStorage.getItem("rially::token") ?? '',
      },
    })
      .then(async (res) => {
        if (res.ok) return res.json();  // If response is successful, parse JSON
        throw new Error((await res.json()).message);  // If there's an error, throw an error with the message
      })
      .then((body) => {
        error = body.message;  // Store the error message, if any
        if (error) return;
        let teamsdata: scoreboardData = body.teams;
        teamsdata.sort((a, b) => b.score - a.score);

        data = teamsdata;  // Store the fetched leaderboard data
        isPublic = body.isPublic ?? false;  // Update the isPublic flag from the response
      })
      .catch((e) => (error = e));  // Catch any error and store it in the error variable
  }

  function handlePublicSwitch() {
    if ($isLoading) return;  // If loading state is true, return (prevent simultaneous requests)
    isLoading.set(true);  // Set the loading state to true
    fetch(`${settings.api_url}/leaderboard`, {
      method: "PATCH",
      headers: getRequestHeaders(),
      body: JSON.stringify({
        setPublic: !isPublic,
      }),
    })
    .then(async (res) => {
      if (res.ok) {
        isPublic = !isPublic;  // If response is successful, toggle the isPublic flag
      } else {
        throw new Error((await res.json()).message);  // If there's an error, throw an error with the message
      }
    })
    .catch((e) => {
      error = e;  // Store the error message, if any
    })
    .finally(() => {
      isLoading.set(false);  // Set the loading state to false
    })
  }
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Leaderboard">
        {#if error}
          <p class="error">{error}</p>  <!-- Display error message if there is one -->
        {/if}
        {#if $isLoggedIn}
          <div class="mb-5">
            <h3>Public leaderboard is currently {isPublic ? 'enabled' : 'disabled'}</h3>
            <label class="switch">
              <button class="btn btn-primary" on:click={handlePublicSwitch}>Turn leaderboard {isPublic ? 'off' : 'on'}</button>
              <span class="slider round" />
            </label>
          </div>
        {/if}
        <table class="table table-bordered border-white">
          <thead>
            <tr>
              <th>Place</th>
              <th>Team</th>
              <th>Score</th>
            </tr>
          </thead>
          {#if data}
            <tbody>
              {#each data as team, i}
                <tr>
                  <td>{i + 1}</td>  <!-- Display the place number -->
                  <td>
                    <!-- Display team name with a link to their public team page -->
                    <Link to={`/teams/${team.id}/public`}>{team.name}</Link>
                  </td>
                  <td>{team.score}</td>  <!-- Display team score -->
                </tr>
              {/each}
            </tbody>
          {/if}
        </table>
      </GlassCard>
    </div>
  </div>
</main>