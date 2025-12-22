import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { AnimationStep, CellState, Arrow, Annotation } from '../../types';
import styles from './Canvas.module.css';

interface CanvasProps {
  step: AnimationStep;
  showAuxiliary: boolean;
}

const CELL_SIZE = 60;
const CELL_GAP = 4;

export function Canvas({ step, showAuxiliary }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const n = step.matrix.length;
  const matrixWidth = n * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const matrixHeight = matrixWidth;

  // 绘制矩阵
  const drawMatrix = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${transform.x}, ${transform.y}) scale(${transform.scale})`);

    // 计算布局
    const hasAux = showAuxiliary && step.auxiliaryMatrix;
    const totalWidth = hasAux ? matrixWidth * 2 + 120 : matrixWidth;
    const startX = -totalWidth / 2;
    const startY = -matrixHeight / 2;

    // 绘制原矩阵标题
    g.append('text')
      .attr('x', startX + matrixWidth / 2)
      .attr('y', startY - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text('原矩阵');

    // 绘制原矩阵
    drawMatrixCells(g, step.matrix, startX, startY, step.highlightCells.filter(c => !c.label?.includes('辅助')), step.arrows?.filter(a => !a.isAuxiliary), step.annotations?.filter(a => !a.isAuxiliary));

    // 绘制辅助矩阵
    if (hasAux && step.auxiliaryMatrix) {
      const auxStartX = startX + matrixWidth + 120;
      
      // 辅助矩阵标题
      g.append('text')
        .attr('x', auxStartX + matrixWidth / 2)
        .attr('y', startY - 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .attr('font-size', '14px')
        .attr('font-weight', '500')
        .text('辅助矩阵 (matrixNew)');

      // 绘制箭头从原矩阵到辅助矩阵
      const auxHighlights = step.highlightCells.filter(c => c.highlight === 'target');
      drawMatrixCells(g, step.auxiliaryMatrix, auxStartX, startY, auxHighlights, step.arrows?.filter(a => a.isAuxiliary), step.annotations?.filter(a => a.isAuxiliary), true);

      // 绘制跨矩阵箭头
      if (step.arrows) {
        step.arrows.filter(a => a.isAuxiliary).forEach(arrow => {
          const fromX = startX + arrow.fromCol * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
          const fromY = startY + arrow.fromRow * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
          const toX = auxStartX + arrow.toCol * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
          const toY = startY + arrow.toRow * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;

          // 绘制曲线箭头
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2 - 30;

          g.append('path')
            .attr('d', `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`)
            .attr('fill', 'none')
            .attr('stroke', arrow.color || '#1890ff')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrowhead)');

          if (arrow.label) {
            g.append('text')
              .attr('x', midX)
              .attr('y', midY - 5)
              .attr('text-anchor', 'middle')
              .attr('fill', arrow.color || '#1890ff')
              .attr('font-size', '12px')
              .attr('font-weight', '500')
              .text(arrow.label);
          }
        });
      }
    }

    // 添加箭头标记定义
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#1890ff');

  }, [step, transform, showAuxiliary, matrixWidth, matrixHeight]);

  const drawMatrixCells = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    matrix: number[][],
    startX: number,
    startY: number,
    highlights: CellState[],
    arrows?: Arrow[],
    annotations?: Annotation[],
    isAuxiliary = false
  ) => {
    const n = matrix.length;

    // 绘制单元格
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = startX + j * (CELL_SIZE + CELL_GAP);
        const y = startY + i * (CELL_SIZE + CELL_GAP);
        const value = matrix[i][j];

        // 查找高亮状态
        const highlight = highlights.find(h => h.row === i && h.col === j);
        let fillColor = '#fff';
        let strokeColor = '#d9d9d9';
        let textColor = '#333';

        if (highlight) {
          switch (highlight.highlight) {
            case 'source':
              fillColor = '#e6f7ff';
              strokeColor = '#1890ff';
              textColor = '#1890ff';
              break;
            case 'target':
              fillColor = '#f6ffed';
              strokeColor = '#52c41a';
              textColor = '#52c41a';
              break;
            case 'temp':
              fillColor = '#fffbe6';
              strokeColor = '#faad14';
              textColor = '#d48806';
              break;
            case 'swapping':
              fillColor = '#fff1f0';
              strokeColor = '#ff4d4f';
              textColor = '#ff4d4f';
              break;
            case 'completed':
              fillColor = '#f6ffed';
              strokeColor = '#52c41a';
              textColor = '#389e0d';
              break;
          }
        }

        // 绘制单元格背景
        g.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', CELL_SIZE)
          .attr('height', CELL_SIZE)
          .attr('rx', 4)
          .attr('fill', fillColor)
          .attr('stroke', strokeColor)
          .attr('stroke-width', highlight ? 2 : 1);

        // 绘制数值
        g.append('text')
          .attr('x', x + CELL_SIZE / 2)
          .attr('y', y + CELL_SIZE / 2 + 5)
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .attr('font-size', '16px')
          .attr('font-weight', highlight ? '600' : '400')
          .text(value);

        // 绘制索引
        g.append('text')
          .attr('x', x + 4)
          .attr('y', y + 12)
          .attr('fill', '#999')
          .attr('font-size', '9px')
          .text(`[${i}][${j}]`);

        // 绘制标签
        if (highlight?.label) {
          g.append('text')
            .attr('x', x + CELL_SIZE / 2)
            .attr('y', y - 6)
            .attr('text-anchor', 'middle')
            .attr('fill', strokeColor)
            .attr('font-size', '11px')
            .attr('font-weight', '500')
            .text(highlight.label);
        }
      }
    }

    // 绘制内部箭头
    if (arrows && !isAuxiliary) {
      arrows.forEach(arrow => {
        const fromX = startX + arrow.fromCol * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
        const fromY = startY + arrow.fromRow * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
        const toX = startX + arrow.toCol * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
        const toY = startY + arrow.toRow * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;

        // 计算偏移以避免箭头穿过单元格中心
        const dx = toX - fromX;
        const dy = toY - fromY;
        const len = Math.sqrt(dx * dx + dy * dy);
        const offsetX = (dx / len) * (CELL_SIZE / 2 + 5);
        const offsetY = (dy / len) * (CELL_SIZE / 2 + 5);

        g.append('line')
          .attr('x1', fromX + offsetX)
          .attr('y1', fromY + offsetY)
          .attr('x2', toX - offsetX)
          .attr('y2', toY - offsetY)
          .attr('stroke', arrow.color || '#1890ff')
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrowhead)');

        if (arrow.label) {
          g.append('text')
            .attr('x', (fromX + toX) / 2)
            .attr('y', (fromY + toY) / 2 - 8)
            .attr('text-anchor', 'middle')
            .attr('fill', arrow.color || '#1890ff')
            .attr('font-size', '11px')
            .text(arrow.label);
        }
      });
    }

    // 绘制标注
    if (annotations) {
      annotations.forEach(ann => {
        const x = startX + ann.col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
        const y = startY + ann.row * (CELL_SIZE + CELL_GAP);
        
        let textX = x;
        let textY = y;
        let anchor = 'middle';

        switch (ann.position) {
          case 'top':
            textY = y - 20;
            break;
          case 'bottom':
            textY = y + CELL_SIZE + 15;
            break;
          case 'left':
            textX = startX + ann.col * (CELL_SIZE + CELL_GAP) - 10;
            textY = y + CELL_SIZE / 2;
            anchor = 'end';
            break;
          case 'right':
            textX = startX + ann.col * (CELL_SIZE + CELL_GAP) + CELL_SIZE + 10;
            textY = y + CELL_SIZE / 2;
            anchor = 'start';
            break;
        }

        g.append('text')
          .attr('x', textX)
          .attr('y', textY)
          .attr('text-anchor', anchor)
          .attr('fill', '#666')
          .attr('font-size', '11px')
          .text(ann.text);
      });
    }
  };

  useEffect(() => {
    drawMatrix();
  }, [drawMatrix]);

  // 居中视图
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setTransform({ x: width / 2, y: height / 2, scale: 1 });
    }
  }, []);

  // 鼠标拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.3, Math.min(3, prev.scale * delta)),
    }));
  };

  return (
    <div 
      ref={containerRef}
      className={styles.container}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <svg ref={svgRef} className={styles.svg} />
      
      <div className={styles.description}>
        <span className={styles.stepNum}>步骤 {step.id + 1}</span>
        <span className={styles.stepText}>{step.description}</span>
      </div>

      <div className={styles.controls}>
        <button 
          className={styles.controlBtn}
          onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 1.2 }))}
        >
          +
        </button>
        <button 
          className={styles.controlBtn}
          onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 0.8 }))}
        >
          −
        </button>
        <button 
          className={styles.controlBtn}
          onClick={() => {
            if (containerRef.current) {
              const { width, height } = containerRef.current.getBoundingClientRect();
              setTransform({ x: width / 2, y: height / 2, scale: 1 });
            }
          }}
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
