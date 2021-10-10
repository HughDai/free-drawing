<template>
  <Playground/>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import Playground from './components/Playground.vue'

@Options({
  components: {
    Playground
  }
})
export default class App extends Vue {
  mounted () {
    console.log(this)
  }
}
</script>

<style lang="scss">
@import "./assets/styles/reset.scss";
</style>
