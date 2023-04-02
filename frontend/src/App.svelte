<script lang="ts">
  import { Router, Link, Route, navigate } from "svelte-routing";
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
  import { GearFill } from "svelte-bootstrap-icons";
  import { SvelteToast } from "@zerodevx/svelte-toast";

  // Import our custom CSS
  import "./scss/styles.scss";
  import * as bootstrap from "bootstrap";
  import RegisterCommittee from "./lib/pages/RegisterCommittee.svelte";
  import Settings from "./lib/pages/Settings.svelte";
  import PastSubmissions from "./lib/pages/PastSubmissions.svelte";

  export let url = "";
  const location = window.location.href.split("/");
  const path = location[location.length - 1];

  function logout() {
    localStorage.removeItem("rially::token");
    navigate("/login", { replace: true });
  }
</script>

<Router {url}>
  <SvelteToast />
  {#if path !== "login" && path !== "register" && $isLoggedIn}
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
            <Link to="/pastsubmissions" class="nav-link">Past Submissions</Link>
            <div class="right">
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <span class="nav-link clickable" on:click={logout}>Log out</span>
              <Link
                to="/settings"
                style="margin:auto;transform:translateY(-10%);"
                ><GearFill /></Link
              >
            </div>
          </div>
        </div>
      </div>
    </nav>
  {/if}
  <div data-bs-theme="dark" class="content">
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
    <Route path="settings" component={Settings} />
    <Route path="pastsubmissions" component={PastSubmissions} />
    <Route path="/" component={Home} />
  </div>
</Router>

<style>
  .clickable {
    cursor: pointer;
  }

  .right {
    position: absolute;
    right: 12px;
    display: flex;
    gap: 5px;
    color: white;
  }
</style>
