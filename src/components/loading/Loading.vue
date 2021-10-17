<template>
  <transition name="fade">
    <div class="loading-mask" v-if="visible">
      <div class="loading-content">
        <Taichi :size="size" />
        <img src="../../assets/images/loading.png" :alt="tips">
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { SIZE } from '../../shared/constants'
import Taichi from './Taichi.vue'
import { ref, defineComponent } from 'vue'

export default defineComponent({
  name: 'Loading',
  components: {
    Taichi
  },
  props: {
    size: {
      type: String,
      default: SIZE.Medium
    }
  },
  setup () {
    const visible = ref<boolean>(false)
    const tips = ref<string>('Loading...')
    const show = (val?: string) => {
      if (val) tips.value = val
      visible.value = true
    }
    const hide = () => {
      visible.value = false
    }
    return {
      visible,
      tips,
      show,
      hide
    }
  }
})
</script>

<style lang="scss" scoped>
.loading-mask {
  width: 100vw;
  height: 100vh;
  background: rgba($color: #000000, $alpha: .75);
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.loading-content {
  text-align: center;
  img {
    width: 120px;
    margin-top: 12px;
  }
}
.loading-tips {
  font-size: 18px;
  text-align: center;
  color: #d5d5d5;
  margin-top: 1em;
}
</style>
