<script lang="ts">
  import qs from 'qs';
  import { onDestroy } from 'svelte';
  import { push, querystring, replace } from 'svelte-spa-router';
  import { fade } from 'svelte/transition';
  import Button from '../components/Button.svelte';
  import Loading from '../components/Loading.svelte';
  import { game, gameId } from '../data';
  import { socket } from '../socket';
  import type { Bot, GameState, Player } from '../types';

  if ($querystring) {
    const parsed = qs.parse($querystring!);
    if (parsed.id) {
      $gameId = parsed.id.toString();
    }
  }

  $: url = `${window.location.protocol}//${window.location.host}/#/play?id=${$gameId}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
  };
  const start = () => {
    socket.emit('room-start');
    socket.on('room-start', (newGame: GameState) => {
      console.log('room-start');
      $game = newGame;
      push('#/game');
    });
  };
  const leave = () => {
    socket.emit('room-leave', { id: $gameId });
    push('#/play');
    $game = undefined;
    $gameId = undefined;
  };

  let players: (Player | Bot)[] | undefined = $game?.players;

  const onConnect = ({ id, game: newGame }: { id: string; game: GameState }) => {
    $game = newGame;
    players = newGame.players;
  };
  const updatePlayerList = (newGame: GameState) => {
    $game = newGame;
    players = newGame.players;
  };
  const redirectIfError = ({ error }: { error: string }) => {
    if (error.includes('invalid room code')) replace('#/play');
  };
  if (!$game) {
    socket.emit('room-connect', { id: $gameId, name: localStorage.getItem('name') ?? undefined });
  }

  socket.on('room-connect', onConnect);
  socket.on('room-spectate', onConnect);
  socket.on('update', updatePlayerList);
  socket.on('error', redirectIfError);
  onDestroy(() => {
    socket.off('room-connect', onConnect);
    socket.off('room-spectate', onConnect);
    socket.off('update', updatePlayerList);
    socket.off('error', redirectIfError);
  });
</script>

<div id="pregame" in:fade={{ duration: 100 }}>
  <div>
    <section>
      <h3>Game <code>{$gameId}</code></h3>
      <div class="url">
        <input value={url} />
        <Button raised intent="primary" on:click={copyUrl}>Copy</Button>
      </div>
      <div class="actions">
        <Button
          disabled={players && players[0].id !== socket.id}
          on:click={start}
          intent="success"
          raised
        >Start
        </Button>
        <Button on:click={leave} intent="error" raised>Leave</Button>
      </div>
    </section>
    <div class="players">
      {#if players}
        <div class="players-header">
          <h4>Players</h4>
          <Loading inline slow size={20} strokeWidth={4} />
        </div>
        {#each players as player}
          <span class="player"><strong>{player.name}</strong><span>{player.id}</span></span>
        {/each}
      {:else}
        <Loading inline />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import '../colors';

  #pregame {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  section {
    max-width: 65ch;
    h3 {
      text-align: center;
      margin: 8px 0;
    }
  }

  :global(button) {
    margin: 4px;
  }

  .url {
    display: flex;
    align-items: center;
    justify-content: center;

    & > * {
      display: inline-block;
    }
    input {
      padding: 4px;
      font-size: 0.85rem;
      margin: 4px;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 8px 0;

    & > :global(*) {
      margin-right: 4px;
      &:last-child {
        margin-right: 0;
      }
    }
  }

  .players {
    margin-top: 16px;
    .players-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      & > * {
        margin: 0;
        margin-right: 8px;
        display: inline-block;
      }
    }
    .player {
      display: block;
      span {
        margin-left: 16px;
        color: cool-gray(500);
      }
    }
  }
</style>
