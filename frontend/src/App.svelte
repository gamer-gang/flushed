<script lang="ts">
  import type { RouteDefinition } from 'svelte-spa-router';
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import AppBar from './components/AppBar.svelte';
  import Loading from './components/Loading.svelte';
  import Home from './pages/Home.svelte';

  const routes: RouteDefinition = {
    '/': Home,
    '/play': wrap({
      asyncComponent: () => import('./pages/Play.svelte'),
      loadingComponent: Loading,
    }),
    '/pregame': wrap({
      asyncComponent: () => import('./pages/Pregame.svelte'),
      loadingComponent: Loading,
    }),
    '/game': wrap({
      asyncComponent: () => import('./pages/Game.svelte'),
      loadingComponent: Loading,
    }),
    '*': wrap({
      asyncComponent: () => import('./pages/NotFound.svelte'),
      loadingComponent: Loading,
    }),
  };
</script>

<AppBar />
<main>
  <Router {routes} />
</main>

<style lang="scss" global>
  @import './normalize';
  @import './colors';

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
      Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: cool-gray(100);
  }
  main {
    margin: 8px;
    margin-top: 64px;
  }
</style>
