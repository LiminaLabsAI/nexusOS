import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Database, Plus, Wifi, WifiOff, RefreshCw, Loader2, Trash2,
  Server, Cloud, Cpu, FileSpreadsheet, Globe, Warehouse,
  CheckSquare, Square, CheckCheck, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const typeConfig = {
  erp: { icon: Server, label: 'ERP System' },
  crm: { icon: Globe, label: 'CRM' },
  iot: { icon: Cpu, label: 'IoT / SCADA' },
  database: { icon: Database, label: 'Database' },
  api: { icon: Cloud, label: 'REST API' },
  file_upload: { icon: FileSpreadsheet, label: 'File Upload' },
  warehouse: { icon: Warehouse, label: 'Data Warehouse' },
};

const statusConfig = {
  connected: { color: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-500' },
  disconnected: { color: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  syncing: { color: 'bg-blue-500/20 text-blue-400', dot: 'bg-blue-500 animate-pulse' },
  error: { color: 'bg-red-500/20 text-red-400', dot: 'bg-red-500' },
};

export default function DataSources() {
  const [showCreate, setShowCreate] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', type: 'erp', provider: '', domain: 'manufacturing', sync_frequency: 'daily' });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
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

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(sources.map(s => s.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const bulkSync = async () => {
    const targets = sources.filter(s => selectedIds.has(s.id) && s.status === 'connected');
    if (!targets.length) return;
    setBulkRunning(true);
    await Promise.all(targets.map(s =>
      updateMutation.mutateAsync({ id: s.id, data: { last_sync: new Date().toISOString(), status: 'syncing' } })
    ));
    setBulkRunning(false);
    clearSelection();
  };

  const bulkRefreshStatus = async () => {
    const targets = sources.filter(s => selectedIds.has(s.id));
    if (!targets.length) return;
    setBulkRunning(true);
    await Promise.all(targets.map(s =>
      updateMutation.mutateAsync({ id: s.id, data: { last_sync: new Date().toISOString(), records_synced: Math.floor(Math.random() * 50000) + 1000 } })
    ));
    setBulkRunning(false);
    clearSelection();
  };

  const toggleConnection = (source) => {
    const newStatus = source.status === 'connected' ? 'disconnected' : 'connected';
    updateMutation.mutate({
      id: source.id,
      data: {
        status: newStatus,
        ...(newStatus === 'connected' ? { last_sync: new Date().toISOString(), records_synced: Math.floor(Math.random() * 50000) + 1000 } : {})
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Data Fabric</h1>
          <p className="text-sm text-muted-foreground mt-1">Unified enterprise data connectors and integration layer</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Source</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Data Source</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={newSource.name} onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} placeholder="e.g., Production ERP" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={newSource.type} onValueChange={(v) => setNewSource({ ...newSource, type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Provider</Label>
                <Input value={newSource.provider} onChange={(e) => setNewSource({ ...newSource, provider: e.target.value })} placeholder="e.g., SAP, Oracle, Salesforce" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Domain</Label>
                <Select value={newSource.domain} onValueChange={(v) => setNewSource({ ...newSource, domain: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
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
              <Button onClick={() => createMutation.mutate({ ...newSource, status: 'disconnected' })} disabled={!newSource.name} className="w-full">
                Add Data Source
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sources', value: sources.length, color: 'text-primary' },
          { label: 'Connected', value: sources.filter(s => s.status === 'connected').length, color: 'text-emerald-400' },
          { label: 'Records Synced', value: sources.reduce((sum, s) => sum + (s.records_synced || 0), 0).toLocaleString(), color: 'text-amber-400' },
          { label: 'Errors', value: sources.filter(s => s.status === 'error').length, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl border border-border/50 p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={cn("text-2xl font-bold font-display mt-1", stat.color)}>{stat.value}</p>
          </div>
        ))}
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
        {sources.map((source, i) => {
          const type = typeConfig[source.type] || typeConfig.api;
          const status = statusConfig[source.status] || statusConfig.disconnected;
          const Icon = type.icon;
          const isSelected = selectedIds.has(source.id);

          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn("bg-card rounded-xl border p-5 cursor-pointer transition-colors", isSelected ? "border-primary/50 bg-primary/5" : "border-border/50")}
              onClick={() => toggleSelect(source.id)}
            >
              <div className="flex items-start gap-4">
                <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors", isSelected ? "bg-primary/10" : "bg-secondary")}>
                  {isSelected ? <CheckCheck className="w-5 h-5 text-primary" /> : <Icon className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate">{source.name}</h3>
                    <div className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                  </div>
                  <p className="text-xs text-muted-foreground">{source.provider || type.label}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={cn("text-[10px]", status.color)}>{source.status}</Badge>
                    <Badge variant="outline" className="text-[10px]">{source.domain}</Badge>
                    <Badge variant="outline" className="text-[10px]">{source.sync_frequency}</Badge>
                  </div>
                  {source.records_synced > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {source.records_synced.toLocaleString()} records synced
                      {source.last_sync && ` • Last: ${format(new Date(source.last_sync), 'MMM d, h:mm a')}`}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => toggleConnection(source)}>
                      {source.status === 'connected' ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                      {source.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                    {source.status === 'connected' && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1"
                        onClick={() => updateMutation.mutate({ id: source.id, data: { last_sync: new Date().toISOString(), status: 'syncing' } })}>
                        <RefreshCw className="w-3 h-3" /> Sync
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto"
                      onClick={() => deleteMutation.mutate(source.id)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {sources.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No data sources configured. Add one to start ingesting enterprise data.</p>
          </div>
        )}
      </div>
    </div>
  );
}