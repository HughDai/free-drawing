<template>
  <div :class="['toolbar-wrapper', {'hidden': !visible}]">
    <Header/>
    <div class="pen-actions">
      <ul class="list-panel">
        <li v-for="action in actions" :key="action" :title="action"
          @click="handleAction(action)"
          :class="[
            'icon',
            'icon-' + action,
            {'icon-disabled': (!timemachine.canRedo() && action === 'redo')
              || (!timemachine.canUndo() && action === 'undo')
              || (!timemachine.size() && action === 'clear')
            }
          ]">
        </li>
      </ul>
    </div>
    <div class="pen-options">
      <ul class="pen-mode list-panel">
        <li v-for="mode in penModes" :key="mode" :title="mode"
          @click="penMode = mode"
          :class="['icon', 'icon-' + mode, {'li-active': penMode === mode}]">
        </li>
      </ul>
      <ul class="brush-mode list-panel">
        <li v-for="mode in brushModes" :key="mode" :title="mode"
          @click="brushMode = mode"
          :class="['icon', 'icon-alpha_' + mode, {'li-active': brushMode === mode}]">
        </li>
      </ul>
      <ColorPicker v-model="colors" class="list-panel"/>
      <Slider :width="250" text="Size" :max-size="100" v-model="size"/>
      <Slider :width="250" text="Opacity" :max-size="100" v-model="opacity"/>
    </div>
    <div class="toolbar-footer">
      <Footer/>
    </div>
    <div class="button-transfer" @click="visible = !visible"></div>
  </div>
</template>

<script lang="ts">
import {
  getCurrentInstance,
  defineComponent,
  reactive,
  toRefs,
  watch,
  ref
} from 'vue'
import Slider from './Slider.vue'
import Header from './Header.vue'
import Footer from './Footer.vue'
import ColorPicker from './ColorPicker.vue'
import { PEN_MODE, BRUSH_MODE } from '../shared/constants'
import { EnumUtils } from '../shared/utils'
import { ElMessage } from 'element-plus'
import { useStore, Mutations } from '@/store'

export default defineComponent({
  name: 'Toolbar',
  components: {
    Header,
    Footer,
    Slider,
    ColorPicker
  },
  setup () {
    const store = useStore()
    const eventBus = getCurrentInstance()?.appContext.config.globalProperties.eventBus

    const state = reactive(store.state.stageConfig)
    const timemachine = store.state.timemachine

    const methods = {
      handleAction (action: string) {
        eventBus.emit('command', action)
      }
    }

    const visible = ref<boolean>(true)
    const actions: Array<string> = ['undo', 'redo', 'clear', 'save']
    const penModes = EnumUtils.getEnumKeys(PEN_MODE, 'string')
    const brushModes = EnumUtils.getEnumKeys(BRUSH_MODE, 'string')

    watch(state, (val: any) => {
      eventBus.emit('stateChange', val)
      store.commit(Mutations.SET_STAGE_CONFIG, val)
    })

    return {
      visible,
      actions,
      penModes,
      brushModes,
      timemachine,
      ...toRefs(state),
      ...methods
    }
  }
})
</script>

<style lang="scss" scoped>
.toolbar-wrapper {
  width: 270px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  user-select: none;
  touch-action: none;
  border-right: none;
  background-color: #e9e9eb;
  border-left: 1px solid #f3f3f3;
  transition: right .5s;
  z-index: 10;
}
.hidden {
  right: -270px;
}
.pen-options {
  // border-bottom: 1px solid #cccccc;
}
// .pen-options, .pen-actions {
//   padding-bottom: 16px;
// }
.pen-actions, .brush-mode {
  // background: #000;
  .icon {
    background-size: 24px;
  }
}
.slider-wrapper {
  margin-left: 10px;
  margin-right: 10px;
}
.toolbar-footer {
  position: absolute;
  width: 100%;
  bottom: 0;
}
.button-transfer {
  position: absolute;
  cursor: pointer;
  top: 10px;
  left: -48px;
  width: 42px;
  height: 32px;
  background: rgba($color: #fff, $alpha: .8) url("~@/assets/images/transfer.png") center/20px no-repeat;
}
</style>
