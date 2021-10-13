<template>
  <div class="stage-container">
    <div id="stage" class="stage"></div>
  </div>
</template>

<script lang="ts">
import Konva, { CustomLine, CustomLineConfig, lineSceneFunc } from '../shared/konva'
import { defineComponent, onMounted, watch, ref } from 'vue'
import { Stage } from 'konva/lib/Stage'
import { Layer } from 'konva/lib/Layer'
import { KonvaEventObject } from 'konva/lib/Node'
import { Vector2d } from 'konva/lib/types'
import { POINTER_TYPE, BRUSH_MODE } from '../shared/constants'
import SVGOverlay from '../shared/svgOverlay'
import Brush from '../shared/brush'

// const cursors = {
//   pen: require('@/assets/images/cursor-pen.png'),
//   eraser: require('@/assets/images/cursor-eraser.png')
// }

const getPenWidth = function (e: KonvaEventObject<PointerEvent>, size: number): number {
  const { pressure, pointerType } = e.evt
  switch (pointerType) {
    case POINTER_TYPE.Touch:
    case POINTER_TYPE.Mouse:
      return size
    case POINTER_TYPE.Pen:
      return Math.max(0.1, pressure) * 2 * size
    default:
      console.warn(`pointerType "${pointerType}" is Not suported`)
      return size
  }
}

export default defineComponent({
  name: 'Stage',
  setup (props, context) {
    let stage: Stage
    let layer: Layer
    let node: CustomLine
    const currentPos = ref(null as Vector2d | null)
    const overlay = new SVGOverlay({
      width: document.body.clientWidth,
      height: document.body.clientHeight
    })
    let brush: any

    const bindStageEvents = () => {
      let isDrawing = false
      stage.on('pointerdown', (e: KonvaEventObject<PointerEvent>) => {
        isDrawing = true
        currentPos.value = stage.getPointerPosition() as Vector2d
        const { x, y } = currentPos.value
        // node = new CustomLine({
        //   name: 'line',
        //   stroke: '#ff0000',
        //   lineCap: 'round',
        //   lineJoin: 'round',
        //   globalCompositeOperation: 'source-over',
        //   widths: [getPenWidth(e, 2)],
        //   points: [x, y, x, y]
        // })
        // layer.add(node)
        brush.startLine(x, y, e.evt.pressure)
      })
      stage.on('pointermove', (e: KonvaEventObject<PointerEvent>) => {
        e.evt.preventDefault()
        currentPos.value = stage.getPointerPosition() as Vector2d
        if (!isDrawing) return
        const { x, y } = currentPos.value
        // node.points(node.points().concat([x, y]))
        // node.widths(node.widths().concat([getPenWidth(e, 2)]))
        brush.goLine(x, y, e.evt.pressure, false, false)
      })
      stage.on('pointerup', () => {
        isDrawing = false
        brush.endLine()
      })
      stage.on('mouseleave', () => {
        console.log('mouseleave')
        isDrawing = false
        currentPos.value = null
      })
    }

    watch(currentPos,
      (val: any) => {
        overlay.updateCursor({
          ...val,
          radius: 4,
          visible: val !== null
        })
      }
    )

    onMounted(() => {
      stage = new Konva.Stage({
        container: 'stage',
        width: document.body.clientWidth,
        height: document.body.clientHeight
      })
      layer = new Konva.Layer({
        name: 'penLayer'
      })
      stage.add(layer)
      stage.container().appendChild(overlay.getRootElement())
      stage.container().style.cursor = 'crosshair'
      brush = new Brush({
        context: layer.getContext()._context,
        mode: BRUSH_MODE.Circle,
        size: 4,
        opacity: 1,
        color: '#ff0000'
      })
      bindStageEvents()
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
}
#stage {
  canvas {
    touch-action: none;
  }
}
</style>
