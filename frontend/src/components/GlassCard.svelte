<script>
  import { Jumper } from "svelte-loading-spinners";
  import { isLoading } from "../stores/loadingStore";
  export let title = "";
  export let header = "";
  export let keepBootstrap = false;
</script>

<div>
  <div class={(keepBootstrap ? "" : "glass") + " card mx-auto mt-5 mb-5"}>
    {#if header}
      <div class="card-header">
        {header}
      </div>
    {/if}
    <div class="card-body">
      {#if title}
        <h3 class="card-title">{title}</h3>
        <hr />
      {/if}

      <div class={$isLoading ? "doShow" : "doHide"}>
        <Jumper color="#730acd" />
      </div>
      <div class={$isLoading ? "doHide" : "doShow"}>
        <slot />
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .glass {
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

  @keyframes showNav {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .doShow {
    display: block;
    animation: showNav 0.3s ease-in-out;
  }

  .doHide {
    display: none;
  }
</style>
