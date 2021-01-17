<script lang="ts">
  import { game, gameId, spectator } from '../data';
  import { socket } from '../socket';
  import type { GameState } from '../types';
  import Button from '../components/Button.svelte';
  import { push, querystring } from 'svelte-spa-router';
  import qs from 'qs';
  import { fade } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  let showCreate = true;

  let createName: string | undefined = localStorage.getItem('name') ?? undefined;
  let createNameErrors: string[] = [];
  let joinId: string | undefined;
  let joinIdErrors: string[] = [];
  let joinName: string | undefined = localStorage.getItem('name') ?? undefined;
  let joinNameErrors: string[] = [];
  // let spectate = false;

  // const toggleSpectate = () => (spectate = !spectate);

  const create = () => {
    createName && localStorage.setItem('name', createName);
    socket.emit('room-create', { name: createName });
  };
  const join = () => {
    joinName && localStorage.setItem('name', joinName);
    socket.emit('room-connect', { id: joinId, name: joinName });
  };

  if ($querystring) {
    const parsed = qs.parse($querystring!);
    if (parsed.id) {
      joinId = parsed.id.toString();
      showCreate = false;
    }
  }

  const connectOnCreate = ({ id }: { id: string }) =>
    socket.emit('room-connect', { id, name: createName });

  const roomConnect = ({ id, game: newGame }: { id: string; game: GameState }) => {
    $game = newGame;
    $gameId = id;
    $spectator = false;
    push(`#/pregame?id=${id}`);
  };

  const roomSpectate = ({ id, game: newGame }: { id: string; game: GameState }) => {
    $game = newGame;
    $gameId = id;
    $spectator = true;
    push(`#/pregame?id=${id}`);
  };

  let snackbarMessage: string | undefined;
  const showError = ({ error }: { error: string }) => {
    snackbarMessage = error;
    setTimeout(() => (snackbarMessage = undefined), 3000);
  };

  socket.on('room-create', connectOnCreate);
  socket.on('room-connect', roomConnect);
  socket.on('room-spectate', roomSpectate);
  socket.on('error', showError);

  onDestroy(() => {
    socket.off('room-create', connectOnCreate);
    socket.off('room-connect', roomConnect);
    socket.off('room-spectate', roomSpectate);
    socket.off('error', showError);
  });
</script>

<div id="play" in:fade={{ duration: 100 }}>
  <div id="snackbar" class:show={!!snackbarMessage}>{snackbarMessage}</div>
  <section>
    {#if showCreate}
      <div class="create">
        <h4>Create game</h4>
        <input id="create-name" placeholder="Your name" bind:value={createName} />
        {#if createNameErrors.length}
          <label for="create-name" class="error-label">{createNameErrors.join('\n')}</label>
        {/if}
        <Button on:click={create} raised intent="success">Create</Button>
      </div>
      <div class="divider">
        <div class="line" />
        <span>OR</span>
        <div class="line" />
      </div>
    {/if}
    <div class="join">
      <h4>Join game</h4>
      <input id="join-id" placeholder="Code" bind:value={joinId} />
      {#if joinIdErrors.length}
        <label for="join-id" class="error-label">{joinIdErrors.join('\n')}</label>
      {/if}

      <!-- <div id="spectate-wrapper" on:click={toggleSpectate}>
        <input type="checkbox" bind:checked={spectate} /> <span>Spectate</span>
      </div> -->

      <input id="join-name" placeholder="Your name" bind:value={joinName} />
      {#if joinNameErrors?.length}
        <label for="join-name" class="error-label">{joinNameErrors.join('\n')}</label>
      {/if}

      <Button on:click={join} raised intent="primary">Join</Button>
    </div>
  </section>
</div>

<style lang="scss">
  @import '../colors';

  $breakpoint: 760px;

  #snackbar {
    visibility: hidden;
    background-color: cool-gray(800);
    color: white;
    text-align: center;
    border-radius: 8px;
    padding: 16px;
    position: fixed;
    z-index: 1;
    left: 8px;
    bottom: 8px;

    &.show {
      visibility: visible;
      animation: fadein 0.5s, fadeout 0.5s 2.5s;
    }
  }

  @keyframes fadein {
    from {
      bottom: 0;
      opacity: 0;
    }
    to {
      bottom: 8px;
      opacity: 1;
    }
  }

  @keyframes fadeout {
    from {
      bottom: 8px;
      opacity: 1;
    }
    to {
      bottom: 0;
      opacity: 0;
    }
  }

  #play {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  section {
    @media screen and (max-width: $breakpoint) {
      flex-direction: column;
      max-width: 300px;
    }
    display: flex;
    & > * {
      margin: 0 8px;
    }

    width: 700px;
    height: 400px;
    padding-top: 48px;
    .create,
    .join {
      & > * {
        margin: 8px 0;
      }

      h4 {
        margin-top: 8px;
        margin-bottom: 16px;
      }

      input,
      span,
      label {
        max-width: 224px;
        padding: 4px;
        font-size: 0.85rem;
        margin: 0px;
      }

      #join-name {
        margin-top: 16px;
      }

      label {
        margin: 4px 0;
      }

      :global(button) {
        margin-top: 16px;
      }

      div {
        cursor: pointer;
        input {
          margin-right: 8px;
        }
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      width: auto;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .divider {
      flex-grow: 0;
      display: flex;
      @media screen and (max-width: $breakpoint) {
        flex-direction: row;
        margin: 16px 0;
        span {
          padding: 0 16px !important;
        }
        .line {
          height: 1px;
        }
      }
      flex-direction: column;
      align-items: center;
      justify-content: center;
      span {
        padding: 8px 0;
        color: cool-gray(400);
        letter-spacing: 0.05em;
      }
      .line {
        width: 1px;
        flex-grow: 1;
        background-color: cool-gray(400);
      }
    }
  }
</style>
