import { PEN_MODE, BRUSH_MODE } from '@/shared/constants'

export interface Vector2d {
  x: number
  y: number
}

export interface Segment extends Vector2d {
  length: number
}
export interface Point extends Vector2d {
  spacing: number
  dir?: Vector2d
}

export interface PressurePoint extends Vector2d {
  pressure: number
}

export interface ShortPressurePoint extends Vector2d {
  p: number
}

export interface IRect {
  x: number
  y: number
  width: number
  height: number
}

export interface RGB {
  r: number
  g: number
  b: number
}

export interface RGBA extends RGB {
  a: number
}

export interface BrushConfig {
  context: CanvasRenderingContext2D,
  brushMode: BRUSH_MODE,
  penMode: PEN_MODE,
  size: number,
  opacity: number,
  color: string
}

type BrushLogConfig = Omit<BrushConfig, 'context'>

export type BrushAction = 's' | 'g' | 'e'

type BrushOperation = 'add' | 'remove'

export interface ActionRecord {
  a: BrushAction,
  p?: ShortPressurePoint,
  o?: BrushOperation
}

export interface BrushLog {
  id: string,
  config: BrushLogConfig,
  actions: ActionRecord[]
}

export type Nullable<T> = T | null
