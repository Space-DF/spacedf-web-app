const SPRITE_SIZE = 128

const RING_SPREAD = 16
const RING_WIDTH = 6
const RING_BLUR = 10
const RING_OPACITY = 0.45

const BUTTON_SIZE = SPRITE_SIZE - RING_SPREAD * 2
const BUTTON_RADIUS = 24
const BUTTON_BORDER = 4
const BUTTON_PADDING = 16

export type FrameColors = {
  background: string
  border: string
  ring?: string
}

const roundedRectPath = (
  context: CanvasRenderingContext2D,
  inset: number,
  size: number,
  radius: number
) => {
  const right = inset + size
  const bottom = inset + size

  context.beginPath()
  context.moveTo(inset + radius, inset)
  context.arcTo(right, inset, right, bottom, radius)
  context.arcTo(right, bottom, inset, bottom, radius)
  context.arcTo(inset, bottom, inset, inset, radius)
  context.arcTo(inset, inset, right, inset, radius)
  context.closePath()
}

const buttonPath = (context: CanvasRenderingContext2D) =>
  roundedRectPath(context, RING_SPREAD, BUTTON_SIZE, BUTTON_RADIUS)

const drawRing = (context: CanvasRenderingContext2D, color: string) => {
  context.save()
  context.globalAlpha = RING_OPACITY
  context.shadowColor = color
  context.shadowBlur = RING_BLUR
  context.strokeStyle = color
  context.lineWidth = RING_WIDTH * 2
  buttonPath(context)
  context.stroke()
  context.restore()
}

export const createDeviceIconSprite = (
  logo: HTMLImageElement,
  { background, border, ring }: FrameColors
): string | null => {
  const canvas = document.createElement('canvas')
  canvas.width = SPRITE_SIZE
  canvas.height = SPRITE_SIZE

  const context = canvas.getContext('2d')
  if (!context) return null

  if (ring) drawRing(context, ring)

  buttonPath(context)
  context.fillStyle = background
  context.fill()
  context.lineWidth = BUTTON_BORDER
  context.strokeStyle = border
  context.stroke()

  const box = BUTTON_SIZE - BUTTON_PADDING * 2
  const scale = Math.min(box / logo.naturalWidth, box / logo.naturalHeight)
  const width = logo.naturalWidth * scale
  const height = logo.naturalHeight * scale

  context.drawImage(
    logo,
    (SPRITE_SIZE - width) / 2,
    (SPRITE_SIZE - height) / 2,
    width,
    height
  )

  try {
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

export const DEVICE_ICON_SPRITE_SIZE = SPRITE_SIZE

/** Bottom edge of the button, so the ring hangs past the column it stands on. */
export const DEVICE_ICON_SPRITE_ANCHOR_Y = SPRITE_SIZE - RING_SPREAD

/** Share of the sprite the button itself takes up, for sizing it on screen. */
const DEVICE_ICON_BUTTON_RATIO = BUTTON_SIZE / SPRITE_SIZE

const DEVICE_BUTTON_SIZE = 34

export const DEVICE_ICON_SIZE = Math.round(
  DEVICE_BUTTON_SIZE / DEVICE_ICON_BUTTON_RATIO
)
