import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { AnimationStep, CellState, Annotation } from '../../types'
import styles from './Canvas.module.css'

interface CanvasProps { step: AnimationStep; showAuxiliary: boolean }
interface CellDatum { id: string; row: number; col: number; value: number; x: number; y: number; highlight?: CellState['highlight']; label?: string }
interface ArrowDatum { id: string; fromX: number; fromY: number; toX: number; toY: number; label: string; color: string; curve: boolean }
interface LabelDatum { id: string; x: number; y: number; text: string; anchor: string; color: string }

const CELL_SIZE = 60
const CELL_GAP = 4
const CELL_PITCH = CELL_SIZE + CELL_GAP
const COLORS = { source: '#287a91', target: '#128568', temp: '#bd8426', swapping: '#bf4d45', completed: '#128568' }

export function Canvas({ step, showAuxiliary }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const n = step.matrix.length
  const matrixWidth = n * CELL_PITCH - CELL_GAP
  const matrixHeight = matrixWidth

  const drawMatrix = useCallback(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    let defs = svg.select<SVGDefsElement>('defs')
    if (defs.empty()) defs = svg.append('defs')
    if (defs.select('#arrowhead').empty()) {
      defs.append('marker').attr('id', 'arrowhead').attr('viewBox', '0 -5 10 10').attr('refX', 8).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto').append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#128568')
    }
    let camera = svg.select<SVGGElement>('.camera-layer')
    if (camera.empty()) {
      camera = svg.append('g').attr('class', 'camera-layer')
      camera.append('g').attr('class', 'layer-arrows')
      camera.append('g').attr('class', 'layer-nodes')
      camera.append('g').attr('class', 'layer-labels')
    }
    const { width, height } = svgRef.current.getBoundingClientRect()
    svg.attr('viewBox', `0 0 ${Math.max(width, 1)} ${Math.max(height, 1)}`)
    const hasAux = Boolean(showAuxiliary && step.auxiliaryMatrix)
    const totalWidth = hasAux ? matrixWidth * 2 + 120 : matrixWidth
    const fittedScale = Math.min(width / (totalWidth + 40), height / (matrixHeight + 60), 1)
    const cameraTransform = `translate(${width / 2 + transform.x}, ${height / 2 + transform.y}) scale(${fittedScale * transform.scale})`
    camera.attr('transform', cameraTransform)
    const arrowLayer = camera.select<SVGGElement>('.layer-arrows')
    const nodeLayer = camera.select<SVGGElement>('.layer-nodes')
    const labelLayer = camera.select<SVGGElement>('.layer-labels')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reducedMotion ? 0 : 180
    const startX = -totalWidth / 2
    const startY = -matrixHeight / 2
    const auxStartX = startX + matrixWidth + 120
    const primaryHighlights = step.highlightCells.filter(cell => !cell.label?.includes('辅助'))
    const cells: CellDatum[] = []
    const labels: LabelDatum[] = []
    const matrices = [{ data: step.matrix, x: startX, id: 'main' }]
    if (hasAux && step.auxiliaryMatrix) matrices.push({ data: step.auxiliaryMatrix, x: auxStartX, id: 'aux' })

    for (const matrix of matrices) {
      labels.push({ id: `${matrix.id}-title`, x: matrix.x + matrixWidth / 2, y: startY - 15, text: matrix.id === 'main' ? '原矩阵' : '辅助矩阵 (matrixNew)', anchor: 'middle', color: '#24372e' })
      for (let row = 0; row < matrix.data.length; row++) {
        for (let col = 0; col < matrix.data[row].length; col++) {
          const highlight = matrix.id === 'main'
            ? primaryHighlights.find(cell => cell.row === row && cell.col === col)
            : step.highlightCells.find(cell => cell.row === row && cell.col === col && cell.highlight === 'target')
          cells.push({ id: `${matrix.id}-${row}-${col}`, row, col, value: matrix.data[row][col], x: matrix.x + col * CELL_PITCH, y: startY + row * CELL_PITCH, highlight: highlight?.highlight, label: highlight?.label })
        }
      }
    }

    const arrows: ArrowDatum[] = []
    for (const [index, arrow] of (step.arrows ?? []).entries()) {
      const fromX = startX + arrow.fromCol * CELL_PITCH + CELL_SIZE / 2
      const fromY = startY + arrow.fromRow * CELL_PITCH + CELL_SIZE / 2
      const targetX = (arrow.isAuxiliary && hasAux ? auxStartX : startX) + arrow.toCol * CELL_PITCH + CELL_SIZE / 2
      const targetY = startY + arrow.toRow * CELL_PITCH + CELL_SIZE / 2
      arrows.push({ id: `arrow-${index}`, fromX, fromY, toX: targetX, toY: targetY, label: arrow.label ?? '', color: arrow.color ?? '#128568', curve: Boolean(arrow.isAuxiliary && hasAux) })
    }
    for (const [index, annotation] of (step.annotations ?? []).entries()) {
      if (annotation.isAuxiliary && !hasAux) continue
      const originX = (annotation.isAuxiliary ? auxStartX : startX) + annotation.col * CELL_PITCH
      const originY = startY + annotation.row * CELL_PITCH
      const pos = annotationPosition(annotation, originX, originY)
      labels.push({ id: `annotation-${index}`, x: pos.x, y: pos.y, text: annotation.text, anchor: pos.anchor, color: '#53635c' })
    }

    const nodeJoin = nodeLayer.selectAll<SVGGElement, CellDatum>('g.matrix-cell').data(cells, cell => cell.id)
    nodeJoin.exit().interrupt().transition().duration(duration).attr('opacity', 0).remove()
    const nodeEnter = nodeJoin.enter().append('g').attr('class', 'matrix-cell').attr('data-node-id', cell => cell.id).attr('opacity', 0)
    nodeEnter.append('rect').attr('width', CELL_SIZE).attr('height', CELL_SIZE).attr('rx', 4)
    nodeEnter.append('text').attr('class', 'cell-value').attr('text-anchor', 'middle').attr('x', CELL_SIZE / 2).attr('y', CELL_SIZE / 2 + 5).attr('font-size', '16px')
    nodeEnter.append('text').attr('class', 'cell-index').attr('x', 4).attr('y', 12).attr('font-size', '9px')
    nodeEnter.append('text').attr('class', 'cell-badge').attr('text-anchor', 'middle').attr('y', -6).attr('font-size', '11px')
    const nodeUpdate = nodeEnter.merge(nodeJoin).interrupt()
    nodeUpdate.attr('data-status', cell => cell.highlight === 'source' ? 'current' : cell.highlight === 'target' || cell.highlight === 'temp' ? 'compare' : cell.highlight === 'completed' ? 'done' : 'idle')
    nodeUpdate.transition().duration(duration).attr('transform', cell => `translate(${cell.x},${cell.y})`).attr('opacity', 1)
    nodeUpdate.select('rect').transition().duration(duration).attr('fill', cell => cell.highlight ? `${COLORS[cell.highlight]}18` : '#ffffff').attr('stroke', cell => cell.highlight ? COLORS[cell.highlight] : '#cbd7d0').attr('stroke-width', cell => cell.highlight ? 2 : 1)
    nodeUpdate.select<SVGTextElement>('.cell-value').text(cell => String(cell.value)).attr('fill', cell => cell.highlight ? COLORS[cell.highlight] : '#24372e').attr('font-weight', cell => cell.highlight ? 700 : 500)
    nodeUpdate.select<SVGTextElement>('.cell-index').text(cell => `[${cell.row}][${cell.col}]`).attr('fill', '#829188')
    nodeUpdate.select<SVGTextElement>('.cell-badge').text(cell => cell.label ?? '').attr('fill', cell => cell.highlight ? COLORS[cell.highlight] : '#53635c')

    const arrowJoin = arrowLayer.selectAll<SVGGElement, ArrowDatum>('g.matrix-arrow').data(arrows, arrow => arrow.id)
    arrowJoin.exit().interrupt().transition().duration(duration).attr('opacity', 0).remove()
    const arrowEnter = arrowJoin.enter().append('g').attr('class', 'matrix-arrow').attr('opacity', 0)
    arrowEnter.append('path').attr('fill', 'none').attr('marker-end', 'url(#arrowhead)')
    arrowEnter.append('text').attr('text-anchor', 'middle').attr('font-size', '11px').attr('font-weight', 600).attr('paint-order', 'stroke').attr('stroke', '#fbfcfa').attr('stroke-width', 4)
    const arrowUpdate = arrowEnter.merge(arrowJoin).interrupt().attr('data-arrow-id', arrow => arrow.id)
    arrowUpdate.transition().duration(duration).attr('opacity', 1)
    arrowUpdate.select('path').attr('d', arrow => arrow.curve ? `M${arrow.fromX},${arrow.fromY} Q${(arrow.fromX + arrow.toX) / 2},${(arrow.fromY + arrow.toY) / 2 - 30} ${arrow.toX},${arrow.toY}` : `M${arrow.fromX},${arrow.fromY} L${arrow.toX},${arrow.toY}`).attr('stroke', arrow => arrow.color).attr('stroke-width', 2)
    arrowUpdate.select('text').text(arrow => arrow.label).attr('x', arrow => (arrow.fromX + arrow.toX) / 2).attr('y', arrow => (arrow.fromY + arrow.toY) / 2 - 8).attr('fill', arrow => arrow.color)

    const labelJoin = labelLayer.selectAll<SVGTextElement, LabelDatum>('text.matrix-label').data(labels, label => label.id)
    labelJoin.exit().interrupt().transition().duration(duration).attr('opacity', 0).remove()
    labelJoin.enter().append('text').attr('class', 'matrix-label').attr('opacity', 0).merge(labelJoin).interrupt().attr('text-anchor', label => label.anchor).attr('font-size', '14px').attr('font-weight', 600).text(label => label.text).attr('fill', label => label.color).transition().duration(duration).attr('x', label => label.x).attr('y', label => label.y).attr('opacity', 1)
  }, [step, transform, showAuxiliary, matrixWidth, matrixHeight])

  useEffect(() => { drawMatrix() }, [drawMatrix])

  useEffect(() => {
    setTransform({ x: 0, y: 0, scale: 1 })
  }, [])

  const handleMouseDown = (event: React.MouseEvent) => {
    const bounds = containerRef.current?.getBoundingClientRect()
    if (!bounds) return
    setIsDragging(true)
    setDragStart({ x: event.clientX - bounds.left - transform.x, y: event.clientY - bounds.top - transform.y })
  }
  const handleMouseMove = (event: React.MouseEvent) => {
    const bounds = containerRef.current?.getBoundingClientRect()
    if (isDragging && bounds) setTransform(prev => ({ ...prev, x: event.clientX - bounds.left - dragStart.x, y: event.clientY - bounds.top - dragStart.y }))
  }
  const handleWheel = (event: React.WheelEvent) => { event.preventDefault(); const delta = event.deltaY > 0 ? 0.9 : 1.1; setTransform(prev => ({ ...prev, scale: Math.max(0.3, Math.min(3, prev.scale * delta)) })) }

  return (
    <div ref={containerRef} className={styles.container} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)} onWheel={handleWheel}>
      <svg ref={svgRef} className={styles.svg} />
      <div className={styles.description}><span className={styles.stepNum}>步骤 {step.id + 1}</span><span className={styles.stepText}>{step.description}</span></div>
      <div className={styles.controls}>
        <button className={styles.controlBtn} aria-label="放大" onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }))}>+</button>
        <button className={styles.controlBtn} aria-label="缩小" onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.3, prev.scale * 0.8) }))}>−</button>
        <button className={styles.controlBtn} aria-label="重置画布" onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}>⟲</button>
      </div>
    </div>
  )
}

function annotationPosition(annotation: Annotation, x: number, y: number): { x: number; y: number; anchor: string } {
  switch (annotation.position) {
    case 'top': return { x: x + CELL_SIZE / 2, y: y - 20, anchor: 'middle' }
    case 'bottom': return { x: x + CELL_SIZE / 2, y: y + CELL_SIZE + 15, anchor: 'middle' }
    case 'left': return { x: x - 10, y: y + CELL_SIZE / 2, anchor: 'end' }
    case 'right': return { x: x + CELL_SIZE + 10, y: y + CELL_SIZE / 2, anchor: 'start' }
  }
}
