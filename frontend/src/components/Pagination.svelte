<script lang="ts">
  import { Link } from "svelte-routing";
  export let p: number;
  export let url: string;
</script>

<div class="pagination">
  {#if p > 1}
    <a href="{url}?p={p - 1}">
      Previous
    </a>
  {/if}
  <Link to="{url}?p={p}">
    {p}
  </Link>
  <a href="{url}?p={p + 1}">
    Next
  </a>
</div>

<style>
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
</style>