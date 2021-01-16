<script lang="ts">
  import AppBar from '../components/AppBar.svelte';

  export let appBar = false;
</script>

{#if appBar}
  <AppBar />
{/if}

<div>
  <h2>404 not found go away</h2>
</div>

<style lang="scss">
  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
      Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    margin: 0;
    background-color: #eee;
  }
  div {
    margin: 8px;
    margin-top: 64px;
  }
</style>
