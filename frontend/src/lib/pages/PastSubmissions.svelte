<script lang="ts">
  import settings from "../settings.json";
  import { onMount } from "svelte";
  import { Link, navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";

  //   let subs: { id: number; active: boolean; type: string }[] = [];
  let subs = [];
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
        subs = [...subs, ...data.pending];
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
              {#each subs as submission}
                <tr>
                  <td>
                    <Link to={`/teams/${submission.team.id}/public`}>
                      {submission.team.name}
                    </Link>
                  </td>
                  <td>{submission.type}</td>
                  <td>
                    {#if /.*.(png|jpg|jpeg|gif|webp|avif|apng|bmp)$/i.test(submission?.fileLink)}
                      <img
                        class="img-fluid"
                        style="max-height: 30vh; max-width: 40vw;"
                        src={submission?.fileLink}
                        alt="Submission"
                      />
                    {:else if /.*.(mp4|webm|ogg)$/i.test(submission?.fileLink)}
                      <!-- svelte-ignore a11y-media-has-caption -->
                      <video src={submission?.fileLink} controls />
                    {:else}
                      <p>
                        File type not supported. Click <a
                          href={submission?.fileLink}>here</a
                        > to download it.
                      </p>
                    {/if}
                  </td>
                  <td>
                    <Link to={`/${submission?.type}/${submission?.id}`}>More</Link>
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
