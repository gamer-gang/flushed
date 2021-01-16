<script>
  import { fade } from 'svelte/transition';
</script>

<div in:fade={{ duration: 100 }} class="loading-wrapper">
  <div class="spinner">
    <div class="spinner-animation">
      <svg
        class="spinner-svg"
        width="50"
        height="50"
        stroke-width="8.00"
        viewBox="1.00 1.00 98.00 98.00">
        <path class="spinner-track" d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90" />
        <path
          class="spinner-head"
          d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90"
          pathLength="280"
          stroke-dasharray="280 280"
          stroke-dashoffset="210"
        />
      </svg>
    </div>
  </div>
</div>

<style lang="scss">
  .loading-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    height: 100vh;
  }
  .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }
  .spinner-animation {
    animation: spinner-animation 0.5s linear infinite;
  }
  .spinner-svg {
    display: block;
  }
  .spinner-track {
    fill-opacity: 0;
    stroke: #d0d0d0;
  }
  .spinner-head {
    fill-opacity: 0;
    stroke: #555c;
    stroke-linecap: round;
    transform-origin: center;
    transition: stroke-dashoffset 0.2s cubic-bezier(0.4, 1, 0.75, 0.9);
  }
  @keyframes spinner-animation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(1turn);
    }
  }
</style>
