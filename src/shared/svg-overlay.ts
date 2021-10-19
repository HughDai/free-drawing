interface Size {
  width: number,
  height: number
}

interface CursorPoint {
  x?: number,
  y?: number,
  radius?: number,
  color?: string,
  visible?: boolean
}

const NamespaceURI = 'http://www.w3.org/2000/svg'

export default class SVGOverlay {
  rootElement: SVGSVGElement
  cursorCircleOuter: SVGCircleElement
  cursorCircleInner: SVGCircleElement

  constructor (size: Size) {
    this.createCursorCircleOuter()
    this.createCursorCircleInner()
    this.createRootElement(size)
    this.rootElement.appendChild(this.cursorCircleOuter)
    this.rootElement.appendChild(this.cursorCircleInner)
  }

  createRootElement (size: Size) {
    this.rootElement = document.createElementNS(NamespaceURI, 'svg')
    const styleMap: { [key: string]: string | number } = {
      position: 'absolute',
      left: 0,
      top: 0,
      pointerEvents: 'none',
      userSelect: 'none'
    }
    Object.keys(styleMap).forEach((key) => {
      this.rootElement.style[key] = styleMap[key]
    })
    this.rootElement.setAttribute('width', size.width.toString())
    this.rootElement.setAttribute('height', size.height.toString())
  }

  createCursorCircleOuter () {
    this.cursorCircleOuter = document.createElementNS(NamespaceURI, 'circle')
    this.cursorCircleOuter.setAttribute('r', '10')
    this.cursorCircleOuter.setAttribute('stroke', 'rgba(0,0,0,0.7)')
    this.cursorCircleOuter.setAttribute('stroke-width', '1')
    this.cursorCircleOuter.setAttribute('fill', 'none')
    this.cursorCircleOuter.setAttribute('opacity', '0')
  }

  createCursorCircleInner () {
    this.cursorCircleInner = document.createElementNS(NamespaceURI, 'circle')
    this.cursorCircleInner.setAttribute('r', '9')
    this.cursorCircleInner.setAttribute('stroke', 'rgba(255,255,255,0.7)')
    this.cursorCircleInner.setAttribute('stroke-width', '1')
    this.cursorCircleInner.setAttribute('fill', 'none')
    this.cursorCircleInner.setAttribute('opacity', '0')
  }

  getRootElement () {
    return this.rootElement
  }

  setSize (size: Size) {
    this.rootElement.setAttribute('width', size.width.toString())
    this.rootElement.setAttribute('height', size.height.toString())
  }

  updateCursor (point: CursorPoint) {
    if (point.x !== undefined) {
      this.cursorCircleOuter.setAttribute('cx', String(point.x))
      this.cursorCircleInner.setAttribute('cx', String(point.x))
    }

    if (point.y !== undefined) {
      this.cursorCircleOuter.setAttribute('cy', String(point.y))
      this.cursorCircleInner.setAttribute('cy', String(point.y))
    }

    if (point.color) {
      this.cursorCircleOuter.setAttribute('stroke', point.color)
      this.cursorCircleInner.setAttribute('stroke', point.color)
    }

    if (point.radius !== undefined) {
      this.cursorCircleOuter.setAttribute('r', String(Math.max(0, point.radius)))
      this.cursorCircleInner.setAttribute('r', String(Math.max(0, point.radius - 1)))
    }

    if (point.visible !== undefined) {
      this.cursorCircleOuter.style.opacity = String(~~point.visible)
      this.cursorCircleInner.style.opacity = String(~~point.visible)
    }
  }
}
