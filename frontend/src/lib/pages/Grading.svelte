<script lang="ts">
  import settings from "../settings.json"
  import { io } from "socket.io-client"
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";

  const socket = io(settings.socketServerUrl)

  let pending: {id: number, active: boolean, type: string}[] = []
  socket.on("submission", (id: number, type: string) => {
    pending = [...pending, {id, active: false, type }]
  })

  socket.on("grading-started", (id) => {
    pending = pending.map(submission => {
      if (submission.id === id) submission.active = true
      return submission
    })
  })

  socket.on("grading-finished", (id) => {
    pending = pending.filter(submission => submission.id !== id)
  })

  function grade(submission: any) {
    if (submission.active) return;
    socket.emit("grading-started", submission.id, submission.type);
    navigate(`/submission/${submission.type}/${submission.id}`)
  }

  onMount(async () => {
  fetch(`${settings.api_url}/submissions`, {
    headers: {
      Authorization: localStorage.getItem("rially::token")
    }
  })
  .then(response => response.json())
  .then(data => {
		pending = [...pending, ...data.pending]
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