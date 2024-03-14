<script lang="ts">
  export let fileLink: string;
  const photoRegex = /.*.(png|jpg|jpeg|gif|webp|avif|apng|bmp)(\?+|$)/;
  const videoRegex = /.*.(mp4|webm|ogg)(\?+|$)/;
</script>

{#if photoRegex.test(fileLink)}
  <img
    class="img-fluid"
    style="max-height: 30vh; max-width: 40vw;"
    src={fileLink}
    alt="Submission"
  />
{:else if videoRegex.test(fileLink)}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video src={fileLink} controls />
{:else}
  <p>
    File type not supported. Click <a
      href={fileLink}>here</a
    > to download it.
  </p>
{/if}