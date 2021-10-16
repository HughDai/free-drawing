<template>
  <div class="stage-container" id="stage"></div>
</template>

<script lang="ts">
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  reactive,
  watch,
  ref
} from 'vue'
import { useStore, Mutations } from '@/store'
import { Vector2d } from '../shared/types'
import { PEN_BUTTON, PEN_MODE } from '../shared/constants'
import SVGOverlay from '../shared/svgOverlay'
import Brush from '../shared/brush'
import Canvas from '../shared/canvas'
import { throttle, download } from '../shared/utils'

export default defineComponent({
  name: 'Stage',
  setup () {
    const store = useStore()
    const eventBus = getCurrentInstance()?.appContext.config.globalProperties.eventBus

    const state = reactive(store.state.stageConfig)

    let container: HTMLElement
    let brush: Brush
    let canvas: Canvas
    const lastPos = ref(null as Vector2d | null)
    const overlay = new SVGOverlay({
      width: document.body.clientWidth,
      height: document.body.clientHeight
    })

    const bindStageListeners = () => {
      let isDrawing = false
      container.addEventListener('pointerdown', (e: PointerEvent) => {
        isDrawing = true
        const { x, y } = e
        const pressure = state.penMode === PEN_MODE.Eraser ? 1 : e.pressure
        lastPos.value = { x, y }
        brush.startLine({
          x,
          y,
          pressure
        })
      })
      container.addEventListener('pointermove', (e: PointerEvent) => {
        e.preventDefault()
        const { x, y } = e
        const pressure = state.penMode === PEN_MODE.Eraser ? 1 : e.pressure
        lastPos.value = { x, y }
        if (!isDrawing) return
        brush.goLine({
          x,
          y,
          pressure
        })
      })
      container.addEventListener('pointerup', () => {
        isDrawing = false
        brush.endLine()
      })
      container.addEventListener('mouseleave', () => {
        isDrawing = false
        lastPos.value = null
      })

      window.addEventListener('resize', throttle(() => {
        canvas.setSize(document.body.clientWidth, document.body.clientHeight)
      }, 250))
    }

    const bindGlobalListeners = () => {
      eventBus.on('command', (command: string) => {
        commandHandlers[command].call()
      })
    }

    const commandHandlers: { [key: string]: any } = {
      redo () {},
      undo () {},
      clear () {
        canvas.clear()
      },
      save () {
        canvas.toImage({
          callback (img) {
            download(img.src, `free-drawing_${Date.now()}.png`)
          }
        })
      }
    }

    watch(lastPos, (val: any) => {
      overlay.updateCursor({
        ...val,
        radius: state.size / 2,
        visible: val !== null
      })
    })

    watch(state,
      (val: any) => {
        store.commit(Mutations.SET_STAGE_CONFIG, val)
      },
      { deep: true }
    )

    watch(
      () => state.colors.layer,
      (val: any) => {
        canvas.setBG(val)
      }
    )

    watch(
      () => state.colors.brush,
      (val: any) => {
        brush.setColor(val)
      }
    )

    const props = ['size', 'opacity', 'penMode', 'brushMode']
    props.forEach((prop: string) => {
      watch(
        () => state[prop],
        (val: any) => {
          if (prop === 'opacity') val = val / 100
          const pascalProp = prop.replace(/\w/, (l: string) => l.toUpperCase())
          brush['set' + pascalProp](val)
        }
      )
    })

    onMounted(() => {
      container = document.getElementById('stage') as HTMLElement
      canvas = new Canvas(container, {
        width: document.body.clientWidth,
        height: document.body.clientHeight
      })
      canvas.setBG(state.colors.layer)
      container.appendChild(overlay.getRootElement())
      container.style.cursor = 'crosshair'
      brush = new Brush({
        context: canvas.getContext(),
        penMode: state.penMode,
        brushMode: state.brushMode,
        size: state.size,
        opacity: state.opacity / 100,
        color: state.colors.brush
      })
      bindStageListeners()
      bindGlobalListeners()
    })
  }
})
</script>

<style lang="scss" scoped>
.stage-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  user-select: none;
}
</style>
