<template>
  <div class="color-picker-wrapper">
    <div class="picker-item">
      <span class="picker-span">Layer Color</span>
      <el-color-picker
        v-model="colors.layer"
        show-alpha
        :predefine="layerPredefineColors"
      />
    </div>
    <div class="picker-item">
      <span class="picker-span">Brush Color</span>
      <el-color-picker
        v-model="colors.brush"
        show-alpha
        :predefine="brushPredefineColors"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, reactive, toRefs, ref, watch } from 'vue'
import { ElColorPicker } from 'element-plus'

export default defineComponent({
  name: 'ColorPicher',
  components: {
    ElColorPicker
  },
  props: {
    modelValue: {
      type: Object as PropType<Record<string, string>>,
      default: () => {
        return {
          brush: '',
          layer: ''
        }
      }
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const colors = ref(props.modelValue)
    const state = reactive({
      // brushColor: brush,
      // layerColor: layer,
      layerPredefineColors: [
        'rgba(0, 34, 23, 1)',
        '#000000',
        '#ffffff',
        'rgba(0, 0, 0, 0)'
      ],
      brushPredefineColors: [
        '#000000',
        '#ffffff',
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577'
      ]
    })

    watch(
      () => colors,
      (val: any) => {
        console.log(val)
        emit('update:modelValue', val)
      }
    )

    return {
      colors,
      ...toRefs(state)
    }
  }
})
</script>

<style lang="scss" scoped>
.color-picker-wrapper {
  display: flex;
  height: 54px;
  .picker-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
