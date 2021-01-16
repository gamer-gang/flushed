<script lang="ts">
  import { onMount } from 'svelte';
  import type { CardSuit, CardValue } from '../../../server/src/types';
  import clubIcon from '../assets/club.svg';
  import diamondIcon from '../assets/diamond.svg';
  import heartIcon from '../assets/heart.svg';
  import spadeIcon from '../assets/spade.svg';

  export let suit: CardSuit;
  export let value: CardValue;

  let card: HTMLDivElement;

  onMount(() => {
    card.addEventListener('click', e => {
      console.log('sssssssssssssssssssssssssssssssssssssssssss');
    });
  });
</script>

<div class={suit} bind:this={card}>
  <span class="top-text">{value}</span>
  {#if suit === 'club'}
    <img draggable="false" src={clubIcon} alt="club" />
  {:else if suit === 'diamond'}
    <img draggable="false" src={diamondIcon} alt="diamond" />
  {:else if suit === 'heart'}
    <img draggable="false" src={heartIcon} alt="heart" />
  {:else if suit === 'spade'}
    <img draggable="false" src={spadeIcon} alt="spade" />
  {/if}
  <span class="bottom-text">{value}</span>
</div>

<style lang="scss">
  @import '../colors';

  div {
    user-select: none;
    background-color: white;
    position: relative;
    z-index: 1000;
    border: 2px solid cool-gray(400);
    border-radius: 12px;
    height: 350px;
    width: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    cursor: pointer;
    font-size: 32px;

    transition: transform 150ms ease-in-out;

    &:hover {
      transform: scale(1.2);
    }

    img {
      border: 2px solid cool-gray(400);
      border-radius: 12px;
      padding: 45px 10px;
    }

    &.heart span,
    &.diamond span {
      color: red(600);
    }

    &.club span,
    &.spade span {
      color: black;
    }

    .top-text {
      position: absolute;
      top: 8px;
      left: 8px;
    }

    .bottom-text {
      position: absolute;
      bottom: 8px;
      right: 8px;
      transform: rotate(180deg);
    }
  }
</style>
