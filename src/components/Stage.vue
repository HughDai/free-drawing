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
import { PEN_MODE, BRUSH_ACTION } from '../shared/constants'
import SVGOverlay from '../shared/svgOverlay'
import Brush from '../shared/brush'
import Canvas from '../shared/canvas'
import Timemachine from '../shared/timemachine'
import { throttle, download } from '../shared/utils'
import { ElMessage } from 'element-plus'
import mockData from '../../mocks/free-drawing_1634577652361.json'

export default defineComponent({
  name: 'Stage',
  setup () {
    const store = useStore()
    const eventBus = getCurrentInstance()?.appContext.config.globalProperties.eventBus

    const timemachine = new Timemachine()
    timemachine.makeHistory()

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
        brush.startLine({ x, y, pressure })
      })

      container.addEventListener('pointermove', (e: PointerEvent) => {
        e.preventDefault()
        const { x, y } = e
        const pressure = state.penMode === PEN_MODE.Eraser ? 1 : e.pressure
        lastPos.value = { x, y }
        if (!isDrawing) return
        brush.goLine({ x, y, pressure })
      })

      container.addEventListener('pointerup', () => {
        isDrawing = false
        brush.endLine()
        timemachine.add(brush.logger)
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
        timemachine.reset()
      },
      save () {
        canvas.toImage({
          callback (img) {
            download(img.src, `free-drawing_${Date.now()}.png`)
          }
        })
      },
      exportJSON () {
        if (timemachine.size() === 0) {
          return ElMessage({
            message: 'no data',
            type: 'warning'
          })
        }
        const fullStack = timemachine.fullStack()
        const json = JSON.stringify(fullStack)
        const jsonBlob = new Blob([json])
        download(jsonBlob, `free-drawing_${Date.now()}.json`)
      }
    }

    const redraw = function () {
      // const fileReader = new FileReader()
      // fileReader.onload = function (e) {
      //   console.log(e.target)
      // }
      // fileReader.readAsText(new Blob(mockData))
      console.log(mockData)
      mockData.forEach(data => {
        brush = new Brush({
          context: canvas.getContext(),
          ...data.config as any
        })
        data.actions.forEach((record) => {
          if (record.p) {
            const { x, y, p: pressure } = record.p
            switch (record.a) {
              case BRUSH_ACTION.startLine:
                brush.startLine({ x, y, pressure })
                break
              case BRUSH_ACTION.goLine:
                brush.goLine({ x, y, pressure })
                break
            }
          } else {
            brush.endLine()
          }
        })
      })
    }

    watch(lastPos, (val: any) => {
      overlay.updateCursor({
        ...val,
        radius: Math.max(1, state.size / 2),
        color: state.colors.brush,
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
      container.style.cursor = 'none'
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
      redraw()
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
