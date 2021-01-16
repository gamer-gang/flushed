<script lang="ts">
  import type { AxiosResponse } from 'axios';
  import axios from 'axios';
  import qs from 'qs';
  import { io } from 'socket.io-client';
  import { querystring } from 'svelte-spa-router';
  import { fade } from 'svelte/transition';
  import type { GameState } from '../../../server/src/types';
  import PlayDialog from '../components/PlayDialog.svelte';
  import { game, gameId, spectator } from '../game';

  const endpoint = import.meta.env.SNOWPACK_PUBLIC_API_URL;

  const socket = io(endpoint, { transports: ['websocket', 'polling'] });

  let promise: Promise<AxiosResponse<any>>;

  if ($querystring) {
    const parsed = qs.parse($querystring!);
    if (parsed.id) $gameId = parsed.id.toString();
  } else {
    promise = axios.get(`${endpoint}/api/generate-room-code`);
  }

  $: inGame = $gameId;
  $: console.log('id change: ' + $gameId);
  $: console.log('game state change:'), console.log($game);
  $: console.log('spectate change: ' + $spectator);

  socket.on('connect', () => {
    console.log('connectedP');
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
  {#if !inGame}
    {#if promise}
      {#await promise then res}
        <PlayDialog createId={res.data.id} />
      {/await}
    {:else}
      <PlayDialog createId={'adasdasdasdasda'} />
    {/if}
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
