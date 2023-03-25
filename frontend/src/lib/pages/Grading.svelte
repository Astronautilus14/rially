<script lang="ts">
  import settings from "../settings.json"
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import socket from "../socket";
  import Submission from "./Submission.svelte";

  let mounted = false;

  let pending: {id: number, active: boolean, type: string}[] = []
  socket.on("submission", (id: number, type: string) => {
    pending = [...pending, {id, active: false, type }]
  })

  let toSetActive: {id: number, type: string}[] = []
  socket.on("grading-started", (id: number, type: string) => {
    if (mounted) return setActive(id, type);
    toSetActive.push({id, type})
    console.log(toSetActive)
  });

  socket.on("grading-finished", (id, type) => {
    pending = pending.filter(submission => submission.id !== id && submission.type !== type)
  });

  socket.on("grading-cancled", (id, type) => {setActive(id, type, false); console.log(id, type)})

  function setActive(id, type, value=true) {
    pending = pending.map(submission => {
      if (submission.id === id && submission.type === type) submission.active = value
      return submission
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
    .then(response => response.json())
    .then(data => {
      pending = [...pending, ...data.pending].reverse()
      mounted = true;
      for (const submission of toSetActive) {
        setActive(submission.id, submission.type)
      }
    }).catch(error => {
      console.error(error);
    });
});
</script>

<main>
  <h1>Grading</h1>
  <hr>
  {#each pending as submission}
    <div>
      <h2>New submission</h2>
      <p>{submission.type}</p>
      <button 
        class={submission.active ? "unclickable": ""}
        on:click={() => {grade(submission)}}
      >
        Grade
      </button>
    </div>
  {/each}
</main>

<style>
  button.unclickable {
    cursor: default;
    background-color: red;
  }
</style>