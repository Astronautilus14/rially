<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";
  import { isLoggedIn } from "./stores/accountStore";

  import Register from "./lib/pages/Register.svelte";
  import Home from "./lib/pages/Home.svelte";
  import Grading from "./lib/pages/Grading.svelte";
  import Login from "./lib/pages/Login.svelte";
  import Submission from "./lib/pages/Submission.svelte";
  import People from "./lib/pages/People.svelte";
  import Teams from "./lib/pages/Teams.svelte";
  import Team from "./lib/pages/Team.svelte";
  import Funny from "./lib/pages/Funny.svelte";
  import Leaderboard from "./lib/pages/Leaderboard.svelte";
  import PublicTeam from "./lib/pages/PublicTeam.svelte";

  // Import our custom CSS
  import "./scss/styles.scss";
  import * as bootstrap from "bootstrap";
  import RegisterCommittee from "./lib/pages/RegisterCommittee.svelte";

  export let url = "";
  const location = window.location.href.split("/");
  const path = location[location.length - 1];
</script>

<Router {url}>
  {#if path !== "login" && path !== "register" && isLoggedIn}
    <div>
      <nav class="navbar navbar-expand-lg bg-primary">
        <div class="container-fluid">
          <Link to="/" class="navbar-brand mb-0 h1">RIAlly</Link>
          <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
              <Link to="/" class="nav-link">Home</Link>
              <Link to="/teams" class="nav-link">Teams</Link>
              <Link to="/people" class="nav-link">Lonely people</Link>
              <Link to="/grading" class="nav-link">Grading</Link>
              <Link to="/funny" class="nav-link">Funny</Link>
              <Link to="/leaderboard" class="nav-link">Leaderboard</Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  {/if}
  <div data-bs-theme="dark">
    <Route path="register/committee" component={RegisterCommittee} />
    <Route path="register" component={Register} />
    <Route path="grading" component={Grading} />
    <Route path="login" component={Login} />
    <Route path="submission/:type/:id" let:params>
      <Submission id={params.id} type={params.type} />
    </Route>
    <Route path="people" component={People} />
    <Route path="teams" component={Teams} />
    <Route path="teams/:id" let:params>
      <Team id={params.id} />
    </Route>
    <Route path="teams/:id/public" let:params>
      <PublicTeam id={params.id} />
    </Route>
    <Route path="funny" component={Funny} />
    <Route path="leaderboard" component={Leaderboard} />
    <Route path="/" component={Home} />
  </div>
</Router>
