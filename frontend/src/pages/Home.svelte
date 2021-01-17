<script>
  import { push } from 'svelte-spa-router';
  import cardsIcon from '../assets/cards.svg';
  import Button from '../components/Button.svelte';
  import HowToPlay from '../components/HowToPlay.svelte';
  import { game, gameId, spectator } from '../data';
  import { socket } from '../socket';

  if ($game) {
    socket.emit('room-leave', { id: $gameId });
    $spectator = undefined;
    $game = undefined;
    $gameId = undefined;
  }
</script>

<div id="home">
  <header>
    <img src={cardsIcon} alt="icon" width="300" height="300" />
    <h1>Flushed!</h1>
    <Button large raised on:click={() => push('#/play')} intent="success">
      <svg
        style="margin-right: 8px"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="css-i6dzq1">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      Play
    </Button>
  </header>
  <div class="content">
    A real-time, multiplayer implementation of the president/scum/tycoon card game with 1-4 players.
    <br />
    Not made for phones and small screens.
    <div class="how2play">
      <h2>How to play</h2>
      <HowToPlay />
    </div>
  </div>
</div>

<style lang="scss">
  #home,
  .content,
  header {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-bottom: 20px;
  }
  h1 {
    margin-bottom: 16px;
  }

  header,
  .content {
    max-width: 65ch;
  }
</style>
