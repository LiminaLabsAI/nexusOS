import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Layers, Database, CheckCircle2, AlertCircle, Clock,
  Activity, Server, Globe, Cpu, FileSpreadsheet, Cloud, Warehouse,
  Zap, HardDrive, Search, X
} from 'lucide-react';

const typeIcons = {
  erp: Server, crm: Globe, iot: Cpu,
  database: Database, api: Cloud, file_upload: FileSpreadsheet, warehouse: Warehouse,
};

function computeHealthScore(layer, allSources) {
  let score = 100;
  const linkedSources = allSources.filter(s => (layer.source_ids || []).includes(s.id));

  // Penalise for disconnected / errored sources
  const errorCount = linkedSources.filter(s => s.status === 'error').length;
  const disconnected = linkedSources.filter(s => s.status === 'disconnected').length;
  score -= errorCount * 25;
  score -= disconnected * 10;

  // Penalise if no field mappings
  const mappingKeys = Object.keys(layer.field_mappings || {});
  if (mappingKeys.length === 0) score -= 10;

  // Penalise stale sync (> 24h)
  const lastSync = linkedSources.map(s => s.last_sync).filter(Boolean).sort().pop();
  if (lastSync) {
    const hoursAgo = (Date.now() - new Date(lastSync).getTime()) / 36e5;
    if (hoursAgo > 48) score -= 20;
    else if (hoursAgo > 24) score -= 10;
  } else {
    score -= 15;
  }

  // Penalise if layer itself is in error
  if (layer.status === 'error') score -= 30;

  return Math.max(0, Math.min(100, score));
}

function healthLabel(score) {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-400', bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  if (score >= 65) return { label: 'Good', color: 'text-blue-400', bar: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
  if (score >= 40) return { label: 'Degraded', color: 'text-amber-400', bar: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  return { label: 'Critical', color: 'text-red-400', bar: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 border-red-500/20' };
}

function getLastSyncTime(layer, allSources) {
  const linkedSources = allSources.filter(s => (layer.source_ids || []).includes(s.id));
  const times = linkedSources.map(s => s.last_sync).filter(Boolean);
  if (!times.length) return null;
  return times.sort().pop();
}

function HealthRing({ score, size = 44 }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const h = healthLabel(score);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={5}
          className="stroke-secondary" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={5}
          stroke="currentColor"
          className={cn("transition-all duration-700", h.color)}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-[10px] font-bold", h.color)}>{score}</span>
      </div>
    </div>
  );
}

function LayerCard({ layer, allSources, index }) {
  const score = computeHealthScore(layer, allSources);
  const h = healthLabel(score);
  const lastSync = getLastSyncTime(layer, allSources);
  const linkedSources = allSources.filter(s => (layer.source_ids || []).includes(s.id));
  const entityCount = (layer.entities || []).length;
  const fieldCount = Object.values(layer.field_mappings || {}).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);

  const statusConfig = {
    active:    { icon: CheckCircle2, color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    building:  { icon: Activity,     color: 'text-blue-400',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    error:     { icon: AlertCircle,  color: 'text-red-400',     badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };
  const sc = statusConfig[layer.status] || statusConfig.building;
  const StatusIcon = sc.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border/50 rounded-xl p-4 space-y-3 hover:border-border transition-colors"
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Layers className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold truncate">{layer.name}</p>
            <Badge className={cn("text-[10px] border flex items-center gap-1", sc.badge)}>
              <StatusIcon className="w-2.5 h-2.5" />
              {layer.status || 'building'}
            </Badge>
          </div>
          {layer.description && (
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{layer.description}</p>
          )}
        </div>
        {/* Health ring */}
        <HealthRing score={score} size={44} />
      </div>

      {/* Health bar + label */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Health</span>
          <span className={cn("font-semibold", h.color)}>{h.label} · {score}/100</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", h.bar)}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.7, delay: index * 0.05 + 0.1 }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Database, label: 'Sources',  value: linkedSources.length },
          { icon: Layers,   label: 'Entities', value: entityCount },
          { icon: Zap,      label: 'Fields',   value: fieldCount },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-secondary/40 rounded-lg px-2 py-1.5 text-center">
            <Icon className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
            <p className="text-sm font-bold">{value}</p>
            <p className="text-[9px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Connected sources icons */}
      {linkedSources.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground mr-0.5">Sources:</span>
          {linkedSources.map(src => {
            const Icon = typeIcons[src.type] || Database;
            const isOk = src.status === 'connected' || src.status === 'syncing';
            return (
              <div key={src.id} title={src.name}
                className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border",
                  isOk ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                       : "bg-secondary border-border text-muted-foreground")}>
                <Icon className="w-2.5 h-2.5" />
                <span className="max-w-[60px] truncate">{src.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Last sync + persistence */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-2">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {lastSync
            ? <span>Synced {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}</span>
            : <span className="italic">Never synced</span>}
        </div>
        {layer.persistence_location && (
          <div className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            <span className="capitalize">
              {layer.persistence_location === 'cloud'
                ? `${layer.persistence_provider || 'Cloud'} · ${layer.persistence_region || ''}`
                : 'Local'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const STATUS_OPTIONS = ['all', 'active', 'building', 'error'];

export default function SemanticLayerDashboard({ sources }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  const { data: layers = [] } = useQuery({
    queryKey: ['semantic-layers'],
    queryFn: () => base44.entities.SemanticLayer.list('-created_date'),
    initialData: [],
  });

  if (layers.length === 0) return null;

  // Derive unique providers from linked sources
  const allProviders = [...new Set(
    layers.flatMap(l =>
      (l.source_ids || []).map(id => sources.find(s => s.id === id)?.provider).filter(Boolean)
    )
  )];

  const filtered = layers.filter(l => {
    const matchName = !search || l.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchProvider = providerFilter === 'all' || (l.source_ids || []).some(id => {
      const src = sources.find(s => s.id === id);
      return src?.provider === providerFilter;
    });
    return matchName && matchStatus && matchProvider;
  });

  const avgHealth = Math.round(
    layers.reduce((sum, l) => sum + computeHealthScore(l, sources), 0) / layers.length
  );
  const activeCount = layers.filter(l => l.status === 'active').length;
  const h = healthLabel(avgHealth);
  const hasActiveFilters = search || statusFilter !== 'all' || providerFilter !== 'all';

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Semantic Layers</h2>
          <Badge variant="outline" className="text-[10px]">{layers.length} total</Badge>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-muted-foreground">Avg health</span>
          <span className={cn("font-bold", h.color)}>{avgHealth}/100 · {h.label}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-emerald-400 font-medium">{activeCount} active</span>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search layers…"
            className="pl-8 h-8 text-xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border",
                statusFilter === s
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "text-muted-foreground border-border hover:border-border/80 hover:text-foreground"
              )}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Provider filter */}
        {allProviders.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {['all', ...allProviders].map(p => (
              <button key={p} onClick={() => setProviderFilter(p)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border",
                  providerFilter === p
                    ? "bg-accent/15 text-accent border-accent/30"
                    : "text-muted-foreground border-border hover:border-border/80 hover:text-foreground"
                )}>
                {p === 'all' ? 'Any Provider' : p}
              </button>
            ))}
          </div>
        )}

        {/* Clear all */}
        {hasActiveFilters && (
          <button onClick={() => { setSearch(''); setStatusFilter('all'); setProviderFilter('all'); }}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
          <Search className="w-6 h-6 mx-auto mb-2 opacity-30" />
          <p className="text-xs">No layers match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((layer, i) => (
            <LayerCard key={layer.id} layer={layer} allSources={sources} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}