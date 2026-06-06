import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useOutletContext } from 'react-router-dom';
import KPICard from '@/components/dashboard/KPICard';
import AlertFeed from '@/components/dashboard/AlertFeed';
import DomainHealth from '@/components/dashboard/DomainHealth';
import DecisionPipeline from '@/components/dashboard/DecisionPipeline';
import AgentActivityFeed from '@/components/dashboard/AgentActivityFeed';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getPersonaConfig, filterByPersona } from '@/lib/personaConfig';

export default function CommandCenter() {
  const { persona } = useOutletContext();

  const { data: kpis = [], isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => base44.entities.KPI.list('-updated_date', 50),
    initialData: [],
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 20),
    initialData: [],
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => base44.entities.Recommendation.list('-created_date', 20),
    initialData: [],
  });

  const { data: agentLogs = [] } = useQuery({
    queryKey: ['agent-logs'],
    queryFn: () => base44.entities.AgentLog.list('-created_date', 10),
    initialData: [],
  });

  const config = getPersonaConfig(persona);

  // Apply domain filtering
  const filteredKpis = filterByPersona(kpis, persona);
  const filteredAlerts = filterByPersona(alerts, persona);
  const filteredRecs = filterByPersona(recommendations, persona);

  const criticalAlerts = filteredAlerts.filter(a => a.severity === 'critical' && a.status === 'new');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enterprise intelligence overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        {criticalAlerts.length > 0 && (
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 glow-danger">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-400">
              {criticalAlerts.length} Critical Alert{criticalAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </motion.div>

      {/* Persona banner */}
      {config.bannerText && (
        <div className={cn("px-4 py-2.5 rounded-lg bg-gradient-to-r border border-border/30 flex items-center gap-3 flex-wrap text-xs text-muted-foreground", config.bannerColor)}>
          <span className="font-medium text-foreground">{config.label} view:</span>
          <span>{config.bannerText}</span>
          {config.domains.length > 0 && (
            <span className="flex gap-1">
              {config.domains.map(d => (
                <Badge key={d} variant="outline" className="text-[10px] capitalize">{d}</Badge>
              ))}
            </span>
          )}
          <span className="ml-auto text-muted-foreground">
            {filteredKpis.length} KPIs · {filteredAlerts.length} alerts · {filteredRecs.length} recommendations
          </span>
        </div>
      )}

      {/* Decision Pipeline */}
      <DecisionPipeline alerts={filteredAlerts} recommendations={filteredRecs} />

      {/* KPI Grid */}
      {kpisLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[160px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredKpis.map((kpi, i) => (
            <KPICard key={kpi.id} kpi={kpi} index={i} />
          ))}
          {filteredKpis.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <p className="text-sm">No KPIs configured for your domain. Connect data sources to begin monitoring.</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DomainHealth kpis={filteredKpis} />
        </div>
        <div className="lg:col-span-1">
          <AlertFeed alerts={filteredAlerts} />
        </div>
        <div className="lg:col-span-1">
          <AgentActivityFeed logs={agentLogs} />
        </div>
      </div>
    </div>
  );
}