<script>
  import QuoteCard from "../../components/QuoteCard.svelte";
  import GlassCard from "../../components/GlassCard.svelte";
  import { isLoggedIn } from "../../stores/accountStore";
  import { navigate } from "svelte-routing";
  import { onMount } from "svelte";

  onMount(() => {
    if (!$isLoggedIn) navigate("/login", { replace: true });
  });
</script>

<main class="container">
  <div class="row justify-content-md-center">
    <div class="col-12 col-sm-10">
      <GlassCard title="RIAlly">
        <p>
          If you don't see the navbar, please refresh.
        </p>
      </GlassCard>
      <QuoteCard />
    </div>
  </div>
</main>
