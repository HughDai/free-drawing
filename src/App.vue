<template>
  <Playground/>
</template>

<script lang="ts">
import { inject } from 'vue'
import { Options, Vue } from 'vue-class-component'
import Playground from './components/Playground.vue'

@Options({
  components: {
    Playground
  }
})
export default class App extends Vue {
  loading: any = inject('$loading')

  created () {
    this.loading.show()
  }

  mounted () {
    this.loading.hide()
  }
}
</script>

<style lang="scss">
@import "./assets/styles/reset.scss";
</style>
