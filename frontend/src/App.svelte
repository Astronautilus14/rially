<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";

  import Register from "./lib/pages/Register.svelte";
  import Home from "./lib/pages/Home.svelte";
  import Grading from "./lib/pages/Grading.svelte";
  import Login from "./lib/pages/Login.svelte";
  import Submission from "./lib/pages/Submission.svelte";
  import People from "./lib/pages/People.svelte";
  import Teams from "./lib/pages/Teams.svelte";
  import Team from "./lib/pages/Team.svelte";
</script>

<Router>
  <Link to="/teams">Teams</Link>
  <Link to="/people">Lonely people</Link>
  <Link to="/grading">Grading</Link>
  <div>
    <Route path="register" component="{Register}" />
    <Route path="grading" component="{Grading}" />
    <Route path="login" component="{Login}" />
    <Route path="submission/:type/:id" let:params>
      <Submission id="{params.id}" type="{params.type}" />
    </Route>
    <Route path="/people" component="{People}" />
    <Route path="/teams" component="{Teams}" />
    <Route path="/teams/:id" let:params>
      <Team id="{params.id}" />
    </Route>
    <Route path="/" component="{Home}" />
  </div>
</Router>