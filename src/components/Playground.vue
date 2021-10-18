<template>
  <div class="playground-container">
    <Stage/>
    <Toolbar/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Stage from './Stage.vue'
import Toolbar from './Toolbar.vue'

export default defineComponent({
  name: 'Playground',
  components: {
    Stage,
    Toolbar
  }
})
</script>

<style lang="scss">
@import "../assets/styles/common.scss";
.playground-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
}
</style>
