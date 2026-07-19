"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"

export type PatternCell = "0" | "1" | "2" | "3"
type Pattern = PatternCell[][]

interface LightBoardProps {
  gap?: number
  rows?: number
  lightSize?: number
  updateInterval?: number
  text: string
  font?: "default" | "7segment"
  colors?: Partial<LightBoardColors>
  disableDrawing?: boolean
  controlledDrawState?: PatternCell
  onDrawStateChange?: (newState: PatternCell) => void
  controlledHoverState?: boolean
  onHoverStateChange?: (isHovered: boolean) => void
}

interface LightBoardColors {
  drawLine: string
  background: string
  textDim: string
  textBright: string
}

const defaultColors: LightBoardColors = {
  drawLine: "rgba(180, 180, 180, 0.7)",
  background: "rgba(38, 38, 38, 0.3)",
  textDim: "rgba(115, 115, 115, 0.5)",
  textBright: "rgba(245, 245, 245, 0.9)",
}

const normalizeText = (text: string, minSpacing: number = 3): string => {
  const trimmed = text.trim().toUpperCase()
  const spacedText = ` ${trimmed} `.replace(/\s+/g, " ".repeat(minSpacing))
  return spacedText
}

const textToPattern = (
  text: string,
  rows: number,
  columns: number,
  font: { [key: string]: Pattern }
): Pattern => {
  const letterHeight = font["A"].length
  const scale = Math.max(1, Math.floor(rows / letterHeight))

  const scaledFont = Object.fromEntries(
    Object.entries(font).map(([char, pattern]) => [
      char,
      pattern
        .flatMap((row) => Array(scale).fill(row))
        .map((row) =>
          row.flatMap((cell: PatternCell) =>
            Array(scale).fill(cell === "1" ? "1" : "3")
          )
        ),
    ])
  )
  const normalizedText = normalizeText(text)

  const letterPatterns = normalizedText
    .split("")
    .map((char) => scaledFont[char] || scaledFont[" "])

  let fullPattern: Pattern = Array(scaledFont["A"].length)
    .fill([])
    .map(() => [])

  letterPatterns.forEach((letterPattern) => {
    fullPattern = fullPattern.map((row, i) => [...row, ...letterPattern[i]])
  })

  const totalRows = rows
  const patternRows = fullPattern.length
  const topPadding = Math.floor((totalRows - patternRows) / 2)
  const bottomPadding = totalRows - patternRows - topPadding

  const paddedPattern = [
    ...Array(topPadding).fill(Array(fullPattern[0].length).fill("0")),
    ...fullPattern,
    ...Array(bottomPadding).fill(Array(fullPattern[0].length).fill("0")),
  ]

  const extendedPattern = paddedPattern.map((row) => {
    while (row.length < columns * 2) {
      row = [...row, ...row]
    }
    return row
  })

  return extendedPattern
}

function getLightColor(
  state: PatternCell,
  colors: Partial<LightBoardColors>
): string {
  const mergedColors = { ...defaultColors, ...colors }

  switch (state) {
    case "1":
      return mergedColors.textDim
    case "2":
      return mergedColors.drawLine
    case "3":
      return mergedColors.textBright
    default:
      return mergedColors.background
  }
}

const defaultDrawState: PatternCell = "2"

function LightBoard({
  text,
  gap = 1,
  lightSize = 4,
  rows = 5,
  font = "default",
  updateInterval = 10,
  colors = {},
  controlledDrawState,
  disableDrawing = true,
  controlledHoverState,
  onHoverStateChange,
}: LightBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(0)
  const mergedColors = { ...defaultColors, ...colors }

  const selectedFont = font === "default" ? defaultFont : sevenSegmentFont

  const [isDrawing, setIsDrawing] = useState(false)
  const [internalHoverState, setInternalHoverState] = useState(false)

  const [basePattern, setBasePattern] = useState<Pattern>(() => {
    return textToPattern(normalizeText(text), rows, columns, selectedFont)
  })
  const [offset, setOffset] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastDrawnPosition = useRef<{ x: number; y: number } | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState(0)

  const drawState =
    controlledDrawState !== undefined ? controlledDrawState : defaultDrawState

  const isHovered =
    controlledHoverState !== undefined
      ? controlledHoverState
      : internalHoverState

  useEffect(() => {
    const calculateColumns = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const calculatedColumns = Math.floor(containerWidth / (lightSize + gap))
        setColumns(calculatedColumns)
      }
    }

    calculateColumns()
    window.addEventListener("resize", calculateColumns)
    return () => window.removeEventListener("resize", calculateColumns)
  }, [lightSize, gap])

  const drawToCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const patternWidth = basePattern[0].length

    basePattern.forEach((row, rowIndex) => {
      for (let colIndex = 0; colIndex < columns; colIndex++) {
        const patternColIndex = (colIndex + offset) % patternWidth
        const state = row[patternColIndex]

        ctx.fillStyle = getLightColor(state as PatternCell, mergedColors)
        ctx.beginPath()
        ctx.arc(
          colIndex * (lightSize + gap) + lightSize / 2,
          rowIndex * (lightSize + gap) + lightSize / 2,
          lightSize / 2,
          0,
          2 * Math.PI
        )
        ctx.fill()
      }
    })
  }, [basePattern, offset, columns, lightSize, gap, mergedColors])

  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      if (!isHovered) {
        setOffset((prevOffset) => (prevOffset + 1) % basePattern[0].length)
      }
      drawToCanvas()
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [basePattern, isHovered, drawToCanvas])

  useEffect(() => {
    setBasePattern(
      textToPattern(normalizeText(text), rows, columns, selectedFont)
    )
  }, [text, rows, columns, selectedFont])

  const animate = useCallback(() => {
    const currentTime = Date.now()
    if (currentTime - lastUpdateTime >= updateInterval && !isHovered) {
      setOffset((prevOffset) => (prevOffset + 1) % basePattern[0].length)
      setLastUpdateTime(currentTime)
    }
    drawToCanvas()
  }, [updateInterval, isHovered, basePattern, drawToCanvas, lastUpdateTime])

  useEffect(() => {
    let animationFrameId: number

    const loop = () => {
      animate()
      animationFrameId = requestAnimationFrame(loop)
    }

    animationFrameId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(animationFrameId)
  }, [animate])

  const drawLine = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dx = Math.abs(endX - startX)
      const dy = Math.abs(endY - startY)
      const sx = startX < endX ? 1 : -1
      const sy = startY < endY ? 1 : -1
      let err = dx - dy

      while (true) {
        const colIndex = Math.floor(startX / (lightSize + gap))
        const rowIndex = Math.floor(startY / (lightSize + gap))

        if (
          rowIndex >= 0 &&
          rowIndex < rows &&
          colIndex >= 0 &&
          colIndex < columns
        ) {
          const actualColIndex = (colIndex + offset) % basePattern[0].length

          if (basePattern[rowIndex][actualColIndex] !== drawState) {
            setBasePattern((prevPattern) => {
              const newPattern = [...prevPattern]
              newPattern[rowIndex] = [...newPattern[rowIndex]]
              newPattern[rowIndex][actualColIndex] = drawState
              return newPattern
            })

            ctx.fillStyle = getLightColor(drawState, mergedColors)

            ctx.beginPath()
            ctx.arc(
              colIndex * (lightSize + gap) + lightSize / 2,
              rowIndex * (lightSize + gap) + lightSize / 2,
              lightSize / 2,
              0,
              2 * Math.PI
            )
            ctx.fill()
          }
        }

        if (startX === endX && startY === endY) break

        const e2 = 2 * err
        if (e2 > -dy) {
          err -= dy
          startX += sx
        }
        if (e2 < dx) {
          err += dx
          startY += sy
        }
      }
    },
    [
      basePattern,
      columns,
      drawState,
      gap,
      lightSize,
      offset,
      rows,
      mergedColors,
    ]
  )


  const handleInteractionStart = useCallback(
    (x: number, y: number) => {
      if (disableDrawing) return
      setIsDrawing(true)
      lastDrawnPosition.current = null
      drawLine(x, y, x, y)
    },
    [disableDrawing, drawLine]
  )

  const handleInteractionMove = useCallback(
    (x: number, y: number) => {
      if (!isDrawing || disableDrawing) return
      if (lastDrawnPosition.current) {
        drawLine(lastDrawnPosition.current.x, lastDrawnPosition.current.y, x, y)
      } else {
        drawLine(x, y, x, y)
      }
      lastDrawnPosition.current = { x, y }
    },
    [isDrawing, disableDrawing, drawLine]
  )

  const handleInteractionEnd = useCallback(() => {
    setIsDrawing(false)
    lastDrawnPosition.current = null
  }, [])

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      handleInteractionStart(x, y)
    },
    [handleInteractionStart]
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      handleInteractionMove(x, y)
    },
    [handleInteractionMove]
  )

  const handleMouseUp = handleInteractionEnd

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      const touch = event.touches[0]
      const canvas = event.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      handleInteractionStart(x, y)
    },
    [handleInteractionStart]
  )

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      const touch = event.touches[0]
      const canvas = event.currentTarget
      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      handleInteractionMove(x, y)
    },
    [handleInteractionMove]
  )

  const handleTouchEnd = handleInteractionEnd

  const updateHoverState = useCallback(
    (newState: boolean) => {
      if (controlledHoverState === undefined) {
        setInternalHoverState(newState)
      }
      onHoverStateChange?.(newState)
    },
    [controlledHoverState, onHoverStateChange]
  )

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {columns > 0 && (
        <canvas
          ref={canvasRef}
          width={columns * (lightSize + gap)}
          height={rows * (lightSize + gap)}
          onMouseDown={!disableDrawing ? handleMouseDown : undefined}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseEnter={() =>
            controlledHoverState === undefined && updateHoverState(true)
          }
          onMouseLeave={() => {
            controlledHoverState === undefined && updateHoverState(false)
            handleInteractionEnd()
          }}
          onTouchStart={!disableDrawing ? handleTouchStart : undefined}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          style={{
            cursor: disableDrawing ? "default" : "pointer",
            touchAction: "none",
            userSelect: "none",
          }}
        />
      )}
    </div>
  )
}

export { LightBoard }

const sevenSegmentFont: { [key: string]: Pattern } = {
  "0": [
    ["1", "1", "1"],
    ["1", "0", "1"],
    ["1", "0", "1"],
    ["1", "0", "1"],
    ["1", "1", "1"],
  ],
  "1": [
    ["0", "0", "1"],
    ["0", "0", "1"],
    ["0", "0", "1"],
    ["0", "0", "1"],
    ["0", "0", "1"],
  ],
}

const defaultFont: { [key: string]: Pattern } = {
  " ": [
    ["0", "0", "0", "0"],
    ["0", "0", "0", "0"],
    ["0", "0", "0", "0"],
    ["0", "0", "0", "0"],
    ["0", "0", "0", "0"],
  ],
  A: [
    ["0", "1", "1", "0"],
    ["1", "0", "0", "1"],
    ["1", "1", "1", "1"],
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
  ],
  B: [
    ["1", "1", "1", "0"],
    ["1", "0", "0", "1"],
    ["1", "1", "1", "0"],
    ["1", "0", "0", "1"],
    ["1", "1", "1", "0"],
  ],
  C: [
    ["0", "1", "1", "1"],
    ["1", "0", "0", "0"],
    ["1", "0", "0", "0"],
    ["1", "0", "0", "0"],
    ["0", "1", "1", "1"],
  ],
  D: [
    ["1", "1", "1", "0"],
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
    ["1", "1", "1", "0"],
  ],
  E: [
    ["1", "1", "1", "1"],
    ["1", "0", "0", "0"],
    ["1", "1", "1", "0"],
    ["1", "0", "0", "0"],
    ["1", "1", "1", "1"],
  ],
  F: [
    ["1", "1", "1", "1"],
    ["1", "0", "0", "0"],
    ["1", "1", "1", "0"],
    ["1", "0", "0", "0"],
    ["1", "0", "0", "0"],
  ],
  G: [
    ["0", "1", "1", "1"],
    ["1", "0", "0", "0"],
    ["1", "0", "1", "1"],
    ["1", "0", "0", "1"],
    ["0", "1", "1", "1"],
  ],
  H: [
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
    ["1", "1", "1", "1"],
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
  ],
  I: [
    ["1", "1", "1"],
    ["0", "1", "0"],
    ["0", "1", "0"],
    ["0", "1", "0"],
    ["1", "1", "1"],
  ],
  J: [
    ["0", "0", "1", "1"],
    ["0", "0", "0", "1"],
    ["0", "0", "0", "1"],
    ["1", "0", "0", "1"],
    ["0", "1", "1", "0"],
  ],
  K: [
    ["1", "0", "0", "1"],
    ["1", "0", "1", "0"],
    ["1", "1", "0", "0"],
    ["1", "0", "1", "0"],
    ["1", "0", "0", "1"],
  ],
  L: [
    ["1", "0", "0", "0"],
    ["1", "0", "0", "0"],
    ["1", "0", "0", "0"],
    ["1", "0", "0", "0"],
    ["1", "1", "1", "1"],
  ],
  M: [
    ["1", "0", "0", "0", "1"],
    ["1", "1", "0", "1", "1"],
    ["1", "0", "1", "0", "1"],
    ["1", "0", "0", "0", "1"],
    ["1", "0", "0", "0", "1"],
  ],
  N: [
    ["1", "0", "0", "1"],
    ["1", "1", "0", "1"],
    ["1", "0", "1", "1"],
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
  ],
  O: [
    ["0", "1", "1", "0"],
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
    ["0", "1", "1", "0"],
  ],
  P: [
    ["1", "1", "1", "0"],
    ["1", "0", "0", "1"],
    ["1", "1", "1", "0"],
    ["1", "0", "0", "0"],
    ["1", "0", "0", "0"],
  ],
  Q: [
    ["0", "1", "1", "0"],
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
    ["1", "0", "1", "0"],
    ["0", "1", "0", "1"],
  ],
  R: [
    ["1", "1", "1", "0"],
    ["1", "0", "0", "1"],
    ["1", "1", "1", "0"],
    ["1", "0", "1", "0"],
    ["1", "0", "0", "1"],
  ],
  S: [
    ["0", "1", "1", "1"],
    ["1", "0", "0", "0"],
    ["0", "1", "1", "0"],
    ["0", "0", "0", "1"],
    ["1", "1", "1", "0"],
  ],
  T: [
    ["1", "1", "1", "1", "1"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "1", "0", "0"],
  ],
  U: [
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
    ["1", "0", "0", "1"],
    ["0", "1", "1", "0"],
  ],
  V: [
    ["1", "0", "0", "0", "1"],
    ["1", "0", "0", "0", "1"],
    ["0", "1", "0", "1", "0"],
    ["0", "1", "0", "1", "0"],
    ["0", "0", "1", "0", "0"],
  ],
  W: [
    ["1", "0", "0", "0", "1"],
    ["1", "0", "0", "0", "1"],
    ["1", "0", "1", "0", "1"],
    ["1", "1", "0", "1", "1"],
    ["1", "0", "0", "0", "1"],
  ],
  X: [
    ["1", "0", "0", "1"],
    ["0", "1", "1", "0"],
    ["0", "0", "0", "0"],
    ["0", "1", "1", "0"],
    ["1", "0", "0", "1"],
  ],
  Y: [
    ["1", "0", "0", "0", "1"],
    ["0", "1", "0", "1", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "1", "0", "0"],
    ["0", "0", "1", "0", "0"],
  ],
  Z: [
    ["1", "1", "1", "1"],
    ["0", "0", "0", "1"],
    ["0", "0", "1", "0"],
    ["0", "1", "0", "0"],
    ["1", "1", "1", "1"],
  ],
}

