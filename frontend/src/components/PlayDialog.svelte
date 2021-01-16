<script lang="ts">
  export let createId: string;
</script>

<section>
  <div class="create">
    <h4>Create game</h4>
    <input value={`${window.location.protocol}${window.location.hostname}/#play?id=${createId}`} />
    <button>Copy</button>
    <ul />
  </div>
  <div class="divider">
    <div class="line" />
    <span>OR</span>
    <div class="line" />
  </div>
  <div class="join">
    <h4>Join game</h4>
    <input placeholder="Code" />
    <button>Join</button>
  </div>
</section>

<style lang="scss">
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
    width: 400px;
    height: 450px;
    padding-top: 64px;
  }
</style>
