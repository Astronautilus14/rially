<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import settings from "../settings.json";
  import socket from "../socket";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";

  export let id: string;
  export let type: string;

  let submission;
  let loading = true;
  let error = "";
  let isFunny = false;
  let isGraded = false;

  onMount(async () => {
    fetch(`${settings.api_url}/submissions/${type}/${id}`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then(async (res) => {
        if (res.ok) return res.json();
        if (res.status === 401 || res.status === 403) return navigate("/login", {replace: true});
        error = (await res.json()).message;
      })
      .then((data) => {
        submission = data.submission;
        isFunny = data.submission.isFunny;
        isGraded = data.submission.grading ? true : false;
      })
      .finally(() => (loading = false));
  });

  function grade(score: number) {
    loading = true;

    fetch(`${settings.api_url}/submissions/grade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("rially::token"),
      },
      body: JSON.stringify({
        type: type,
        id: submission.id,
        grading: score,
        isFunny,
      }),
    })
      .then(() => {
        socket.emit("grading-finished", submission.id, submission.type);
        isGraded = true;
        navigate("/grading", { replace: true });
      })
      .catch((e) => (error = e))
      .finally(() => (loading = false));
  }

  function handleApprove(event) {
    const data = new FormData(event.target);
    const score = Number(data.get("score"));
    if (Number.isNaN(score)) return;
    grade(score);
  }

  onDestroy(() => {
    if (isGraded) return;
    socket.emit("grading-cancled", submission.id, type);
  });
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Submission">
        <div class="row">
          {#if loading}
            <p>Loading...</p>
          {:else}
            {#if error}
              <p class="error">{error}</p>
            {/if}
            <div class="col-md-3 col-6">
              <p>Location: {submission?.location}</p>
              <p>Team id: {submission?.teamId}</p>
              {#if type !== "puzzle"}
                <p>Grade: {submission?.grading ?? "not graded yet"}</p>
              {:else}
                <p>Status: {submission?.status}</p>
              {/if}
            </div>

            <div class="actions col-6 col-md-3">
              <label class="form-check-label" for="ifFunny">Is funny</label>
              <input
                type="checkbox"
                class="form-check-input"
                name="isFunny"
                bind:checked={isFunny}
              />
              {#if type !== "puzzle"}
                <form on:submit|preventDefault={handleApprove} class="">
                  <input
                    type="number"
                    name="score"
                    placeholder="Grade"
                    class="form-control mb-3"
                    required
                  />
                  <input
                    type="submit"
                    class="btn btn-primary mb-3"
                    value="Approve"
                  />
                </form>
              {:else}
                <button class="btn btn-success mb-3" on:click={() => grade(1)}
                  >Approve</button
                >
              {/if}

              <button class="btn btn-danger mb-3" on:click={() => grade(0)}
                >Decline</button
              >
            </div>

            <div class="col-12 col-md-6">
              {#if /.*.(png|jpg|jpeg|gif|webp|avif|apng|bmp)$/i.test(submission?.fileLink)}
                <img
                  class="img-fluid"
                  style="max-height: 60vh; max-width: 40vw;"
                  src={submission?.fileLink}
                  alt="Submission"
                />
              {:else if /.*.(mp4|webm|ogg)$/i.test(submission?.fileLink)}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video src={submission?.fileLink} controls />
              {/if}
            </div>
          {/if}
        </div>
      </GlassCard>
    </div>
  </div>
</main>

<style lang="scss">
  .error {
    color: red;
  }
</style>
