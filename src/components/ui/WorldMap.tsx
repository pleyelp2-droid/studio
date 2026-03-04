
'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Chunk } from '@/types';

interface WorldMapProps {
  chunks: Chunk[];
}

export default function WorldMap({ chunks }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || chunks.length === 0) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.parentElement?.clientWidth || 800;
    const height = 500;

    svg.attr('width', '100%').attr('height', height);

    const g = svg.append('g');

    // Zoom and Pan logic
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initial positioning: Center on (0,0)
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.5));

    // Biome Color Mapping
    const getBiomeColor = (biome: string) => {
      switch (biome?.toUpperCase()) {
        case 'CITY': return '#60D4FF';
        case 'FOREST': return '#2d5a27';
        case 'DESERT': return '#d2b48c';
        case 'MOUNTAIN': return '#4a5570';
        case 'PLAINS': return '#8ebd60';
        default: return '#1a1a1a';
      }
    };

    const cellSize = 100;
    const gap = 5;

    // Render Chunks as rectangles
    const rects = g.selectAll('rect')
      .data(chunks)
      .enter()
      .append('rect')
      .attr('x', d => d.x * (cellSize + gap))
      .attr('y', d => d.z * (cellSize + gap)) // Using 'z' as the 2nd horizontal coordinate
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 8)
      .attr('fill', d => getBiomeColor(d.biome))
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s');

    // Hover effects
    rects.on('mouseover', function() {
      d3.select(this)
        .attr('stroke', '#60D4FF')
        .attr('stroke-width', 3)
        .attr('filter', 'drop-shadow(0 0 10px rgba(96,212,255,0.5))');
    }).on('mouseout', function() {
      d3.select(this)
        .attr('stroke', 'rgba(255,255,255,0.1)')
        .attr('stroke-width', 1)
        .attr('filter', 'none');
    });

    // Render Text Labels (IDs and Biomes)
    g.selectAll('text.id')
      .data(chunks)
      .enter()
      .append('text')
      .attr('class', 'id')
      .attr('x', d => d.x * (cellSize + gap) + 10)
      .attr('y', d => d.z * (cellSize + gap) + 25)
      .attr('font-size', '10px')
      .attr('font-weight', '900')
      .attr('font-family', 'var(--font-code)')
      .attr('fill', 'white')
      .style('pointer-events', 'none')
      .text(d => d.id);

    g.selectAll('text.biome')
      .data(chunks)
      .enter()
      .append('text')
      .attr('class', 'biome')
      .attr('x', d => d.x * (cellSize + gap) + 10)
      .attr('y', d => d.z * (cellSize + gap) + 45)
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .attr('fill', 'rgba(255,255,255,0.5)')
      .attr('text-transform', 'uppercase')
      .style('pointer-events', 'none')
      .text(d => d.biome);

  }, [chunks]);

  return (
    <div className="w-full border border-white/5 rounded-3xl overflow-hidden bg-black/40 backdrop-blur-xl shadow-2xl relative group">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <span className="text-[8px] font-black text-axiom-cyan uppercase tracking-[0.4em] italic">Axiom Map Protocol</span>
        <span className="text-[10px] text-white/40 uppercase font-bold">Zoomable Vector Field</span>
      </div>
      <svg ref={svgRef} className="cursor-move" />
      <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-4 text-[8px] font-black uppercase text-white/20">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#60D4FF]" /> City</span>
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#2d5a27]" /> Forest</span>
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#d2b48c]" /> Desert</span>
        </div>
      </div>
    </div>
  );
}
