<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-routing";
  import { isLoggedIn } from "../../stores/accountStore";
  import { isLoading } from "../../stores/loadingStore";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";

  let data;
  let error = "";
  let isPublic = true;

  onMount(async () => {
    isLoading.set(true);
    await fetchStanding();
    isLoading.set(false);
    setInterval(fetchStanding, 2 * 60 * 1000);
  });

  async function fetchStanding() {
    fetch(`${settings.api_url}/leaderboard${$isLoggedIn ? "" : "/public"}`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then(async (res) => {
        if (res.ok) return res.json();
        throw new Error((await res.json()).message);
      })
      .then((body) => {
        error = body.message;
        if (error) return;
        data = body.teams;
        isPublic = body.isPublic ?? true;
      })
      .catch((e) => (error = e));
  }

  function handlePublicSwitch() {
    isPublic = !isPublic;
    isLoading.set(true);
    fetch(`${settings.api_url}/leaderboard`, {
      method: "PATCH",
      headers: {
        Authorization: localStorage.getItem("rially::token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        setPublic: isPublic,
      }),
    })
      .then(async (res) => {
        if (res.ok) return;
        throw new Error((await res.json()).message);
      })
      .catch((e) => {
        error = e;
        isPublic = !isPublic;
      })
      .then(() => isLoading.set(false));
  }
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Leaderboard">
        {#if error}
          <p class="error">{error}</p>
        {/if}
        {#if $isLoggedIn}
          <div class="mb-5">
            <h3>Public leaderboard</h3>
            <label class="switch">
              <input
                type="checkbox"
                bind:checked={isPublic}
                on:click={handlePublicSwitch}
              />
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
                  <td>{i + 1}</td>
                  <td>
                    <Link to={`/teams/${team.id}/public`}>{team.name}</Link>
                  </td>
                  <td>{team.score}</td>
                </tr>
              {/each}
            </tbody>
          {/if}
        </table>
      </GlassCard>
    </div>
  </div>
</main>

<style>
  /* W3 schools copy pasta */
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: #2196f3;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #2196f3;
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>
