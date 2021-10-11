<template>
  <Playground/>
</template>

<script lang="ts">
import { inject, defineComponent, onMounted } from 'vue'
import Playground from './components/Playground.vue'

export default defineComponent({
  name: 'App',
  components: {
    Playground
  },
  setup () {
    const $loading: any = inject('$loading')
    $loading.show()
    onMounted(() => {
      // loading test
      setTimeout(function () {
        $loading.hide()
      }, 1e3 * (Math.random() + 1))
    })
  }
})
</script>

<style lang="scss">
@import "./assets/styles/reset.scss";
</style>
