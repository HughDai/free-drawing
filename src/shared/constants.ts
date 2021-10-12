export enum SIZE {
  Large = 'large',
  Medium = 'medium',
  Small = 'small'
}

export enum PEN_BUTTON {
  /** 鼠标移动且无按钮被按压 */
  None = 0x0,
  /** 鼠标左键、触摸接触、压感笔接触（无额外按钮被按压） */
  Tip = 0x1,
  /** 鼠标右键 */
  Barrel = 0x2,
  /** 鼠标中键、压感笔接触且笔杆按钮被按压 */
  Middle = 0x4,
  /** 鼠标X1 (back) */
  Back = 0x8,
  /** 鼠标X2 (forward) */
  Forward = 0x10,
  /** 压感笔接触且橡皮擦按钮被按压 */
  Eraser = 0x20
}

export enum POINTER_TYPE {
  Touch = 'touch',
  Mouse = 'mouse',
  Pen = 'pen'
}

export enum PEN_MODE {
  Pen = 'pen',
  Eraser = 'eraser'
}

export enum BRUSH_MODE {
  Circle = 'circle',
  Chalk = 'chalk',
  Calligraphy = 'calligraphy',
  Square = 'square'
}

export enum OPERATION_TYPE {
  Add = 'add',
  Remove = 'remove',
  Update = 'update'
}
