<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";
  import type { Member, Team } from "../types";
  import type { EventHandler } from "svelte/elements";
  import { getRequestHeaders } from "../getRequestHeaders";

  let error = "";
  let isLoading: Record<number, boolean> = {}; // Initialize an object to track loading state for each user

  let users: Member[] = []; // Initialize an array to store user data
  let teams: Omit<Team, 'Users'>[] = []; // Initialize an array to store team data

  onMount(() => {
    // Perform actions when the component is mounted (loaded)
    fetch(`${settings.api_url}/teams/lonely`, {
      headers: {
        Authorization: localStorage.getItem("rially::token") ?? '', // Include authorization token from local storage in the headers
      },
    })
      .then(async (res) => {
        // If the response is successful, parse the JSON data
        if (res.ok) return res.json();

        // If not logged in, redirect to the login page
        if (res.status === 401 || res.status === 403) return navigate("/login", {replace: true});

        // Throw an error with the error message from the response
        throw new Error((await res.json()).message);
      })
      .then((data) => {
        users = data.users; // Store the fetched user data in the users array
        teams = data.teams; // Store the fetched team data in the teams array
      })
      .catch((e) => {
        error = e; // Store the error message in the error variable
      });
  });

  const handleAddUserToTeam = (userId: number) => {
    // Handle the form submission to add a user to a team
    const teamInput = document.getElementById(`teamId-${userId}`) as HTMLSelectElement | null; // Get the team selection input element
    if (!teamInput) return; // If the team input is missing, return
    const teamId = Number(teamInput.value); // Get the selected team ID from the form data

    if (!teamId || !userId) return; // If either teamId or userId is missing, return
    if (Number.isNaN(teamId) || Number.isNaN(userId)) return; // If either teamId or userId is not a valid number, return
    if (isLoading[userId]) return; // If the user is already being loaded, return
    isLoading[userId] = true; // Set the loading state for the user to true

    fetch(`${settings.api_url}/teams/member`, {
      method: "POST",
      headers: getRequestHeaders(),
      body: JSON.stringify({
        userId,
        teamId,
      }), // Send the user and team IDs in the request body as JSON
    })
      .then((res) => {
        if (res.ok) {
          // Remove the user from the users array since they are now part of a team
          users = users.filter((user) => user.id !== userId);
          error = ""; // Reset the error message
          return;
        }
        res.json().then((data) => {
          error = data.message; // Set the error message to the error message from the response
        });
      })
      .catch((e) => {
        error = e; // Store the error message in the error variable
      })
      .finally(() => {
        isLoading[userId] = false; // Set the loading state for the user to false
        delete isLoading[userId]; // Remove the loading state property for the user
      });
  }
</script>

<main>
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Lonely people">
        {#if error}
          <p class="error">{error}</p> <!-- Display the error message if there is an error -->
        {/if}
        <!-- Handle form submission and prevent the default form behavior -->
        <table class="table table-striped table-bordered border-white">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Username</th>
              <th scope="col">Team</th>
              <th scope="col">Submit</th>
            </tr>
          </thead>
          <tbody>
            {#if users.length === 0}
              <tr>
                <td colspan="4">
                  No unassigned users
                </td>
              </tr>
            {/if}
            {#each users as user}
              <tr>
                <td>
                  {user.name} <!-- Display the user's name -->
                </td>
                <td>
                  {user.username} <!-- Display the user's username -->
                </td>
                <td>
                  <select id="teamId-{user.id}" class="form-select">
                    {#each teams as team}
                      <option value={team.id}>{team.name}</option> <!-- Display dropdown options for each team -->
                    {/each}
                  </select>
                </td>
                <td>
                  <!-- Display the appropriate button label based on the loading state -->
                  <button
                    class="btn btn-primary"
                    on:click={() => { handleAddUserToTeam(user.id) }}
                  >
                    {isLoading[user.id] ? "Loading..." : "Submit"}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
    </GlassCard>
    </div>
  </div>
</main>