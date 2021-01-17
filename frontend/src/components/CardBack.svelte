<script lang="ts">
  import cardBack from '../assets/cardback.svg';
</script>

<img draggable="false" src={cardBack} alt="icon" />

<style lang="scss">
  @import '../colors';

  img {
    // border: 2px solid cool-gray(400);
    height: 154px;
    width: 110px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    background-color: white;
    border-radius: 12px;
    user-select: none;
    // padding: 45px 10px;
  }
</style>
