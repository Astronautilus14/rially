<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";

  import Register from "./lib/pages/Register.svelte";
  import Home from "./lib/pages/Home.svelte";
</script>

<Router>
  <div>
    <Route path="register" component="{Register}" />
    <Route path="/" component="{Home}" />
  </div>
</Router>