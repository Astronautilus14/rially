<script lang="ts">
  import settings from "../settings.json";
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import socket from "../socket";
  import GlassCard from "../../components/GlassCard.svelte";

  let mounted = false;
  let pending: { id: number; active: boolean; type: string }[] = [];
  let error = "";

  socket.on("submission", (id: number, type: string) => {
    let temp: { id: number; active: boolean; type: string }[] = [];
    let pushed = false;
    const newSubmission = {id, type, active: false};

    // My fanstic algorithm to put the new submission in the correct place.
    // The order is puzzle, challange, crazy88 with in each categorie the oldest on top.
    if (type === "crazy88") return pending = [...pending, newSubmission];

    for (const submission of pending) {
      if (!pushed) {
        if (type === "puzzle" && submission.type !== "puzzle") {
          pushed = true;
          temp.push(newSubmission);
        }
        if (type === "challange" && submission.type === "crazy88") {
          pushed = true;
          temp.push(newSubmission);
        }
      }
      temp.push(submission);
    }
    if (!pushed) temp.push({id, type, active: false});
    pending = temp;
  });

  let toSetActive: { id: number; type: string }[] = [];
  socket.on("grading-started", (id: number, type: string) => {
    if (mounted) return setActive(id, type);
    toSetActive.push({ id, type });
  });

  socket.on("grading-finished", (id: number, type: string) => {
    pending = pending.filter(
      (submission) => submission.id !== id && submission.type !== type
    );
  });

  socket.on("grading-cancled", (id: number, type: string) => {
    setActive(id, type, false);
  });

  function setActive(id: number, type: string, value = true) {
    pending = pending.map((submission) => {
      if (submission.id === id && submission.type === type)
        submission.active = value;
      return submission;
    });
  }

  function grade(submission: any) {
    if (submission.active) return;
    socket.emit("grading-started", submission.id, submission.type);
    navigate(`/submission/${submission.type}/${submission.id}`);
  }

  onMount(async () => {
    fetch(`${settings.api_url}/submissions`, {
      headers: {
        Authorization: localStorage.getItem("rially::token"),
      },
    })
      .then( async (response) => {
        if (response.ok) return response.json();
        if (response.status === 403 || response.status === 401) return navigate("/login", {replace: true});
        throw new Error((await response.json()).message);
      })
      .then((data) => {
        pending = [...pending, ...data.pending];
        mounted = true;
        for (const submission of toSetActive) {
          setActive(submission.id, submission.type);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
</script>

<main class="contianer">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="Grading">
        {#if error}
        <p class="error">{error}</p>
        {/if}
        {#if pending.length === 0}
        <p><i>There are no new submissions...</i></p>
        {/if}
        <ul class="list-group mb-3">
          {#each pending as submission}
            <li class="list-group-item">
              <div>
                <span class="badge bg-secondary">
                  {submission.type} submission
                </span>
                <button
                  class={(submission.active ? "unclickable" : "") +
                    " btn btn-primary"}
                  on:click={() => {
                    grade(submission);
                  }}
                >
                  Grade
                </button>
              </div>
            </li>
          {/each}
        </ul>
      </GlassCard>
    </div>
  </div>
</main>

<style>
  button.unclickable {
    cursor: default;
    background-color: red;
  }
</style>
