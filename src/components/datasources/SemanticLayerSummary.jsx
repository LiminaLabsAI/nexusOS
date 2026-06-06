import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Database, ChevronRight, ArrowRight, Link2, Layers,
  Server, Globe, Cpu, FileSpreadsheet, Cloud, Warehouse,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const typeIcons = {
  erp: Server, crm: Globe, iot: Cpu,
  database: Database, api: Cloud, file_upload: FileSpreadsheet, warehouse: Warehouse,
};
const typeColors = {
  erp: 'text-blue-400', crm: 'text-violet-400', iot: 'text-amber-400',
  database: 'text-emerald-400', api: 'text-cyan-400', file_upload: 'text-pink-400', warehouse: 'text-orange-400',
};
const typeLabels = {
  erp: 'ERP', crm: 'CRM', iot: 'IoT', database: 'DB', api: 'API', file_upload: 'File', warehouse: 'DWH',
};

const FIELD_TYPE_COLORS = {
  string: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  number: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  integer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  date: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  boolean: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  id: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

function inferRelationships(namedEntities, fieldMappings) {
  const relationships = [];
  const seen = new Set();

  namedEntities.forEach(entityA => {
    const mappingsA = fieldMappings[entityA.name] || [];
    namedEntities.forEach(entityB => {
      if (entityA.name === entityB.name) return;
      const key = [entityA.name, entityB.name].sort().join('__');
      if (seen.has(key)) return;

      const mappingsB = fieldMappings[entityB.name] || [];
      // Find shared source
      const sourcesA = new Set(mappingsA.map(m => m.sourceName).filter(Boolean));
      const sourcesB = new Set(mappingsB.map(m => m.sourceName).filter(Boolean));
      const shared = [...sourcesA].filter(s => sourcesB.has(s));

      // Look for id/foreign key patterns
      const aHasIdForB = mappingsA.some(m =>
        m.field?.toLowerCase().includes(entityB.name.toLowerCase()) ||
        m.sourceField?.toLowerCase().includes(entityB.name.toLowerCase() + '_id')
      );
      const bHasIdForA = mappingsB.some(m =>
        m.field?.toLowerCase().includes(entityA.name.toLowerCase()) ||
        m.sourceField?.toLowerCase().includes(entityA.name.toLowerCase() + '_id')
      );

      if (aHasIdForB || bHasIdForA || shared.length > 0) {
        seen.add(key);
        relationships.push({
          from: aHasIdForB ? entityA.name : entityB.name,
          to: aHasIdForB ? entityB.name : entityA.name,
          type: aHasIdForB || bHasIdForA ? 'foreign_key' : 'shared_source',
          via: shared[0] || null,
        });
      }
    });
  });

  return relationships;
}

function EntityCard({ entity, mappings, sources, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const fieldCount = mappings.length;
  const sourcesUsed = [...new Set(mappings.map(m => m.sourceName).filter(Boolean))];

  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Database className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{entity.name}</p>
          {entity.description && (
            <p className="text-[10px] text-muted-foreground truncate">{entity.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-[10px]">{fieldCount} field{fieldCount !== 1 ? 's' : ''}</Badge>
          {sourcesUsed.map(sn => {
            const src = sources.find(s => s.name === sn);
            const Icon = src ? (typeIcons[src.type] || Database) : Database;
            const col = src ? (typeColors[src.type] || 'text-muted-foreground') : 'text-muted-foreground';
            return (
              <Badge key={sn} variant="outline" className={cn("text-[10px] gap-1", col)}>
                <Icon className="w-2.5 h-2.5" />{sn}
              </Badge>
            );
          })}
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>

      {/* Fields */}
      {open && (
        <div className="border-t border-border/40 px-4 py-3 space-y-1.5">
          {fieldCount === 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <AlertCircle className="w-3.5 h-3.5" />
              No field mappings — will be auto-inferred on first sync
            </div>
          ) : (
            mappings.map((m, i) => {
              const src = sources.find(s => s.name === m.sourceName);
              const Icon = src ? (typeIcons[src.type] || Database) : Database;
              const col = src ? (typeColors[src.type] || 'text-muted-foreground') : 'text-muted-foreground';
              const typeCls = FIELD_TYPE_COLORS[m.type?.toLowerCase()] || 'bg-secondary text-muted-foreground border-border';
              return (
                <div key={i} className="flex items-center gap-2 text-xs bg-secondary/40 rounded-lg px-3 py-2">
                  {/* Semantic field */}
                  <span className="font-mono font-medium text-foreground w-28 truncate">{m.field}</span>
                  {m.type && (
                    <span className={cn("text-[9px] border rounded px-1.5 py-0.5 font-medium flex-shrink-0", typeCls)}>
                      {m.type}
                    </span>
                  )}
                  <ArrowRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 mx-0.5" />
                  {/* Source field */}
                  <Icon className={cn("w-3 h-3 flex-shrink-0", col)} />
                  <span className="text-muted-foreground truncate">
                    <span className={cn("font-medium", col)}>{m.sourceName || '?'}</span>
                    <span className="text-muted-foreground/60">.</span>
                    <span>{m.sourceField || '?'}</span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function SemanticLayerSummary({ layerName, layerDescription, namedEntities, fieldMappings, selectedSources }) {
  const relationships = inferRelationships(namedEntities, fieldMappings);
  const totalFields = namedEntities.reduce((sum, e) => sum + (fieldMappings[e.name]?.length || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary">{layerName}</p>
            {layerDescription && <p className="text-xs text-muted-foreground mt-0.5">{layerDescription}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { label: `${selectedSources.length} source${selectedSources.length !== 1 ? 's' : ''}`, color: 'text-cyan-400' },
                { label: `${namedEntities.length} entit${namedEntities.length !== 1 ? 'ies' : 'y'}`, color: 'text-primary' },
                { label: `${totalFields} mapped field${totalFields !== 1 ? 's' : ''}`, color: 'text-emerald-400' },
                { label: `${relationships.length} relationship${relationships.length !== 1 ? 's' : ''}`, color: 'text-amber-400' },
              ].map(s => (
                <span key={s.label} className={cn("text-[11px] font-medium", s.color)}>{s.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sources row */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Connected Sources</p>
        <div className="flex flex-wrap gap-2">
          {selectedSources.map(src => {
            const Icon = typeIcons[src.type] || Database;
            const col = typeColors[src.type] || 'text-muted-foreground';
            return (
              <div key={src.id} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-card text-xs", col)}>
                <Icon className="w-3.5 h-3.5" />
                <span className="font-medium text-foreground">{src.name}</span>
                <span className="text-muted-foreground text-[10px]">{typeLabels[src.type]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Entities + fields (collapsible) */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Entities & Field Mappings</p>
        <div className="space-y-2">
          {namedEntities.map((entity, i) => (
            <EntityCard
              key={entity.name}
              entity={entity}
              mappings={fieldMappings[entity.name] || []}
              sources={selectedSources}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </div>

      {/* Relationships */}
      {relationships.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Inferred Relationships</p>
          <div className="space-y-1.5">
            {relationships.map((rel, i) => (
              <div key={i} className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2 text-xs">
                <Link2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="font-semibold text-foreground">{rel.from}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="font-semibold text-foreground">{rel.to}</span>
                <Badge variant="outline" className="ml-auto text-[9px] text-amber-400 border-amber-500/30">
                  {rel.type === 'foreign_key' ? 'FK join' : `via ${rel.via}`}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No mappings fallback */}
      {totalFields === 0 && (
        <div className="flex items-center gap-2 bg-secondary/40 rounded-lg px-4 py-3 text-xs text-muted-foreground">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          No field mappings were generated. Fields will be auto-inferred by Cube.js on first sync.
        </div>
      )}

      <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3 text-xs text-emerald-400">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        Everything looks good. Set the persistence layer to confirm the build.
      </div>
    </div>
  );
}