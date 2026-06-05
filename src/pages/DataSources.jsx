import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import IoTLinkDialog from '@/components/datasources/IoTLinkDialog';
import {
  Database, Plus, Wifi, WifiOff, RefreshCw, Loader2, Trash2,
  Server, Cloud, Cpu, FileSpreadsheet, Globe, Warehouse,
  CheckSquare, CheckCheck, X, Link2, Link2Off, ShieldCheck,
  Clock, AlertTriangle, Activity, ArrowUpRight, Download, Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

const typeConfig = {
  erp:        { icon: Server,        label: 'ERP System',      providers: ['SAP', 'Oracle ERP', 'Microsoft Dynamics', 'Infor'] },
  crm:        { icon: Globe,         label: 'CRM',             providers: ['Salesforce', 'HubSpot', 'Microsoft CRM', 'Zoho'] },
  iot:        { icon: Cpu,           label: 'IoT / SCADA',     providers: ['Siemens', 'Honeywell', 'Rockwell', 'Custom MQTT'] },
  database:   { icon: Database,      label: 'Database',        providers: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQL Server'] },
  api:        { icon: Cloud,         label: 'REST API',        providers: ['Custom API', 'GraphQL', 'gRPC', 'Webhook'] },
  file_upload:{ icon: FileSpreadsheet,label: 'File Upload',    providers: ['CSV', 'Excel', 'JSON', 'Parquet'] },
  warehouse:  { icon: Warehouse,     label: 'Data Warehouse',  providers: ['Snowflake', 'BigQuery', 'Redshift', 'Databricks'] },
};

const statusConfig = {
  connected:    { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500',          label: 'Connected' },
  disconnected: { color: 'bg-muted/60 text-muted-foreground border-border',          dot: 'bg-muted-foreground',     label: 'Disconnected' },
  syncing:      { color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',          dot: 'bg-blue-500 animate-pulse', label: 'Syncing' },
  error:        { color: 'bg-red-500/15 text-red-400 border-red-500/30',             dot: 'bg-red-500',              label: 'Error' },
};

const freqLabel = { real_time: 'Real-time', hourly: 'Hourly', daily: 'Daily', weekly: 'Weekly' };

// Simulates a multi-step connection handshake
function useLinkSimulation(onDone) {
  const [step, setStep] = useState(0);
  const steps = ['Validating credentials…', 'Testing connectivity…', 'Negotiating schema…', 'Establishing secure channel…', 'Connection established'];
  const [running, setRunning] = useState(false);

  const start = () => { setStep(0); setRunning(true); };

  useEffect(() => {
    if (!running) return;
    if (step >= steps.length - 1) { setRunning(false); onDone(); return; }
    const t = setTimeout(() => setStep(s => s + 1), 700);
    return () => clearTimeout(t);
  }, [running, step]);

  return { step, steps, running, start, progress: Math.round((step / (steps.length - 1)) * 100) };
}

function downloadCSV(sources) {
  const headers = ['Name', 'Type', 'Provider', 'Domain', 'Status', 'Sync Frequency', 'Records Synced', 'Last Sync', 'Created Date'];
  const rows = sources.map(s => [
    s.name,
    typeConfig[s.type]?.label || s.type,
    s.provider || '',
    s.domain || '',
    s.status,
    freqLabel[s.sync_frequency] || s.sync_frequency || '',
    s.records_synced || 0,
    s.last_sync ? format(new Date(s.last_sync), 'yyyy-MM-dd HH:mm:ss') : '',
    s.created_date ? format(new Date(s.created_date), 'yyyy-MM-dd HH:mm:ss') : '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `data-sources-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV downloaded');
}

export default function DataSources() {
  const [showCreate, setShowCreate] = useState(false);
  const [showApi, setShowApi] = useState(false);
  const [showIoT, setShowIoT] = useState(false);
  const [linkingId, setLinkingId] = useState(null);
  const [newSource, setNewSource] = useState({ name: '', type: 'erp', provider: '', domain: 'manufacturing', sync_frequency: 'daily' });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const [syncingIds, setSyncingIds] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: sources = [] } = useQuery({
    queryKey: ['data-sources'],
    queryFn: () => base44.entities.DataSource.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DataSource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      setShowCreate(false);
      setNewSource({ name: '', type: 'erp', provider: '', domain: 'manufacturing', sync_frequency: 'daily' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DataSource.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data-sources'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DataSource.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data-sources'] }),
  });

  const toggleSelect = (id) => setSelectedIds(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });
  const selectAll = () => setSelectedIds(new Set(sources.map(s => s.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const doSync = async (source) => {
    setSyncingIds(prev => new Set(prev).add(source.id));
    await updateMutation.mutateAsync({ id: source.id, data: { status: 'syncing', last_sync: new Date().toISOString() } });
    await new Promise(r => setTimeout(r, 1800));
    const added = Math.floor(Math.random() * 5000) + 500;
    await updateMutation.mutateAsync({ id: source.id, data: { status: 'connected', records_synced: (source.records_synced || 0) + added } });
    setSyncingIds(prev => { const next = new Set(prev); next.delete(source.id); return next; });
  };

  const bulkSync = async () => {
    const targets = sources.filter(s => selectedIds.has(s.id) && s.status === 'connected');
    if (!targets.length) return;
    setBulkRunning(true);
    await Promise.all(targets.map(s => doSync(s)));
    setBulkRunning(false);
    clearSelection();
  };

  const bulkRefreshStatus = async () => {
    const targets = sources.filter(s => selectedIds.has(s.id));
    if (!targets.length) return;
    setBulkRunning(true);
    await Promise.all(targets.map(s =>
      updateMutation.mutateAsync({ id: s.id, data: { last_sync: new Date().toISOString(), records_synced: (s.records_synced || 0) + Math.floor(Math.random() * 1000) } })
    ));
    setBulkRunning(false);
    clearSelection();
  };

  const connectedCount = sources.filter(s => s.status === 'connected' || s.status === 'syncing').length;
  const totalRecords = sources.reduce((sum, s) => sum + (s.records_synced || 0), 0);
  const errorCount = sources.filter(s => s.status === 'error').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Data Fabric</h1>
          <p className="text-sm text-muted-foreground mt-1">Link external systems and monitor their real-time sync status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9" onClick={() => downloadCSV(sources)}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2 h-9" onClick={() => setShowApi(true)}>
            <Code2 className="w-4 h-4" /> API Access
          </Button>
          <Button className="gap-2" onClick={() => setShowIoT(true)}>
            <Cpu className="w-4 h-4" /> Link IoT
          </Button>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Link System</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Link External System</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-xs">System Name</Label>
                  <Input value={newSource.name} onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} placeholder="e.g., Production ERP" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={newSource.type} onValueChange={(v) => setNewSource({ ...newSource, type: v, provider: '' })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeConfig).filter(([k]) => k !== 'iot').map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Provider</Label>
                  <Select value={newSource.provider} onValueChange={(v) => setNewSource({ ...newSource, provider: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select provider…" /></SelectTrigger>
                    <SelectContent>
                      {(typeConfig[newSource.type]?.providers || []).map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Domain</Label>
                  <Select value={newSource.domain} onValueChange={(v) => setNewSource({ ...newSource, domain: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['manufacturing','logistics','retail','finance','hr','operations'].map(d => (
                        <SelectItem key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase()+d.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Sync Frequency</Label>
                  <Select value={newSource.sync_frequency} onValueChange={(v) => setNewSource({ ...newSource, sync_frequency: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_time">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => createMutation.mutate({ ...newSource, status: 'disconnected' })} disabled={!newSource.name || createMutation.isPending} className="w-full gap-2">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Register System
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <IoTLinkDialog
          open={showIoT}
          onOpenChange={setShowIoT}
          loading={createMutation.isPending}
          onSubmit={(data) => createMutation.mutate(data)}
        />

        {/* API Access Dialog */}
        <Dialog open={showApi} onOpenChange={setShowApi}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Code2 className="w-4 h-4" /> API Access</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2 text-sm">
              <p className="text-muted-foreground text-xs">Use the NexusOS SDK to query data source records programmatically.</p>
              <div className="space-y-3">
                {[
                  { label: 'List all data sources', code: `base44.entities.DataSource.list()` },
                  { label: 'Filter by status', code: `base44.entities.DataSource.filter({ status: 'connected' })` },
                  { label: 'Filter by domain', code: `base44.entities.DataSource.filter({ domain: 'manufacturing' })` },
                  { label: 'Get single source', code: `base44.entities.DataSource.get('<source_id>')` },
                ].map(({ label, code }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <div className="bg-secondary/60 rounded-lg px-3 py-2 font-mono text-xs text-primary flex items-center justify-between gap-2">
                      <span className="truncate">{code}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0" onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied'); }}>
                        <FileSpreadsheet className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">Import via: <code className="bg-secondary px-1 rounded">import {'{ base44 }'} from '@/api/base44Client'</code></p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Systems', value: sources.length,              icon: Database,  color: 'text-primary' },
          { label: 'Connected',     value: connectedCount,              icon: Link2,     color: 'text-emerald-400' },
          { label: 'Records Synced',value: totalRecords.toLocaleString(),icon: Activity,  color: 'text-amber-400' },
          { label: 'Errors',        value: errorCount,                  icon: AlertTriangle, color: 'text-red-400' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card rounded-xl border border-border/50 p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={cn("text-xl font-bold font-display", stat.color)}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Action Bar */}
      {sources.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={selectedIds.size === sources.length ? clearSelection : selectAll}>
            {selectedIds.size === sources.length ? <CheckCheck className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
            {selectedIds.size === sources.length ? 'Deselect All' : 'Select All'}
          </Button>
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={bulkSync} disabled={bulkRunning}>
                {bulkRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Sync Connected
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={bulkRefreshStatus} disabled={bulkRunning}>
                {bulkRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                Refresh Status
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={clearSelection}>
                <X className="w-3 h-3" /> Clear
              </Button>
            </>
          )}
        </div>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source, i) => (
          <SourceCard
            key={source.id}
            source={source}
            index={i}
            isSelected={selectedIds.has(source.id)}
            isSyncing={syncingIds.has(source.id)}
            isLinking={linkingId === source.id}
            onToggleSelect={() => toggleSelect(source.id)}
            onLink={() => setLinkingId(source.id)}
            onLinkDone={() => {
              setLinkingId(null);
              updateMutation.mutate({ id: source.id, data: { status: 'connected', last_sync: new Date().toISOString(), records_synced: Math.floor(Math.random() * 30000) + 2000 } });
            }}
            onDisconnect={() => updateMutation.mutate({ id: source.id, data: { status: 'disconnected', records_synced: 0 } })}
            onSync={() => doSync(source)}
            onDelete={() => deleteMutation.mutate(source.id)}
          />
        ))}

        {sources.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No systems linked. Click "Link System" to connect your first data source.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SourceCard({ source, index, isSelected, isSyncing, isLinking, onToggleSelect, onLink, onLinkDone, onDisconnect, onSync, onDelete }) {
  const type = typeConfig[source.type] || typeConfig.api;
  const status = statusConfig[source.status] || statusConfig.disconnected;
  const Icon = type.icon;
  const activelySyncing = isSyncing || source.status === 'syncing';

  const sim = useLinkSimulation(onLinkDone);

  const handleLinkClick = (e) => {
    e.stopPropagation();
    sim.start();
    onLink();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "bg-card rounded-xl border p-5 cursor-pointer transition-colors",
        isSelected ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-border"
      )}
      onClick={() => onToggleSelect()}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
          isSelected ? "bg-primary/10" : source.status === 'connected' ? "bg-emerald-500/10" : "bg-secondary"
        )}>
          {isSelected
            ? <CheckCheck className="w-5 h-5 text-primary" />
            : activelySyncing
            ? <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            : <Icon className={cn("w-5 h-5", source.status === 'connected' ? "text-emerald-400" : "text-muted-foreground")} />
          }
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold truncate">{source.name}</h3>
            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", status.dot)} />
          </div>
          <p className="text-xs text-muted-foreground">{source.provider || type.label} · {source.domain}</p>

          {/* Badges */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Badge className={cn("text-[10px] border", status.color)}>{status.label}</Badge>
            <Badge variant="outline" className="text-[10px]">{freqLabel[source.sync_frequency] || source.sync_frequency}</Badge>
          </div>

          {/* Sync progress */}
          <AnimatePresence>
            {isLinking && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  <span className="text-[10px] text-primary">{sim.steps[sim.step]}</span>
                </div>
                <Progress value={sim.progress} className="h-1" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sync stats */}
          {source.status === 'connected' && source.records_synced > 0 && !isLinking && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-secondary/60 rounded-lg px-3 py-2">
                <p className="text-[10px] text-muted-foreground mb-0.5">Records Synced</p>
                <p className="text-xs font-semibold text-foreground">{source.records_synced.toLocaleString()}</p>
              </div>
              <div className="bg-secondary/60 rounded-lg px-3 py-2">
                <p className="text-[10px] text-muted-foreground mb-0.5">Last Sync</p>
                <p className="text-xs font-semibold text-foreground">
                  {source.last_sync ? formatDistanceToNow(new Date(source.last_sync), { addSuffix: true }) : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Active sync progress bar */}
          {activelySyncing && !isLinking && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] text-blue-400">Synchronizing records…</span>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: ['20%', '90%'] }} transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse' }} />
              </div>
            </div>
          )}

          {/* Error state */}
          {source.status === 'error' && (
            <div className="mt-2 flex items-center gap-1.5 text-red-400">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[10px]">Sync failed — check credentials and retry</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
            {source.status === 'disconnected' || source.status === 'error' ? (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleLinkClick} disabled={isLinking}>
                {isLinking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                Link
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onSync(); }} disabled={activelySyncing}>
                  {activelySyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Sync Now
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={(e) => { e.stopPropagation(); onDisconnect(); }}>
                  <Link2Off className="w-3 h-3" /> Unlink
                </Button>
              </>
            )}
            <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}