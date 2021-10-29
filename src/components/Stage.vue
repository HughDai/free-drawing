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
import { Vector2d, BrushConfig, BrushLog } from '../shared/types'
import { PEN_MODE, BRUSH_ACTION } from '../shared/constants'
import SVGOverlay from '../shared/svg-overlay'
import Brush from '../shared/brush'
import Canvas from '../shared/canvas'
// import Timemachine from '../shared/timemachine'
import { throttle, download, readTextFile } from '../shared/utils'
import { ElMessage } from 'element-plus'
const mockDataEn = () => import(/* webpackChunkName: "mockdataEn" */ '../../mocks/free-drawing_1635221844352.json')
const mockDataCn = () => import(/* webpackChunkName: "mockDataCn" */ '../../mocks/free-drawing_1635521643500.json')

export default defineComponent({
  name: 'Stage',
  setup () {
    const store = useStore()
    const eventBus = getCurrentInstance()?.appContext.config.globalProperties.eventBus

    const timemachine = store.state.timemachine
    const state = reactive(store.state.stageConfig)

    let container: HTMLElement
    let brush: Brush
    let canvas: Canvas
    const lastPos = ref(null as Vector2d | null)
    const overlay = new SVGOverlay({
      width: document.body.clientWidth,
      height: document.body.clientHeight
    })

    const createBrush = (config?: BrushConfig) => {
      config = config || {
        context: canvas.getContext(),
        penMode: state.penMode,
        brushMode: state.brushMode,
        size: state.size,
        opacity: state.opacity / 100,
        color: state.colors.brush
      }
      return new Brush(config)
    }

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
        const width = document.body.clientWidth
        const height = document.body.clientHeight
        const canvasData = canvas.getContext().getImageData(0, 0, canvas.getWidth(), canvas.getHeight())
        canvas.setSize(width, height)
        overlay.setSize({ width, height })
        canvas.getContext().putImageData(canvasData, 0, 0)
      }, 400))
    }

    const bindGlobalListeners = () => {
      eventBus.on('command', (args: string | { command: string, payload: any }) => {
        if (typeof args === 'string') {
          commandHandlers[args].call()
        } else {
          commandHandlers[args.command].call(null, args.payload)
        }
      })
    }

    const commandHandlers: { [key: string]: any } = {
      redo () {
        if (!timemachine.canRedo()) return
        timemachine.redo()
        redraw()
      },
      undo () {
        if (!timemachine.canUndo()) return
        timemachine.undo()
        redraw()
      },
      clear () {
        if (timemachine.size() === 0) return
        canvas.clear()
        timemachine.reset()
      },
      save () {
        if (timemachine.size() === 0) {
          return ElMessage({
            message: 'no data',
            type: 'warning'
          })
        }
        canvas.toImage({
          callback (img) {
            download(img.src, `free-drawing_${Date.now()}.png`)
          }
        })
      },
      importJSON (file: File) {
        readTextFile(file).then(text => {
          const list = JSON.parse(text)
          if (!Array.isArray || list.length === 0) {
            return ElMessage({
              message: 'Warning, Invalid File.',
              type: 'warning'
            })
          }
          timemachine.setStack(list)
          redraw()
        }).catch(error => {
          ElMessage({
            message: 'Error, Import Error.' + error.message,
            type: 'error'
          })
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
      canvas.clear()
      const currentStack = timemachine.currentStack() as BrushLog[]
      currentStack.forEach(data => {
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
      brush = createBrush()
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
      brush = createBrush()
      bindStageListeners()
      bindGlobalListeners()
      const mockData = Math.random() > 0.5 ? mockDataEn : mockDataCn
      mockData().then(data => {
        timemachine.setStack(data.default)
        redraw()
      })
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
