<script lang="ts">
  import { socket } from '../data';

  let createName: string;
  let joinName: string;
  let joinId: string;

  const create = () => {
    socket.emit('room-create', { name: createName });
  };
  const join = () => {
    socket.emit('room-connect', { id: joinId, name: joinName });
  };
</script>

<section>
  <div class="create">
    <h4>Create game</h4>
    <input placeholder="Your name" bind:value={createName} />
    <button on:click={create}>Create</button>
  </div>
  <div class="divider">
    <div class="line" />
    <span>OR</span>
    <div class="line" />
  </div>
  <div class="join">
    <h4>Join game</h4>
    <input placeholder="Your name" bind:value={joinName} />
    <input placeholder="Code" bind:value={joinId} />
    <button on:click={join}>Join</button>
  </div>
</section>

<style lang="scss">
  @import '../colors';

  section {
    display: flex;
    & > * {
      margin: 0 8px;
    }
    h4 {
      margin: 0;
    }
    .create,
    .join {
      & > * {
        margin: 8px 0;
      }
      input {
        max-width: 200px;
        font-size: 0.85rem;
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
      flex-direction: column;
      align-items: center;
      justify-content: center;
      span {
        padding: 8px 0;
        color: cool-gray(400);
      }
      .line {
        width: 1px;
        flex-grow: 1;
        background-color: cool-gray(400);
      }
    }
    width: 500px;
    height: 250px;
    padding-top: 64px;
  }
</style>
