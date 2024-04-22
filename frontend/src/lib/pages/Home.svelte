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
          Well there is actually nothing to show on the home page. So I type
          this text so it looks like there is actual content. This is part of my
          study avoiding behavior. Kaas
        </p>
      </GlassCard>
      <QuoteCard />
    </div>
  </div>
</main>
