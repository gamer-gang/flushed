<script lang="ts">
  import qs from 'qs';
  import { io } from 'socket.io-client';
  import { querystring } from 'svelte-spa-router';
  import type { GameState } from '../../../server/src/types';

  const socket = io('http://localhost:8080');
  let clientState: { id?: string; game?: GameState; spectate?: boolean } = {};

  if ($querystring) {
    const parsed = qs.parse($querystring!);
    if (parsed.id) clientState.id = parsed.id.toString();
  }

  $: inGame = !!clientState.id;

  socket.on('connect', () => {
    console.log('connected');
    socket.emit('room-connect');
    socket.on('room-connect', ({ id, game }: { id: string; game: GameState }) => {
      clientState.game = game;
      clientState.id = id;
      clientState.spectate = false;
    });

    socket.on('room-spectate', ({ id, game }: { id: string; game: GameState }) => {
      clientState.game = game;
      clientState.id = id;
      clientState.spectate = true;
    });
  });

  socket.on('error', alert);
</script>

{#if !inGame}
  <section>
    <h4>Create game</h4>
    <div>
      <div />
      <span>OR</span>
      <div />
    </div>
    <h4>Join game</h4>
  </section>
{:else}
  {#key clientState.game}
    <pre>{JSON.stringify(clientState.game, null, 2)}</pre>
  {/key}
{/if}

<style lang="scss">
  :global(body) {
    overflow: hidden;
  }

  // section {
  // }
</style>
