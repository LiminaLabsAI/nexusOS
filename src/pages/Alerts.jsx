import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Eye, Search as SearchIcon, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getPersonaConfig, filterByPersona } from '@/lib/personaConfig';

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', badge: 'border-red-500/30 text-red-400' },
  warning:  { icon: AlertCircle,   color: 'text-amber-400', bg: 'bg-amber-400/10', badge: 'border-amber-400/30 text-amber-300' },
  info:     { icon: Info,           color: 'text-blue-400', bg: 'bg-blue-400/10',  badge: 'border-blue-400/30 text-blue-300' },
};

const statusConfig = {
  new:          { label: 'New',          color: 'bg-blue-500/20 text-blue-400' },
  acknowledged: { label: 'Acknowledged', color: 'bg-amber-400/20 text-amber-300' },
  investigating:{ label: 'Investigating',color: 'bg-purple-400/20 text-purple-300' },
  resolved:     { label: 'Resolved',     color: 'bg-emerald-500/20 text-emerald-400' },
  dismissed:    { label: 'Dismissed',    color: 'bg-muted text-muted-foreground' },
};

export default function Alerts() {
  const { persona } = useOutletContext() || {};
  const config = getPersonaConfig(persona);

  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 100),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  // Domain filter first, then UI filters
  const domainFiltered = filterByPersona(alerts, persona);

  const filtered = domainFiltered.filter(a => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  // Stats for persona header
  const criticalCount = domainFiltered.filter(a => a.severity === 'critical').length;
  const newCount = domainFiltered.filter(a => a.status === 'new').length;

  // Admin grouping
  const isAdmin = persona === 'administrator';
  const adminAlertGroups = config.alertGroups || [];
  const adminGrouped = isAdmin
    ? adminAlertGroups.map(g => ({ ...g, items: filtered.filter(g.filter) })).filter(g => g.items.length > 0)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Alert Management</h1>
        <p className="text-sm text-muted-foreground mt-1">{isAdmin ? 'Platform-wide alert monitoring — all domains, all users' : 'Monitor, investigate, and resolve enterprise anomalies'}</p>
      </div>

      {/* Persona summary bar */}
      <div className={cn("px-4 py-3 rounded-lg bg-gradient-to-r border border-border/30 flex items-center gap-6", config.bannerColor)}>
        <div className="text-xs">
          <span className="font-medium text-foreground">{config.label} view</span>
          {config.domains.length > 0 && (
            <span className="text-muted-foreground ml-2">
              — {config.domains.map(d => <Badge key={d} variant="outline" className="text-[10px] mr-1 capitalize">{d}</Badge>)}
            </span>
          )}
        </div>
        <div className="flex gap-4 ml-auto text-xs">
          <span className="text-red-400 font-semibold">{criticalCount} critical</span>
          <span className="text-blue-400 font-semibold">{newCount} new</span>
          <span className="text-muted-foreground">{domainFiltered.length} total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            {config.prioritySeverities.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Admin grouped alerts */}
      {isAdmin && adminGrouped && (
        <div className="space-y-8">
          {adminGrouped.map((group) => (
            <div key={group.key}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-3 h-px bg-amber-400/50 inline-block" />{group.label}
                <Badge variant="outline" className="text-[9px] ml-auto">{group.items.length}</Badge>
              </p>
              <div className="space-y-3">
                {group.items.map((alert, i) => <AlertCard key={alert.id} alert={alert} i={i} config={config} updateMutation={updateMutation} />)}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No alerts match your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Standard alerts list */}
      {!isAdmin && <div className="space-y-3">
        {filtered.map((alert, i) => <AlertCard key={alert.id} alert={alert} i={i} config={config} updateMutation={updateMutation} />)}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No alerts match your filters</p>
          </div>
        )}
      </div>}

    </div>
  );
}

function AlertCard({ alert, i, config, updateMutation }) {
  const sev = severityConfig[alert.severity] || severityConfig.info;
  const stat = statusConfig[alert.status] || statusConfig.new;
  const Icon = sev.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.03 }}
      className="bg-card rounded-xl border border-border/50 p-5"
    >
      <div className="flex items-start gap-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", sev.bg)}>
          <Icon className={cn("w-5 h-5", sev.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold">{alert.title}</h3>
            <Badge variant="outline" className={cn("text-[10px]", sev.badge)}>{alert.severity}</Badge>
            <Badge className={cn("text-[10px]", stat.color)}>{stat.label}</Badge>
            {alert.ai_confidence && (
              <Badge variant="outline" className="text-[10px]">AI: {alert.ai_confidence}%</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{alert.description}</p>
          {config.showRootCause && alert.root_cause && (
            <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-1">Root Cause</p>
              <p className="text-xs">{alert.root_cause}</p>
            </div>
          )}
          {alert.impact_estimate && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Impact: </span>
              <span className="text-xs font-medium">{alert.impact_estimate}</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {alert.status === 'new' && (
              <>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                  onClick={() => updateMutation.mutate({ id: alert.id, data: { status: 'acknowledged' } })}>
                  <Eye className="w-3 h-3" /> Acknowledge
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                  onClick={() => updateMutation.mutate({ id: alert.id, data: { status: 'investigating' } })}>
                  <SearchIcon className="w-3 h-3" /> Investigate
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground"
                  onClick={() => updateMutation.mutate({ id: alert.id, data: { status: 'dismissed' } })}>
                  <XCircle className="w-3 h-3" /> Dismiss
                </Button>
              </>
            )}
            {(alert.status === 'acknowledged' || alert.status === 'investigating') && (
              <Button size="sm" className="h-7 text-xs gap-1"
                onClick={() => updateMutation.mutate({ id: alert.id, data: { status: 'resolved' } })}>
                <CheckCircle className="w-3 h-3" /> Resolve
              </Button>
            )}
            {alert.domain && <Badge variant="outline" className="text-[10px] capitalize">{alert.domain}</Badge>}
            <span className="text-[10px] text-muted-foreground ml-auto">
              {alert.created_date ? format(new Date(alert.created_date), 'MMM d, h:mm a') : ''}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}