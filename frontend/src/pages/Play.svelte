<script lang="ts">
  import { fade } from 'svelte/transition';
  import PlayDialog from '../components/PlayDialog.svelte';
  import { game, gameId, socket, spectator } from '../data';
  import type { GameState } from '../data';

  $: console.log('id change: ' + $gameId);
  $: console.log('game state change:'), console.log($game);
  $: console.log('spectate change: ' + $spectator);

  socket.on('connect', () => {
    console.log('connected');
    // socket.emit('room-connect', { id: 'asdasdasdasd' });
  });

  socket.on('room-connect', ({ id, game: newGame }: { id: string; game: GameState }) => {
    $game = newGame;
    $gameId = id;
    $spectator = false;
    const me = $game!.players.filter(p => p.id === socket.id)[0];
    socket.emit('input', { card: me.hand[0], number: me.hand.length - 1 });
  });

  socket.on('room-spectate', ({ id, game: newGame }: { id: string; game: GameState }) => {
    $game = newGame;
    $gameId = id;
    $spectator = true;
  });

  socket.on('error', ({ error }: { error: string }) => console.error(error));
</script>

<div id="play" in:fade={{ duration: 100 }}>
  {#if !$game?.started}
    <PlayDialog />
  {:else}
    {#key $game}
      <pre>{JSON.stringify($game, null, 2)}</pre>
    {/key}
  {/if}
</div>

<style lang="scss">
  @import '../colors';

  :global(body) {
    overflow: hidden;
  }

  #play {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
