import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Loader2, Sparkles, AlertTriangle, TrendingUp, 
  Lightbulb, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { getPersonaConfig, filterByPersona } from '@/lib/personaConfig';

export default function IntelligenceFeed() {
  const { persona } = useOutletContext() || {};
  const config = getPersonaConfig(persona);

  const [filter, setFilter] = useState(config.defaultFilter);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const queryClient = useQueryClient();

  // Reset filter when persona changes
  useEffect(() => {
    setFilter(config.defaultFilter);
  }, [persona]);

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 50),
    initialData: [],
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => base44.entities.Recommendation.list('-created_date', 50),
    initialData: [],
  });

  const analyzeKPIs = async () => {
    setAnalyzing(true);
    const kpis = await base44.entities.KPI.list();
    if (kpis.length === 0) { setAnalyzing(false); return; }

    const kpiSummary = kpis.map(k => `${k.name} (${k.domain}): ${k.current_value}${k.unit || ''} [${k.status}] trend: ${k.trend}`).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the NexusOS Detection Agent. Analyze these enterprise KPIs and identify anomalies, risks, and opportunities:\n\n${kpiSummary}\n\nGenerate 2-3 actionable alerts with root cause analysis and impact estimates.`,
      response_json_schema: {
        type: "object",
        properties: {
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                severity: { type: "string", enum: ["info", "warning", "critical"] },
                domain: { type: "string" },
                root_cause: { type: "string" },
                impact_estimate: { type: "string" },
                ai_confidence: { type: "number" },
                kpi_name: { type: "string" },
                recommendation_title: { type: "string" },
                recommendation_description: { type: "string" },
                recommendation_steps: { type: "array", items: { type: "string" } },
                financial_impact: { type: "number" }
              }
            }
          }
        }
      }
    });

    if (result.alerts) {
      for (const a of result.alerts) {
        const alert = await base44.entities.Alert.create({
          title: a.title, description: a.description, severity: a.severity,
          domain: a.domain, root_cause: a.root_cause, impact_estimate: a.impact_estimate,
          ai_confidence: a.ai_confidence, kpi_name: a.kpi_name,
          status: 'new', anomaly_score: a.ai_confidence,
        });
        if (a.recommendation_title) {
          await base44.entities.Recommendation.create({
            title: a.recommendation_title, description: a.recommendation_description,
            alert_id: alert.id, domain: a.domain,
            priority: a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'high' : 'medium',
            confidence_score: a.ai_confidence,
            execution_steps: a.recommendation_steps || [],
            financial_impact: a.financial_impact || 0, status: 'pending',
          });
        }
        await base44.entities.AgentLog.create({
          agent_type: 'detection', action: `Detected anomaly: ${a.title}`,
          output_summary: a.description, status: 'completed',
          confidence: a.ai_confidence, related_entity_id: alert.id,
        });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    queryClient.invalidateQueries({ queryKey: ['agent-logs'] });
    setAnalyzing(false);
  };

  // Domain-filtered combined feed
  const filteredAlerts = filterByPersona(alerts, persona);
  const filteredRecs = filterByPersona(recommendations, persona);

  const combined = [
    ...filteredAlerts.map(a => ({ ...a, _type: 'alert' })),
    ...filteredRecs.map(r => ({ ...r, _type: 'recommendation' })),
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const displayed = filter === 'all' ? combined
    : filter === 'alerts' ? combined.filter(c => c._type === 'alert')
    : combined.filter(c => c._type === 'recommendation');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Intelligence Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-generated insights, anomalies, and recommendations</p>
        </div>
        <Button onClick={analyzeKPIs} disabled={analyzing} className="gap-2">
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
        </Button>
      </div>

      {/* Persona banner */}
      {config.bannerText && (
        <div className={cn("px-4 py-2.5 rounded-lg bg-gradient-to-r border border-border/30 text-xs text-muted-foreground", config.bannerColor)}>
          <span className="font-medium text-foreground">{config.label} view:</span> {config.bannerText}
          {config.domains.length > 0 && (
            <span className="ml-2">
              {config.domains.map(d => (
                <Badge key={d} variant="outline" className="text-[10px] mr-1 capitalize">{d}</Badge>
              ))}
            </span>
          )}
        </div>
      )}

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="all">All ({combined.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({filteredAlerts.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations ({filteredRecs.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        <AnimatePresence>
          {displayed.map((item, i) => (
            <motion.div
              key={`${item._type}-${item.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl border border-border/50 overflow-hidden"
            >
              <div
                className="p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    item._type === 'alert'
                      ? item.severity === 'critical' ? 'bg-red-500/10' : item.severity === 'warning' ? 'bg-amber-400/10' : 'bg-blue-400/10'
                      : 'bg-emerald-500/10'
                  )}>
                    {item._type === 'alert'
                      ? <AlertTriangle className={cn("w-4 h-4", item.severity === 'critical' ? 'text-red-500' : item.severity === 'warning' ? 'text-amber-400' : 'text-blue-400')} />
                      : <Lightbulb className="w-4 h-4 text-emerald-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <Badge variant="outline" className="text-[10px] capitalize">{item._type}</Badge>
                      {item.severity && (
                        <Badge variant="outline" className={cn("text-[10px]",
                          item.severity === 'critical' && 'border-red-500/30 text-red-400',
                          item.severity === 'warning' && 'border-amber-400/30 text-amber-300',
                        )}>{item.severity}</Badge>
                      )}
                      {item.confidence_score && (
                        <Badge variant="outline" className="text-[10px]">
                          <Sparkles className="w-2.5 h-2.5 mr-1" />{item.confidence_score}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>{item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : ''}</span>
                      {item.domain && <Badge variant="outline" className="text-[10px] h-4 capitalize">{item.domain}</Badge>}
                      {config.showFinancialImpact && item.financial_impact > 0 && (
                        <span className="text-emerald-400 font-medium">${item.financial_impact?.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  {expandedId === item.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/30 overflow-hidden"
                  >
                    <div className="p-5 space-y-3 bg-secondary/10">
                      {config.showRootCause && item.root_cause && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Root Cause Analysis</p>
                          <p className="text-sm">{item.root_cause}</p>
                        </div>
                      )}
                      {item.impact_estimate && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Impact Estimate</p>
                          <p className="text-sm">{item.impact_estimate}</p>
                        </div>
                      )}
                      {item.reasoning && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">AI Reasoning</p>
                          <p className="text-sm">{item.reasoning}</p>
                        </div>
                      )}
                      {config.showExecutionSteps && item.execution_steps?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Execution Steps</p>
                          <ol className="list-decimal list-inside text-sm space-y-1">
                            {item.execution_steps.map((step, si) => (
                              <li key={si} className="text-muted-foreground">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {config.showFinancialImpact && item.financial_impact > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Financial Impact:</span>
                          <span className="text-sm font-semibold text-emerald-400">${item.financial_impact?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {displayed.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No intelligence data for your domain. Run AI Analysis to generate insights.</p>
          </div>
        )}
      </div>
    </div>
  );
}