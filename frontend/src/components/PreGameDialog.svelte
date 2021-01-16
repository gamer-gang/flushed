<script lang="ts">
  import { gameId } from '../data';

  $: createUrl = `${window.location.protocol}//${window.location.host}/#play?id=${$gameId}`;
</script>

<section>
  <input value={createUrl} />
  <button>Copy</button>
  <button>Start</button>
</section>

<style lang="scss">
</style>
