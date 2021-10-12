<template>
  <div class="slider-wrapper" :style="mainStyle"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp">
    <div class="indicator" :style="{'line-height': height + 'px'}">
      {{text}}: {{modelValue}}
    </div>
    <div class="track-bar" :style="trackStyle"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch, ref } from 'vue'

export default defineComponent({
  name: 'Slider',
  props: {
    step: {
      type: Number,
      default: 1
    },
    text: {
      type: String
    },
    modelValue: {
      type: Number,
      default: 1
    },
    maxSize: {
      type: Number,
      default: 100
    },
    width: {
      type: Number,
      default: 220
    },
    height: {
      type: Number,
      default: 28
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const mainStyle = {
      width: props.width + 'px',
      height: props.height + 'px'
    }

    let canMove = false
    const defaultX = (props.modelValue / props.maxSize) * props.width
    const trackSize = ref<number>(defaultX)
    const offsetX = ref<number>(defaultX)

    const trackStyle = computed(() => {
      return {
        width: trackSize.value + 'px',
        height: props.height + 'px'
      }
    })

    const methods = {
      onMouseDown (e: MouseEvent) {
        canMove = true
        offsetX.value = e.offsetX
        e.preventDefault()
      },
      onMouseMove (e: MouseEvent) {
        if (canMove) {
          offsetX.value = e.offsetX
        }
        e.preventDefault()
      },
      onMouseUp () {
        if (canMove) {
          canMove = false
        }
      }
    }

    watch(offsetX, () => {
      if (offsetX.value >= props.width) trackSize.value = props.width
      else if (offsetX.value <= 1) trackSize.value = 1
      else trackSize.value = offsetX.value
      const size = Math.ceil((trackSize.value / props.width) * props.maxSize)
      emit('update:modelValue', size)
    })

    return {
      mainStyle,
      trackStyle,
      offsetX,
      trackSize,
      ...methods
    }
  }
})
</script>

<style lang="scss">
.slider-wrapper {
  position: relative;
  border-radius: 8px;
  box-shadow: 0.5px 1px 0 0 rgb(255 255 255 / 80%);
  text-shadow: 0 0 5px rgb(255 255 255 / 50%);
  background: linear-gradient(to bottom,#909090 1%,#b3b3b3 73%);
  color: #333;
  font-weight: 500;
  cursor: ew-resize;
  margin-top: 16px;
  .indicator {
    position: absolute;
    text-align: left;
    text-indent: 2em;
    z-index: 1;
  }
  .track-bar {
    position: absolute;
    left: 0;
    top: 0;
    background-color: #fff;
    background-image: linear-gradient( to top, rgb(232,232,232) 0%, rgba(255,255,255,1) 70% );
    box-shadow: inset 1px 1px 1px rgb(0 0 0 / 30%), 2px 2px 6px rgb(145 145 145 / 49%);
    border-radius: 6px;
  }
}
</style>
