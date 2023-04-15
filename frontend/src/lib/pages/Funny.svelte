<script lang="ts">
  import { onMount } from "svelte";
  import { isLoading } from "../../stores/loadingStore";
  import { Link, navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import settings from "../settings.json";

  let data = [];
  let error = "";

  onMount(() => {
    isLoading.set(true);
    fetch(`${settings.api_url}/submissions/funny`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then(async (res) => {
        if (res.ok) return (data = (await res.json()).submissions);
        if (res.status === 401 || res.status === 403)
          return navigate("/login", { replace: true });
        error = (await res.json()).message;
      })
      .catch((e) => (error = e))
      .finally(() => isLoading.set(false));
  });
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Funny submissions">
        <div class="row row-cols-4">
          {#each data as submission}
            <div class="card col mx-2" style="width: 18rem;">
              {#if /.*.(png|jpg|jpeg|gif|webp|avif|apng|bmp)$/i.test(submission?.fileLink)}
                <img
                  src={submission?.fileLink}
                  alt="Submission"
                  width="400"
                  style="max-height: 400px;"
                  class="card-img-top img-fluid"
                />
              {:else if /.*.(mp4|webm|ogg)$/i.test(submission?.fileLink)}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video src={submission?.fileLink} controls />
              {/if}
              <div class="card-body">
                <h5 class="card-title">
                  Team
                  <Link to={`/teams/${submission.team.id}`}>
                    {submission.team.name}
                  </Link>
                </h5>
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
