<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import Button from '../components/Button.svelte';
  import Card from '../components/Card.svelte';
  import CardBack from '../components/CardBack.svelte';
  import HowToPlay from '../components/HowToPlay.svelte';
  import { game, gameId } from '../data';
  import { socket } from '../socket';
  import { GameState, hierarchy } from '../types';
  import Confetti from 'confetti-js';

  // keep state in sync, go to home if not valid
  let state = $game!;
  if (!state) window.location.href = '/';
  $: if (!state) window.location.href = '/';
  $: {
    state = $game!;
  }

  let snackbarMessage: string | undefined;

  // rotations of cards in the middle
  let stackRotations: number[] = [];
  const getStackRotation = (index: number) => {
    if (stackRotations[index]) return stackRotations[index];
    return (stackRotations[index] = Math.random());
  };

  // me and the other players
  const meIndex = state.players.findIndex(player => player.id === socket.id)!;
  let me = state.players[meIndex];
  $: me = state.players[meIndex];
  let players = [...state.players.slice(meIndex! + 1), ...state.players.slice(0, meIndex)];
  $: players = [...state.players.slice(meIndex! + 1), ...state.players.slice(0, meIndex)];

  // $: players, console.log(meIndex);
  // $: console.log(state.players.slice(meIndex! + 1));
  // $: console.log(state.players.slice(0, meIndex));
  // $: console.log(players);

  // selected cards at the bottom
  let selectedCards: number[] = [];
  let handElement: HTMLDivElement;
  const resetSelected = () => {
    selectedCards = [];
    Array.from(document.querySelectorAll('.hand > .card')).forEach(el =>
      el.classList.remove('selected')
    );
  };

  // selection and deselection
  const onCardClick = (e: MouseEvent) => {
    let cardDiv = e.target as HTMLElement;

    // sometimes you can click the image or text on the card and not the card
    // select the parent element in that case (which would be the card)
    if (!cardDiv.classList.contains('card')) {
      cardDiv = cardDiv.parentElement!;
    }

    // pull suit and value from dom
    const cardSuit = cardDiv.getAttribute('data-suit')!;
    const cardValue = cardDiv.getAttribute('data-value')!;

    // find which card it is
    const index = me.hand.findIndex(({ suit, value }) => suit === cardSuit && value === cardValue);

    // if unselected
    if (!selectedCards.includes(index)) {
      // if card is less than the top card on the stack
      if (
        state.stack.length &&
        hierarchy.indexOf(me.hand[index].value) <
          hierarchy.indexOf(state.stack[state.stack.length - 1].value)
      ) {
        cardDiv.classList.add('invalid');
        setTimeout(() => cardDiv.classList.remove('invalid'), 200);
        return;
      }

      // if there are other cards selected and the new selected card doesn't match the rest of them
      if (selectedCards.length && me.hand[index].value !== me.hand[selectedCards[0]].value) {
        cardDiv.classList.add('invalid');
        setTimeout(() => cardDiv.classList.remove('invalid'), 200);
        return;
      }

      // select the card
      cardDiv.classList.add('selected');
      selectedCards.push(index);
      // console.log(cardDiv);
    } else {
      // unselect the card
      cardDiv.classList.remove('selected');
      selectedCards = selectedCards.filter(i => i !== index);
    }
  };

  // send selected cards to the server
  const sendInput = () => {
    // if its your turn, then you either play cards or pass
    if (state.players[state.turn].id == socket.id) {
      if (selectedCards.length > 0)
        socket.emit('input', { cards: selectedCards.map(index => me.hand[index]) });
      // no cards selected, just pass
      else socket.emit('input', { cards: [], pass: true });
    } else {
      // you are calling a flush
      if (!selectedCards.length) return;
      const top = state.stack.slice(state.stack.length - selectedCards.length);
      if (top.some(c => c.value !== me.hand[selectedCards[0]].value)) return;
      socket.emit('input', { cards: selectedCards.map(index => me.hand[index]), flush: true });
    }
    resetSelected();
  };

  // when server sends an update, rerender
  const update = (gameState: GameState) => {
    $game = gameState;
    state = gameState;
    // console.log(gameState);
  };

  // help dialog
  let helpShown = false;
  const toggleHelp = () => {
    helpShown = !helpShown;
  };

  const showError = ({ error }: { error: string }) => {
    snackbarMessage = error;
    setTimeout(() => (snackbarMessage = undefined), 3000);
  };

  let confetti: Confetti;

  const showWin = () => {
    confetti.render();
  };
  // get update after mounting
  onMount(() => {
    confetti = new Confetti({
      target: 'confetti-canvas',
      start_from_edge: true,
      max: 250,
      size: 1,
      animate: true,
      clock: 40,
      rotate: true,
      respawn: true,
    });
    socket.emit('update', { id: $gameId });
  });

  socket.on('update', update);
  socket.on('error', showError);
  socket.on('winner', showWin);
  onDestroy(() => {
    socket.off('update', update);
    socket.off('error', showError);
    socket.off('winner', showWin);
  });
</script>

<div id="game">
  <div class="bg" />
  <div id="snackbar" class:show={!!snackbarMessage}>{snackbarMessage}</div>
  <div class="modal" on:click={toggleHelp} class:visible={helpShown}>
    <div class="help">
      <!-- <div class="exit-button" on:click={toggleHelp}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <line x1="24" y1="6" x2="6" y2="24" />
          <line x1="6" y1="6" x2="24" y2="24" />
        </svg>
      </div> -->
      <HowToPlay />
    </div>
  </div>
  <div class="stack" on:click={sendInput}>
    <div class="turn-indicator">
      <p>
        {state.lastTurn ?? ''}
      </p>

      <span class:bold={state.players[state.turn].id === socket.id}>
        Turn {state.order === 1 ? '↩' : '↪'}: {state.players[state.turn].name}
      </span>
    </div>
    <div class="stack-cards">
      {#key state}
        {#each state.stack as card, index}
          <Card {...card} style="transform: rotate({getStackRotation(index)}turn)" />
        {/each}
      {/key}
    </div>
  </div>
  <div class="hand" bind:this={handElement}>
    {#key me}
      {#each me.hand as card}
        <Card {...card} on:mousedown={onCardClick} />
      {/each}
    {/key}
  </div>
  <div class="label-left">
    <span class:bold={state.players[state.turn].id === players[0]?.id}>
      {players[0]?.name ?? '...'}
    </span>
  </div>
  <div class="hand-left">
    {#each players[0]?.hand ?? [] as card}
      <div class="rotated-card">
        <CardBack />
      </div>
    {/each}
  </div>
  <div class="label-top">
    <span class:bold={state.players[state.turn].id === players[1]?.id}>
      {players[1]?.name ?? '...'}
    </span>
  </div>
  <div class="hand-top">
    {#key state}
      {#each players[1]?.hand ?? [] as card}
        <CardBack />
      {/each}
    {/key}
  </div>
  <div class="label-right">
    <span class:bold={state.players[state.turn].id === players[2]?.id}>
      {players[2]?.name ?? '...'}
    </span>
  </div>
  <div class="hand-right">
    {#key state}
      {#each players[2]?.hand ?? [] as card}
        <div class="rotated-card">
          <CardBack />
        </div>
      {/each}
    {/key}
  </div>
  <canvas id="confetti-canvas" style="z-index: 1000" />
  <Button raised classes="help-button" on:click={toggleHelp}>Instructions</Button>
</div>

<style lang="scss">
  @import '../colors';

  :global(body) {
    overflow-x: hidden;
  }

  .bold {
    font-weight: bold;
  }

  .bg {
    position: fixed;
    z-index: 1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

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

  @keyframes modal-anim {
    from {
      z-index: 0;
      opacity: 0;
    }
    1% {
      z-index: 3;
    }
    to {
      z-index: 3;
      opacity: 100%;
    }
  }

  .modal {
    opacity: 0;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.4);
    &.visible {
      animation: modal-anim 150ms ease-in-out forwards;
    }
    .help {
      position: relative;
      border-radius: 12px;
      background-color: cool-gray(100);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      padding-top: 0;
      width: 80%; /* Could be more or less, depending on screen size */
    }
  }

  #game {
    // width: 100%;
    // height: 100%;
    overflow: hidden;
  }

  div[class^='hand-'] {
    justify-content: center;
    position: absolute;
    display: flex;
    z-index: 2;
  }
  div[class^='label-'] {
    position: absolute;
    z-index: 2;
    & > span {
      display: block;
      margin-bottom: 4px;
    }
  }

  .label-left {
    left: 8px;
    top: 230px;
  }

  .label-top {
    left: 100px;
    right: 100px;
    text-align: center;
    top: 230px;
  }

  .label-right {
    right: 8px;
    text-align: right;
    top: 230px;
  }

  .hand-left {
    top: 10%;
    bottom: 10%;
    left: 30px;
    flex-direction: column-reverse;
    & > .rotated-card {
      height: 110px;
      width: 154px;
      :global(img) {
        transform: rotate(-90deg);
      }
      &:not(:first-child) {
        margin-bottom: -80px;
      }
    }
  }

  .hand-top {
    position: absolute;
    left: 30%;
    right: 30%;
    top: 8px;
    flex-direction: row;
    padding-top: 3rem;
    & > :global(*) {
      // transform: rotate(-180deg);
      &:not(:first-child) {
        margin-left: -80px;
      }
    }
  }

  .hand-right {
    top: 10%;
    bottom: 10%;
    right: 0px;
    flex-direction: column;
    & > .rotated-card {
      height: 110px;
      width: 154px;
      margin-right: -8px;
      :global(img) {
        transform: rotate(90deg);
      }
      &:not(:first-child) {
        margin-top: -80px;
      }
    }
  }

  .stack {
    position: absolute;
    left: 40%;
    right: 40%;
    top: 40%;
    bottom: 40%;
    margin: auto;
    z-index: 1;
    // width: 100px;
    // height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 8px;
    transition: filter 150ms ease-in-out;
    background-color: cool-gray(100);
    &:hover {
      filter: brightness(90%);
    }
    &:active {
      filter: brightness(80%);
    }
    .turn-indicator {
      position: absolute;
      top: -100px;
      max-width: 400px;
      text-align: center;
    }
    .stack-cards {
      position: relative;
      & > :global(*) {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin-left: -55px;
        margin-top: -77px;
      }
    }
  }

  .hand {
    position: absolute;
    left: 10%;
    right: 10%;
    bottom: 8px;
    justify-content: center;
    padding-top: 3rem;
    z-index: 1;
    display: flex;
    overflow-x: auto;
  }

  :global(.help-button) {
    position: absolute;
    right: 8px;
    bottom: 8px;
    z-index: 2;
  }

  :global(.hand .card) {
    cursor: pointer;
    z-index: 3;
    transition: transform 150ms ease-in-out, background-color 150ms ease-in-out;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    &.selected {
      transform: translateY(-3rem) !important;
    }
    &.invalid {
      background-color: red(200);
      transform: translateY(-2rem) !important;
    }
    &:hover {
      transform: translateY(-1rem);
      // & ~ :global(.card) {
      // transform: translateX(30px);
      // }
    }

    &:not(:first-child) {
      margin-left: -60px;
    }
  }
</style>
