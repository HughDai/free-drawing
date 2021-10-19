<template>
  <input
    type="file"
    name="file"
    ref="inputRef"
    accept="application/json"
    style="display: none;"
    @change="handleChange"
  >
</template>

<script lang="ts">
// import type { Nullable } from '../shared/types'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Upload',
  emits: ['change'],
  setup (props, { emit }) {
    const inputRef = ref()

    function handleChange (e: Event) {
      const files = (e.target as HTMLInputElement).files
      if (!files) return
      emit('change', files)
    }

    function fire () {
      inputRef.value.click()
    }

    return {
      fire,
      inputRef,
      handleChange
    }
  }
})
</script>
