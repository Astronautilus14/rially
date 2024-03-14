<script lang="ts">
  import settings from "../settings.json";
  import { onMount } from "svelte";
  import { Link, navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import type { Submission } from "../types";
  import FileDisplay from "../../components/FileDisplay.svelte";

  let submissions: Submission[] = [];
  let error = "";

  onMount(async () => {
    fetch(`${settings.api_url}/submissions/past`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then(async (response) => {
        if (response.ok) return response.json();
        if (response.status === 403 || response.status === 401)
          return navigate("/login", { replace: true });
        throw new Error((await response.json()).message);
      })
      .then((data) => {
        submissions = [...submissions, ...data.pending];
      })
      .catch((error) => {
        console.error(error);
      });
  });
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Past submissions">
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <ul class="list-group mb-3">
          <table class="table table-striped table-bordered border-white">
            <thead>
              <tr>
                <th scope="col">Team</th>
                <th scope="col">Type</th>
                <th scope="col">Submission</th>
                <th scope="col">More</th>
              </tr>
            </thead>
            <tbody>
              {#each submissions as submission}
                <tr>
                  <td>
                    <Link to={`/teams/${submission.Team.id}/public`}>
                      {submission.Team.name}
                    </Link>
                  </td>
                  <td>{submission.type}</td>
                  <td>
                    <FileDisplay fileLink={submission.fileLink} />
                  </td>
                  <td>
                    <Link to={`/submission/${submission?.type}/${submission?.id}`}>More</Link>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </ul>
      </GlassCard>
    </div>
  </div>
</main>
