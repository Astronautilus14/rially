<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import settings from "../settings.json";
  import { io } from "socket.io-client";
  import { navigate } from "svelte-routing";
  import GlassCard from "../../components/GlassCard.svelte";
  import { Link } from "svelte-routing";

  export let id: string;
  export let type: string;

  const socket = io(settings.socketServerUrl)

  let submission;
  let loading = true;
  let error = "";
  let isFunny = false;
  let isGraded = false;
  let speedPlace: number;

  onMount(async () => {
    fetch(`${settings.api_url}/submissions/${type}/${id}`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then(async (res) => {
        if (res.ok) return res.json();
        if (res.status === 401 || res.status === 403)
          return navigate("/login", { replace: true });
        error = (await res.json()).message;
      })
      .then((data) => {
        submission = data.submission;
        isFunny = data.submission.isFunny;
        isGraded = data.submission.grading ? true : false;
        speedPlace = data.speedPlace;
      })
      .finally(() => (loading = false));
  });

  function grade(score: number) {
    if(loading) return;
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
              {#if submission?.location}
                <p>Location: {submission?.location}</p>
              {/if}
              {#if submission?.number}
                <p>Number: {submission?.number}</p>
              {/if}
              <p>Team: <Link to={`/teams/${submission?.team.id}`}>{submission?.team?.name}</Link></p>
              <p>Grade: {submission?.grading ?? "not graded yet"}</p>
              <p>
                Speed place: {speedPlace}{speedPlace === 1
                  ? "st"
                  : speedPlace === 2
                  ? "nd"
                  : speedPlace === 3
                  ? "rd"
                  : "th"}
              </p>
              <p>
                Submission time: {new Date(submission?.timeSubmitted)
                  .toTimeString()
                  .split(" ")[0]}
              </p>
            </div>

            <div class="actions col-6 col-md-3">
              <label class="form-check-label" for="ifFunny">Is funny</label>
              <input
                type="checkbox"
                class="form-check-input"
                name="isFunny"
                bind:checked={isFunny}
              />
              <form on:submit|preventDefault={handleApprove} class="">
                <input
                  type="number"
                  value={type === "puzzle"
                    ? (5 + Math.max(4 - speedPlace, 0)).toString()
                    : null}
                  name="score"
                  placeholder="Grade"
                  class="form-control mb-3"
                  min="1"
                  required
                />
                <input
                  type="submit"
                  class="btn btn-primary mb-3"
                  value={isGraded ? "Regrade" : "Approve"}
                />
              </form>

              {#if !isGraded}
                <button class="btn btn-danger mb-3" on:click={() => grade(0)}
                  >Decline</button
                >
              {/if}
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
              {:else}
                <p>
                  File type not supported. Click <a href={submission?.fileLink}
                    >here</a
                  > to download it.
                </p>
              {/if}
            </div>
          {/if}
        </div>
      </GlassCard>
    </div>
  </div>
</main>
