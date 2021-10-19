<template>
  <div class="header-wrapper">
    <div title="import" class="header-item icon icon-import" @click="importJSON"></div>
    <div title="export" class="header-item icon icon-export" @click="exportJSON"></div>
    <div title="info" class="header-item icon icon-info"></div>
  </div>
  <Upload ref="upload" @change="handlFileChange"/>
</template>

<script lang="ts">
import Upload from './Upload.vue'
import { defineComponent, getCurrentInstance, ref } from 'vue'

export default defineComponent({
  name: 'Header',
  components: { Upload },
  setup () {
    const eventBus = getCurrentInstance()?.appContext.config.globalProperties.eventBus
    const upload = ref()

    const handlFileChange = function (files: FileList) {
      if (!files) return
      console.log(files)
      eventBus.emit('command', { command: 'importJSON', payload: files[0] })
    }

    const importJSON = function () {
      upload.value.fire()
    }

    const exportJSON = function () {
      eventBus.emit('command', 'exportJSON')
    }

    return {
      upload,
      importJSON,
      exportJSON,
      handlFileChange
    }
  }
})
</script>

<style lang="scss" scoped>
@import "../assets/styles/common.scss";
.header-wrapper {
  background: rgba(255, 255, 255, 0.3);
  height: 44px;
  display: flex;
  .header-item {
    flex: 1;
    text-align: center;
    cursor: pointer;
    position: relative;
    &:hover {
      background-color: rgba($color: #fff, $alpha: .5);
      &:after {
        @include after_title;
        left: auto;
        top: auto;
        bottom: -20px;
      }
    }
  }
  .icon {
    background-size: 24px;
  }
}
</style>
