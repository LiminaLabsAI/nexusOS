import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Database, Server, Globe, Cpu, FileSpreadsheet, Cloud, Warehouse, Link2
} from 'lucide-react';

const typeColors = {
  erp: '#60a5fa',      // blue
  crm: '#a78bfa',      // violet
  iot: '#fbbf24',      // amber
  database: '#34d399', // emerald
  api: '#22d3ee',      // cyan
  file_upload: '#f472b6', // pink
  warehouse: '#fb923c', // orange
};

const typeIcons = {
  erp: Server, crm: Globe, iot: Cpu,
  database: Database, api: Cloud, file_upload: FileSpreadsheet, warehouse: Warehouse,
};

function useLayout(namedEntities, selectedSources, relationships) {
  return useMemo(() => {
    const W = 700;
    const H = 380;
    const cx = W / 2;
    const cy = H / 2;

    // Entity nodes — arranged in a circle
    const entityCount = namedEntities.length;
    const entityRadius = Math.min(130, 60 + entityCount * 18);
    const entityNodes = namedEntities.map((e, i) => {
      const angle = (2 * Math.PI * i) / entityCount - Math.PI / 2;
      return {
        id: e.name,
        label: e.name,
        x: cx + entityRadius * Math.cos(angle),
        y: cy + entityRadius * Math.sin(angle),
        type: 'entity',
        fields: 0,
      };
    });

    // Source nodes — outer ring
    const sourceCount = selectedSources.length;
    const sourceRadius = Math.min(200, 130 + sourceCount * 10);
    const sourceNodes = selectedSources.map((s, i) => {
      const angle = (2 * Math.PI * i) / sourceCount - Math.PI / 4;
      return {
        id: s.id,
        label: s.name,
        x: cx + sourceRadius * Math.cos(angle),
        y: cy + sourceRadius * Math.sin(angle),
        type: 'source',
        srcType: s.type,
      };
    });

    // Edges: entity→entity relationships
    const relEdges = relationships.map(r => ({
      from: entityNodes.find(n => n.id === r.from),
      to: entityNodes.find(n => n.id === r.to),
      label: r.type === 'foreign_key' ? 'FK' : `via ${r.via || ''}`,
      type: 'relationship',
    })).filter(e => e.from && e.to);

    return { entityNodes, sourceNodes, relEdges, W, H };
  }, [namedEntities, selectedSources, relationships]);
}

export default function SemanticLayerGraph({ namedEntities, selectedSources, fieldMappings, relationships }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const { entityNodes, sourceNodes, relEdges, W, H } = useLayout(namedEntities, selectedSources, relationships);

  // Which sources feed which entities (based on fieldMappings)
  const sourceEdges = useMemo(() => {
    const edges = [];
    namedEntities.forEach(e => {
      const mappings = fieldMappings[e.name] || [];
      const sourceNames = [...new Set(mappings.map(m => m.sourceName).filter(Boolean))];
      sourceNames.forEach(sn => {
        const srcNode = sourceNodes.find(n => n.label === sn);
        const entNode = entityNodes.find(n => n.id === e.name);
        if (srcNode && entNode) edges.push({ from: srcNode, to: entNode });
      });
    });
    return edges;
  }, [namedEntities, fieldMappings, entityNodes, sourceNodes]);

  const allNodes = [...entityNodes, ...sourceNodes];
  const hoveredNodeData = hoveredNode ? allNodes.find(n => n.id === hoveredNode) : null;

  return (
    <div className="relative w-full rounded-xl border border-border/60 bg-[hsl(222_47%_5%)] overflow-hidden">
      {/* Legend */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-primary/60 border border-primary" />
          Entity
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-secondary border border-border" />
          Source
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="w-4 h-px bg-amber-400/70" />
          Relationship
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minHeight: 260 }}>
        <defs>
          {/* Glow filters */}
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Arrow marker for relationship lines */}
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(251,191,36,0.6)" />
          </marker>
          {/* Dashed arrow for source→entity */}
          <marker id="arrowhead-src" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
            <polygon points="0 0, 6 2.5, 0 5" fill="rgba(255,255,255,0.15)" />
          </marker>
        </defs>

        {/* Background grid */}
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        </pattern>
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Source → Entity edges (dashed) */}
        {sourceEdges.map((edge, i) => (
          <line
            key={`se-${i}`}
            x1={edge.from.x} y1={edge.from.y}
            x2={edge.to.x} y2={edge.to.y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            markerEnd="url(#arrowhead-src)"
          />
        ))}

        {/* Relationship edges (solid amber) */}
        {relEdges.map((edge, i) => {
          const mx = (edge.from.x + edge.to.x) / 2;
          const my = (edge.from.y + edge.to.y) / 2 - 18;
          return (
            <g key={`rel-${i}`} filter="url(#glow-amber)">
              <line
                x1={edge.from.x} y1={edge.from.y}
                x2={edge.to.x} y2={edge.to.y}
                stroke="rgba(251,191,36,0.55)"
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
              {edge.label && (
                <text x={mx} y={my} textAnchor="middle" fontSize="9" fill="rgba(251,191,36,0.75)" fontFamily="monospace">
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Source nodes */}
        {sourceNodes.map(node => {
          const col = typeColors[node.srcType] || '#94a3b8';
          const isHov = hoveredNode === node.id;
          return (
            <g key={node.id}
              transform={`translate(${node.x},${node.y})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}>
              <circle r={isHov ? 20 : 16} fill={`${col}18`} stroke={col} strokeWidth={isHov ? 2 : 1}
                style={{ transition: 'all 0.15s' }} />
              {/* Icon placeholder — using text abbreviation */}
              <text textAnchor="middle" dominantBaseline="central" fontSize="9"
                fill={col} fontWeight="600" fontFamily="monospace">
                {node.label.slice(0, 3).toUpperCase()}
              </text>
              <text y={isHov ? 30 : 26} textAnchor="middle" fontSize="9.5" fill="rgba(255,255,255,0.55)"
                style={{ transition: 'all 0.15s' }}>
                {node.label.length > 10 ? node.label.slice(0, 10) + '…' : node.label}
              </text>
            </g>
          );
        })}

        {/* Entity nodes */}
        {entityNodes.map(node => {
          const isHov = hoveredNode === node.id;
          const mappingCount = (fieldMappings[node.id] || []).length;
          return (
            <g key={node.id}
              transform={`translate(${node.x},${node.y})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              filter={isHov ? 'url(#glow-blue)' : undefined}>
              {/* Outer ring */}
              <circle r={isHov ? 34 : 30} fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.25)" strokeWidth="1"
                style={{ transition: 'all 0.15s' }} />
              {/* Inner circle */}
              <circle r={isHov ? 25 : 22} fill="hsl(222 44% 10%)" stroke="hsl(217 91% 60%)"
                strokeWidth={isHov ? 2 : 1.5} style={{ transition: 'all 0.15s' }} />
              {/* Entity label */}
              <text textAnchor="middle" dominantBaseline="central" fontSize="10"
                fill="rgba(255,255,255,0.9)" fontWeight="600">
                {node.label.length > 8 ? node.label.slice(0, 8) + '…' : node.label}
              </text>
              {/* Field count badge */}
              {mappingCount > 0 && (
                <g transform={`translate(16,-16)`}>
                  <circle r="8" fill="hsl(217 91% 60%)" />
                  <text textAnchor="middle" dominantBaseline="central" fontSize="7.5"
                    fill="hsl(222 47% 6%)" fontWeight="700">{mappingCount}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredNodeData && (
        <div className="absolute bottom-3 left-3 bg-card border border-border/60 rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none z-10 max-w-[200px]">
          <p className="font-semibold text-foreground">{hoveredNodeData.label}</p>
          {hoveredNodeData.type === 'entity' && (
            <p className="text-muted-foreground mt-0.5">
              {(fieldMappings[hoveredNodeData.id] || []).length} mapped field{(fieldMappings[hoveredNodeData.id] || []).length !== 1 ? 's' : ''}
            </p>
          )}
          {hoveredNodeData.type === 'source' && (
            <p className="text-muted-foreground mt-0.5 capitalize">{hoveredNodeData.srcType}</p>
          )}
        </div>
      )}
    </div>
  );
}