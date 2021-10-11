<template>
  <div class="stage-container">
    <div id="stage" class="stage"></div>
  </div>
</template>

<script lang="ts">
import Konva, { CustomLine, CustomLineConfig, lineSceneFunc } from '../shared/konva'
import { defineComponent, onMounted } from 'vue'
import { Stage } from 'konva/lib/Stage'
import { Layer } from 'konva/lib/Layer'
import { KonvaEventObject } from 'konva/lib/Node'
import { Vector2d } from 'konva/lib/types'
import { POINTER_TYPE } from '../shared/constants'

const cursors = {
  pen: require('@/assets/images/cursor-pen.png'),
  eraser: require('@/assets/images/cursor-eraser.png')
}

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
    let stage = {} as Stage
    let layer = {} as Layer
    let node = {} as CustomLine

    const bindStageEvents = () => {
      let isDrawing = false
      stage.on('pointerdown', (e: KonvaEventObject<PointerEvent>) => {
        isDrawing = true
        const pos = stage.getPointerPosition() as Vector2d
        node = new CustomLine({
          name: 'line',
          stroke: '#ff0000',
          lineCap: 'round',
          lineJoin: 'round',
          // bezier: true,
          // strokeWidth: 1,
          globalCompositeOperation: 'source-over',
          widths: [getPenWidth(e, 2)],
          points: [pos.x, pos.y, pos.x, pos.y]
        })
        layer.add(node)
        // layer.draw()
      })
      stage.on('pointermove', (e: KonvaEventObject<PointerEvent>) => {
        if (!isDrawing) return
        e.evt.preventDefault()
        const pos = stage.getPointerPosition() as Vector2d
        node.points(node.points().concat([pos.x, pos.y]))
        node.widths(node.widths().concat([getPenWidth(e, 2)]))
        // layer.batchDraw()
      })
      stage.on('pointerup', () => {
        isDrawing = false
      })
    }

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
      stage.container().style.cursor = 'url(' + cursors.pen + ') 0 0, move'
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
