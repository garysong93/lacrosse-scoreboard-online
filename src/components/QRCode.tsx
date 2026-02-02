import { useEffect, useRef } from 'react'

interface QRCodeProps {
  value: string
  size?: number
  bgColor?: string
  fgColor?: string
}

export function QRCode({ value, size = 128, bgColor = '#ffffff', fgColor = '#000000' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const matrix = generateQRMatrix(value)
    const moduleSize = Math.floor(size / matrix.length)
    const actualSize = moduleSize * matrix.length

    canvas.width = actualSize
    canvas.height = actualSize

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, actualSize, actualSize)

    ctx.fillStyle = fgColor
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }, [value, size, bgColor, fgColor])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
      }}
    />
  )
}

const ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'

function generateQRMatrix(data: string): boolean[][] {
  const size = 25
  const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false))

  addFinderPattern(matrix, 0, 0)
  addFinderPattern(matrix, size - 7, 0)
  addFinderPattern(matrix, 0, size - 7)

  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }

  addAlignmentPattern(matrix, size - 9, size - 9)

  const encoded = encodeAlphanumeric(data.toUpperCase())
  placeData(matrix, encoded)

  return matrix
}

function addFinderPattern(matrix: boolean[][], startX: number, startY: number) {
  for (let i = 0; i < 7; i++) {
    matrix[startY][startX + i] = true
    matrix[startY + 6][startX + i] = true
    matrix[startY + i][startX] = true
    matrix[startY + i][startX + 6] = true
  }
  for (let y = 1; y < 6; y++) {
    for (let x = 1; x < 6; x++) {
      matrix[startY + y][startX + x] = false
    }
  }
  for (let y = 2; y < 5; y++) {
    for (let x = 2; x < 5; x++) {
      matrix[startY + y][startX + x] = true
    }
  }

  if (startX === 0) {
    for (let i = 0; i < 8; i++) {
      if (startY + i < matrix.length) matrix[startY + i][7] = false
    }
  }
  if (startY === 0) {
    for (let i = 0; i < 8; i++) {
      if (startX + i < matrix.length) matrix[7][startX + i] = false
    }
  }
}

function addAlignmentPattern(matrix: boolean[][], centerX: number, centerY: number) {
  for (let y = -2; y <= 2; y++) {
    for (let x = -2; x <= 2; x++) {
      const isEdge = Math.abs(x) === 2 || Math.abs(y) === 2
      const isCenter = x === 0 && y === 0
      matrix[centerY + y][centerX + x] = isEdge || isCenter
    }
  }
}

function encodeAlphanumeric(data: string): boolean[] {
  const bits: boolean[] = []

  bits.push(false, false, true, false)

  const countBits = data.length.toString(2).padStart(9, '0')
  for (const bit of countBits) {
    bits.push(bit === '1')
  }

  for (let i = 0; i < data.length; i += 2) {
    const char1 = ALPHANUMERIC_CHARS.indexOf(data[i])
    if (i + 1 < data.length) {
      const char2 = ALPHANUMERIC_CHARS.indexOf(data[i + 1])
      const value = char1 * 45 + char2
      const valueBits = value.toString(2).padStart(11, '0')
      for (const bit of valueBits) {
        bits.push(bit === '1')
      }
    } else {
      const valueBits = char1.toString(2).padStart(6, '0')
      for (const bit of valueBits) {
        bits.push(bit === '1')
      }
    }
  }

  for (let i = 0; i < 4 && bits.length < 128; i++) {
    bits.push(false)
  }

  return bits
}

function placeData(matrix: boolean[][], data: boolean[]) {
  const size = matrix.length
  let dataIndex = 0
  let upward = true

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right = 5

    for (let i = 0; i < size; i++) {
      const y = upward ? size - 1 - i : i

      for (let dx = 0; dx < 2; dx++) {
        const x = right - dx

        if (isReserved(x, y, size)) continue

        if (dataIndex < data.length) {
          matrix[y][x] = data[dataIndex]
          dataIndex++
        } else {
          matrix[y][x] = (dataIndex + x + y) % 2 === 0
          dataIndex++
        }
      }
    }

    upward = !upward
  }
}

function isReserved(x: number, y: number, size: number): boolean {
  if (x < 9 && y < 9) return true
  if (x < 9 && y >= size - 8) return true
  if (x >= size - 8 && y < 9) return true

  if (x === 6 || y === 6) return true

  const alignX = size - 9
  const alignY = size - 9
  if (Math.abs(x - alignX) <= 2 && Math.abs(y - alignY) <= 2) return true

  return false
}

export default QRCode
