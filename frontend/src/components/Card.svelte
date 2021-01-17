<script lang="ts">
  import clubIcon from '../assets/club.svg';
  import diamondIcon from '../assets/diamond.svg';
  import heartIcon from '../assets/heart.svg';
  import spadeIcon from '../assets/spade.svg';
  import type { CardSuit, CardValue } from '../types';

  export let suit: CardSuit;
  export let value: CardValue;
  export let classes: string | undefined = undefined;
  export let style: string | undefined = undefined;

  let card: HTMLDivElement;
</script>

<div
  class="card {suit} {classes ?? ''}"
  {style}
  bind:this={card}
  on:click
  on:mousedown
  data-value={value}
  data-suit={suit}
>
  <span class="top-text">{value}</span>
  {#if suit === 'club'}
    <img draggable="false" src={clubIcon} class={suit} alt="club" />
  {:else if suit === 'diamond'}
    <img draggable="false" src={diamondIcon} class={suit} alt="diamond" />
  {:else if suit === 'heart'}
    <img draggable="false" src={heartIcon} class={suit} alt="heart" />
  {:else if suit === 'spade'}
    <img draggable="false" src={spadeIcon} class={suit} alt="spade" />
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
    height: 154px;
    width: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 32px;

    // transition: transform 150ms ease-in-out;

    img {
      // border: 2px solid cool-gray(400);
      max-width: 60px;
      border-radius: 12px;
      // padding: 35px 12px;
      &.heart {
        max-width: 55px;
      }
      &.diamond {
        max-width: 65px;
      }
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
