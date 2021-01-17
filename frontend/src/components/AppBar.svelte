<script lang="ts">
  import cards from '../assets/cards.svg';
  import githubIcon from '../assets/github.svg';
  import Button from '../components/Button.svelte';
</script>

<nav>
  <img src={cards} height="36" width="36" alt="cards" />
  <a href="#/">Flushed!</a>
  <div class="spacer" />
  <!-- <Button>See code</Button> -->
  <a class="github" href="https://github.com/gamer-gang/flushed" rel="noopener" target="_blank">
    <img src={githubIcon} alt="github" class="github-icon" />
  </a>
</nav>

<style lang="scss">
  @import '../colors';
  nav {
    position: fixed;
    top: 0;
    width: 100%;
    background-color: white;
    height: 48px;
    display: flex;
    align-items: center;
    z-index: 2;
    padding-right: 4px;
    // box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border-bottom: 2px solid cool-gray(200);
    & > * {
      color: #333;
      margin-left: 12px;
    }
  }

  .spacer {
    flex-grow: 1;
  }
  // :global(nav > *) {
  //   color: #333;
  //   margin-left: 12px;
  // }
  a {
    text-decoration: none;
    font-weight: 600;
    transition: color 75ms linear;
    display: flex;
    align-items: center;
  }
  .github {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    .github-icon {
      height: 24px;
      width: 24px;
    }

    transition: background-color 150ms ease-in-out;

    &:hover {
      background-color: cool-gray(200);
    }
  }
</style>
