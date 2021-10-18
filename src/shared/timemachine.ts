import { BrushLog } from './types'

export default class Timemachine {
  stack: BrushLog[]
  index: number
  historyIndex: number

  constructor () {
    this.stack = []
    this.index = 0
    this.historyIndex = 0
  }

  undo () {
    const backward = this.index - 1

    if (backward >= this.historyIndex) {
      const record = this.get(backward)

      if (record) {
        this.index--
        return record
      }
    }
  }

  redo () {
    const record = this.get()

    if (record) {
      this.index++
      return record
    }
  }

  add (log: BrushLog) {
    if (!this.canRedo()) {
      this.stack.splice(this.index)
    }

    this.stack.push(log)
    this.index++
  }

  remove (index: number) {
    if (index < this.stack.length) {
      this.stack.splice(index, 1)

      if (index < this.index) {
        this.index--
      }
      if (index < this.historyIndex) {
        this.historyIndex--
      }
    }
  }

  get (index: number = this.index) {
    return this.stack[index]
  }

  fullStack () {
    return this.stack
  }

  historyStack () {
    return this.stack.slice(0, this.historyIndex)
  }

  makeHistory (index?: number) {
    if (typeof index === 'number') {
      this.historyIndex = index
    } else {
      this.historyIndex = this.size()
    }
  }

  size () {
    return this.stack.length
  }

  travel (index?: number) {
    if (typeof index === 'number') {
      this.index = index
    }
  }

  canUndo () {
    return this.index === this.historyIndex
  }

  canRedo () {
    return this.index === this.size()
  }

  reset () {
    this.stack = []
    this.index = 0
    this.historyIndex = 0
  }
}
