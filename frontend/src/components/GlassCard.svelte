<script>
  export let title = "";
  export let header = "";
</script>

<div>
  <div class="card mx-auto mt-5">
    {#if header}
      <div class="card-header">
        {header}
      </div>
    {/if}
    <!-- <div class="card-header">
    </div> -->
    <div class="card-body">
      {#if title}
        <h3 class="card-title">{title}</h3>
        <hr />
      {/if}
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  .card {
    /* From https://css.glass */
    //   background: rgba(248, 42, 255, 0.34);
    background: #140835ae;
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(6.7px);
    -webkit-backdrop-filter: blur(6.7px);
    border: 1px solid #470ca0a8;

    color: #fff;
  }
</style>
