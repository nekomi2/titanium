<script lang="ts">
  let count = 0;
</script>

<div class="mainbox">
  <h1>Titanium</h1>
  <input class="url-input" type="text" placeholder="Insert video link" />
</div>

<style>
  .mainbox {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  .url-input {
    background: none;
    border: none;
    border-bottom: 1px solid gray;
    outline: none;
    font-size: 0.8rem;
    height: 2rem;
  }
</style>
