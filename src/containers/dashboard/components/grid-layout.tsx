import React, { memo, useEffect, useRef, useState } from 'react'

export function generateGridBackground({
  cellSize,
  cols,
  gridWidth,
  margin,
}: {
  cellSize: {
    width: number
    height: number
  }
  cols: number
  gridWidth: number
  margin: number
}) {
  const XMLNS = 'http://www.w3.org/2000/svg'
  const rowHeight = 60 + margin
  const cellStrokeColor = '#e0e2e6'

  const y = 0
  const w = cellSize.width
  const h = cellSize.height

  const rectangles = Array.from({ length: cols }).map((_, i) => {
    const x = i * (cellSize.width + margin)

    return `<rect stroke='${cellStrokeColor}' stroke-width='1' fill='none' x='${x}' y='${y}' width='${w}' height='${h}' rx='5' stroke-dasharray='5 5'/>`
  })

  const svg = [
    `<svg xmlns='${XMLNS}' width='${gridWidth}' height='${rowHeight}'>`,
    ...rectangles,
    `</svg>`,
  ].join('')

  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

interface Props {
  rowHeight?: number
  margin?: number
  columns?: number
}

const GridLayout: React.FC<Props> = ({
  rowHeight = 60,
  margin = 5,
  columns = 5,
}) => {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [background, setBackground] = useState<string | undefined>(undefined)

  const updateBackground = () => {
    if (gridRef.current) {
      const heightGuideGrid = gridRef.current.clientHeight
      const widthGuideGrid = gridRef.current.clientWidth
      const countGridItem =
        Math.floor(heightGuideGrid / (rowHeight + margin)) * columns

      const cellWidth = (widthGuideGrid - margin * columns) / columns

      const newBackground = generateGridBackground({
        cellSize: { width: cellWidth, height: rowHeight },
        cols: countGridItem,
        gridWidth: widthGuideGrid,
        margin,
      })

      setBackground(newBackground)
    }
  }

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateBackground()
    })

    if (gridRef.current) {
      observer.observe(gridRef.current)
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current)
      }
    }
  }, [columns])

  return (
    <div
      ref={gridRef}
      className="absolute bottom-0 left-0 right-0 top-0 ml-[5px] mt-[5px]"
      style={{ background }}
    />
  )
}

export default memo(GridLayout)
