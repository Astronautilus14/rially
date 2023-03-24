<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";

  import Register from "./lib/pages/Register.svelte";
  import Home from "./lib/pages/Home.svelte";
  import Grading from "./lib/pages/Grading.svelte";
  import Login from "./lib/pages/Login.svelte";
  import Submission from "./lib/pages/Submission.svelte";

  // Import our custom CSS
  import "./scss/styles.scss";
  import * as bootstrap from "bootstrap";
</script>

<Router>
  <div data-bs-theme="dark">
    <Route path="register" component={Register} />
    <Route path="grading" component={Grading} />
    <Route path="login" component={Login} />
    <Route path="submission/:type/:id" let:params>
      <Submission id={params.id} type={params.type} />
    </Route>
    <Route path="/" component={Home} />
  </div>
</Router>
