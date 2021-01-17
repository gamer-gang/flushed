<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import Button from '../components/Button.svelte';
  import Card from '../components/Card.svelte';
  import CardBack from '../components/CardBack.svelte';
  import HowToPlay from '../components/HowToPlay.svelte';
  import { game, gameId } from '../data';
  import { socket } from '../socket';
  import type { GameState } from '../types';

  let state = $game!;
  if (!state) window.location.href = '/';
  $: if (!state) window.location.href = '/';
  $: {
    state = $game!;
  }

  let stackRotations: number[] = [];
  const getStackRotation = (index: number) => {
    if (stackRotations[index]) return stackRotations[index];
    return (stackRotations[index] = Math.random());
  };

  $: me = state.players.find(player => player.id === socket.id)!;
  const meIndex = state.players.indexOf(me);
  $: players = [...state.players.slice(meIndex! + 1), ...state.players.slice(0, meIndex)];

  // $: console.log(state);

  let selectedCards: number[] = [];
  let handElement: HTMLDivElement;
  $: cardElements = handElement && Array.from(handElement.children);

  const resetSelected = () => {
    selectedCards = [];
    cardElements.forEach(el => el.classList.remove('selected'));
  };

  const onCardClick = (
    e: MouseEvent
    // e: CustomEvent<MouseEvent & { currentTarget: EventTarget & HTMLDivElement }>
  ) => {
    let cardDiv = e.target as HTMLElement;

    console.log(cardElements);

    if (!cardDiv.classList.contains('card')) {
      cardDiv = cardDiv.parentElement!;
    }

    console.log(cardDiv);
    const cardSuit = cardDiv.getAttribute('data-suit')!;
    const cardValue = cardDiv.getAttribute('data-value')!;
    const index = me.hand.findIndex(({ suit, value }) => suit === cardSuit && value === cardValue);

    if (!selectedCards.includes(index)) {
      if (selectedCards.length && me.hand[index].value !== me.hand[selectedCards[0]].value) {
        cardDiv.classList.add('invalid');
        setTimeout(() => cardDiv.classList.remove('invalid'), 200);
        return;
      }
      cardDiv.classList.add('selected');
      selectedCards.push(index);
    } else {
      cardDiv.classList.remove('selected');
      selectedCards = selectedCards.filter(i => i !== index);
    }

    console.log(selectedCards);
  };

  const sendInput = () => {
    // if its your turn, then you either play cards or pass
    if (state.players[state.turn].id == socket.id) {
      if (selectedCards.length > 0)
        socket.emit('input', {
          cards: selectedCards.map(index => me.hand[index]),
        });
      else socket.emit('input', { cards: [], pass: true });
    } else {
      // you are calling a flush
      if (!selectedCards.length) return;
      const top = state.stack.slice(state.stack.length - selectedCards.length, state.stack.length);
      if (top.some(c => c.value !== me.hand[selectedCards[0]].value)) return;
      socket.emit('input', { cards: selectedCards.map(index => me.hand[index]), flush: true });
    }
    resetSelected();
  };

  const update = (gameState: GameState) => {
    $game = gameState;
    state = gameState;
    console.log(gameState);
  };

  socket.on('update', update);

  let helpShown = false;
  const toggleHelp = () => {
    helpShown = !helpShown;
  };

  onMount(() => {
    socket.emit('update', { id: $gameId });
  });

  onDestroy(() => {
    socket.off('update', update);
    socket.emit('room-leave', { id: $gameId });
  });
</script>

<div id="game">
  <div class="bg" />
  <div class="modal" on:click={toggleHelp} class:visible={helpShown}>
    <div class="help">
      <div class="exit-button" on:click={toggleHelp}>
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
      </div>
      <HowToPlay />
    </div>
  </div>
  <div class="stack" on:click={sendInput}>
    <div class="turn-indicator">
      Turn: {state.players[state.turn].name}
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
        <Card {...card} on:click={onCardClick} />
      {/each}
    {/key}
  </div>
  <div class="label-left">
    <span>{players[1].name}</span>
  </div>
  <div class="hand-left">
    {#each players[1].hand as card}
      <div class="rotated-card">
        <CardBack />
      </div>
    {/each}
  </div>
  <div class="label-top">
    <span>{players[2].name}</span>
  </div>
  <div class="hand-top">
    {#key state}
      {#each players[2].hand as card}
        <CardBack />
      {/each}
    {/key}
  </div>
  <div class="label-right">
    <span>{players[3].name}</span>
  </div>
  <div class="hand-right">
    {#key state}
      {#each players[3].hand as card}
        <div class="rotated-card">
          <CardBack />
        </div>
      {/each}
    {/key}
  </div>
  <Button raised classes="help-button" on:click={toggleHelp}>Instructions</Button>
</div>

<style lang="scss">
  @import '../colors';

  :global(body) {
    overflow: hidden;
  }

  .bg {
    position: fixed;
    z-index: 1;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
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
      .exit-button {
        position: absolute;
        width: 48px;
        height: 48px;
        top: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 150ms ease-in-out;
        cursor: pointer;
        &:hover {
          background-color: cool-gray(200);
        }
      }
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
      top: -40px;
      max-width: 400px;
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
    transition: transform 150ms ease-out, background-color 150ms ease-out;
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
