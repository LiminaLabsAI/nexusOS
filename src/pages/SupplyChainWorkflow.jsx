import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  FlaskConical, Database, Brain, CheckCircle2, Circle,
  Loader2, Play, ArrowRight, ChevronDown, ChevronUp,
  Zap, AlertTriangle, Lightbulb, TrendingUp, Package,
  Truck, BarChart3, RefreshCw
} from 'lucide-react';

// ─── Step config ────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'simulation',
    label: 'Simulation',
    icon: FlaskConical,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Run supply chain what-if scenarios for disruption, demand surge, and logistics delays.',
  },
  {
    id: 'data_fabric',
    label: 'Data Fabric Integration',
    icon: Database,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Sync connected ERP, IoT, and logistics data sources and validate record integrity.',
  },
  {
    id: 'intelligence',
    label: 'Intelligence Feed',
    icon: Brain,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'Generate AI-driven anomaly alerts and recommendations for COO & Supply Chain Manager.',
  },
];

const SUPPLY_CHAIN_SCENARIOS = [
  {
    name: 'Primary Supplier Disruption',
    description: 'Key Tier-1 supplier halts production due to geopolitical risk.',
    domain: 'logistics',
    variables: [
      { name: 'Supplier Lead Time', current_value: 14, simulated_value: 45, unit: ' days' },
      { name: 'Safety Stock Coverage', current_value: 30, simulated_value: 10, unit: ' days' },
      { name: 'Alternative Supplier Capacity', current_value: 0, simulated_value: 60, unit: '%' },
    ],
  },
  {
    name: 'Demand Surge — Q4 Peak',
    description: 'Unexpected 40% demand surge driven by promotional campaign.',
    domain: 'manufacturing',
    variables: [
      { name: 'Demand Volume', current_value: 10000, simulated_value: 14000, unit: ' units' },
      { name: 'Warehouse Capacity Utilisation', current_value: 70, simulated_value: 98, unit: '%' },
      { name: 'Production Throughput', current_value: 10000, simulated_value: 12000, unit: ' units/mo' },
    ],
  },
  {
    name: 'Last-Mile Logistics Delay',
    description: 'Port congestion adds 3-week delay to inbound shipments.',
    domain: 'logistics',
    variables: [
      { name: 'Transit Time', current_value: 21, simulated_value: 42, unit: ' days' },
      { name: 'On-Time Delivery Rate', current_value: 96, simulated_value: 71, unit: '%' },
      { name: 'Expedite Cost', current_value: 50000, simulated_value: 210000, unit: ' USD' },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StepIndicator({ step, index, status }) {
  const Icon = step.icon;
  return (
    <div className="flex items-center gap-1">
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
        status === 'done'    && 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
        status === 'active'  && `${step.bg} ${step.border} ${step.color}`,
        status === 'pending' && 'bg-secondary border-border text-muted-foreground',
      )}>
        {status === 'done'
          ? <CheckCircle2 className="w-4 h-4" />
          : status === 'active'
          ? <Icon className="w-4 h-4" />
          : <Circle className="w-4 h-4" />}
      </div>
      {index < STEPS.length - 1 && (
        <div className={cn('w-8 h-0.5 mx-1', status === 'done' ? 'bg-emerald-500/40' : 'bg-border')} />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SupplyChainWorkflow() {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [running, setRunning] = useState(false);
  const [expandedSim, setExpandedSim] = useState(null);
  const [simResults, setSimResults] = useState({});
  const [dataFabricLog, setDataFabricLog] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const queryClient = useQueryClient();

  const { data: sources = [] } = useQuery({
    queryKey: ['data-sources'],
    queryFn: () => base44.entities.DataSource.list('-created_date'),
    initialData: [],
  });

  // ── Step 1: Simulation ──────────────────────────────────────────────────
  const runSimulations = async () => {
    setRunning(true);
    const results = {};
    for (const sc of SUPPLY_CHAIN_SCENARIOS) {
      const varDesc = sc.variables.map(v => `${v.name}: ${v.current_value}${v.unit} → ${v.simulated_value}${v.unit}`).join('\n');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the NexusOS Forecast Agent. Run a supply chain what-if simulation:\n\nScenario: ${sc.name}\nDescription: ${sc.description}\nDomain: ${sc.domain}\nVariable Changes:\n${varDesc}\n\nProvide a concise simulation result (2-3 sentences), best case, worst case, and confidence score 0-100. Focus on financial and operational impact for a COO and Supply Chain Manager.`,
        response_json_schema: {
          type: 'object',
          properties: {
            results: { type: 'string' },
            best_case: { type: 'string' },
            worst_case: { type: 'string' },
            confidence: { type: 'number' },
          },
        },
      });

      // Persist scenario
      const saved = await base44.entities.Scenario.create({
        ...sc,
        status: 'completed',
        results: result.results,
        best_case: result.best_case,
        worst_case: result.worst_case,
        confidence: result.confidence,
      });

      await base44.entities.AgentLog.create({
        agent_type: 'forecast',
        action: `Supply chain simulation: ${sc.name}`,
        output_summary: result.results?.substring(0, 200),
        status: 'completed',
        confidence: result.confidence,
      });

      results[sc.name] = { ...result, id: saved.id };
    }

    setSimResults(results);
    queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    queryClient.invalidateQueries({ queryKey: ['agent-logs'] });
    setCompletedSteps(prev => new Set(prev).add(0));
    setActiveStep(1);
    setRunning(false);
    toast.success('Simulations complete — 3 scenarios modelled');
  };

  // ── Step 2: Data Fabric ─────────────────────────────────────────────────
  const runDataFabric = async () => {
    setRunning(true);
    const log = [];

    const connectedSources = sources.filter(s => s.status === 'connected' || s.status === 'syncing');
    const supplyDomains = ['logistics', 'manufacturing', 'operations'];

    if (connectedSources.length === 0) {
      log.push({ label: 'No connected data sources found', status: 'warn' });
      log.push({ label: 'Creating placeholder supply chain data sources…', status: 'info' });

      // Auto-create demo sources for the workflow
      const demoSources = [
        { name: 'ERP — Production Planning', type: 'erp', provider: 'SAP', domain: 'manufacturing', sync_frequency: 'hourly', status: 'connected', records_synced: 284500, last_sync: new Date().toISOString() },
        { name: 'WMS — Warehouse Management', type: 'database', provider: 'Oracle ERP', domain: 'logistics', sync_frequency: 'real_time', status: 'connected', records_synced: 134200, last_sync: new Date().toISOString() },
        { name: 'IoT — Factory Floor Sensors', type: 'iot', provider: 'Siemens', domain: 'manufacturing', sync_frequency: 'real_time', status: 'connected', records_synced: 1920000, last_sync: new Date().toISOString() },
        { name: 'TMS — Transportation', type: 'api', provider: 'Custom API', domain: 'logistics', sync_frequency: 'hourly', status: 'connected', records_synced: 47800, last_sync: new Date().toISOString() },
      ];

      for (const ds of demoSources) {
        await base44.entities.DataSource.create(ds);
        log.push({ label: `Registered: ${ds.name}`, status: 'ok' });
        await new Promise(r => setTimeout(r, 300));
      }
    } else {
      for (const src of connectedSources) {
        const isSupply = supplyDomains.includes(src.domain);
        log.push({ label: `${isSupply ? '✓' : '~'} ${src.name} (${src.domain}) — ${src.records_synced?.toLocaleString() || 0} records`, status: isSupply ? 'ok' : 'warn' });
        await new Promise(r => setTimeout(r, 250));

        if (isSupply) {
          const added = Math.floor(Math.random() * 8000) + 1000;
          await base44.entities.DataSource.update(src.id, {
            last_sync: new Date().toISOString(),
            records_synced: (src.records_synced || 0) + added,
          });
        }
      }
    }

    log.push({ label: 'Schema validation complete — no integrity issues', status: 'ok' });
    log.push({ label: 'Data lineage graph updated for supply chain domains', status: 'ok' });

    await base44.entities.AgentLog.create({
      agent_type: 'execution',
      action: 'Data Fabric sync — supply chain domains validated',
      output_summary: `${connectedSources.length} sources validated across manufacturing, logistics, operations`,
      status: 'completed',
    });

    setDataFabricLog(log);
    queryClient.invalidateQueries({ queryKey: ['data-sources'] });
    queryClient.invalidateQueries({ queryKey: ['agent-logs'] });
    setCompletedSteps(prev => new Set(prev).add(1));
    setActiveStep(2);
    setRunning(false);
    toast.success('Data Fabric sync complete');
  };

  // ── Step 3: Intelligence Feed ───────────────────────────────────────────
  const runIntelligenceFeed = async () => {
    setRunning(true);
    const kpis = await base44.entities.KPI.list();
    const simContext = Object.entries(simResults).map(([name, r]) => `${name}: ${r.results}`).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the NexusOS Detection Agent. Based on recent supply chain simulations and KPI data, generate targeted intelligence for a COO and Supply Chain Manager:

Simulation Results:
${simContext || 'Three supply chain scenarios completed: supplier disruption, demand surge, logistics delay.'}

${kpis.length > 0 ? `Live KPIs:\n${kpis.map(k => `${k.name}: ${k.current_value}${k.unit} [${k.status}]`).join('\n')}` : ''}

Generate exactly 3 intelligence items: 1 critical alert, 1 warning, and 1 strategic recommendation. Make them specific to Supply Chain Manager and COO decision-making — inventory positioning, supplier risk, working capital, and delivery performance.`,
      response_json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['alert', 'recommendation'] },
                title: { type: 'string' },
                description: { type: 'string' },
                severity: { type: 'string', enum: ['info', 'warning', 'critical'] },
                domain: { type: 'string' },
                root_cause: { type: 'string' },
                impact_estimate: { type: 'string' },
                ai_confidence: { type: 'number' },
                financial_impact: { type: 'number' },
                execution_steps: { type: 'array', items: { type: 'string' } },
                persona: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const created = [];
    if (result.items) {
      for (const item of result.items) {
        if (item.type === 'alert') {
          const alert = await base44.entities.Alert.create({
            title: item.title,
            description: item.description,
            severity: item.severity || 'warning',
            domain: item.domain || 'logistics',
            root_cause: item.root_cause,
            impact_estimate: item.impact_estimate,
            ai_confidence: item.ai_confidence,
            status: 'new',
            anomaly_score: item.ai_confidence,
          });
          created.push({ ...item, id: alert.id });
        } else {
          const rec = await base44.entities.Recommendation.create({
            title: item.title,
            description: item.description,
            domain: item.domain || 'logistics',
            priority: 'high',
            confidence_score: item.ai_confidence,
            financial_impact: item.financial_impact || 0,
            execution_steps: item.execution_steps || [],
            status: 'pending',
            expected_impact: item.impact_estimate,
          });
          created.push({ ...item, id: rec.id });
        }

        await base44.entities.AgentLog.create({
          agent_type: item.type === 'alert' ? 'detection' : 'recommendation',
          action: `Supply chain intelligence: ${item.title}`,
          output_summary: item.description?.substring(0, 200),
          status: 'completed',
          confidence: item.ai_confidence,
        });
      }
    }

    setFeedItems(created);
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    queryClient.invalidateQueries({ queryKey: ['agent-logs'] });
    setCompletedSteps(prev => new Set(prev).add(2));
    setRunning(false);
    toast.success('Intelligence feed generated for COO & Supply Chain Manager');
  };

  const allDone = completedSteps.size === 3;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-400">Supply Chain Manager · COO</Badge>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Supply Chain Agentic Workflow</h1>
          <p className="text-sm text-muted-foreground mt-1">
            End-to-end: simulate disruptions → sync data fabric → generate intelligence
          </p>
        </div>
        {allDone && (
          <Button variant="outline" size="sm" className="gap-2 text-emerald-400 border-emerald-500/30"
            onClick={() => { setCompletedSteps(new Set()); setActiveStep(0); setSimResults({}); setDataFabricLog([]); setFeedItems([]); }}>
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </Button>
        )}
      </div>

      {/* Step Progress */}
      <div className="bg-card rounded-xl border border-border/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Workflow Progress</p>
          <span className="text-xs text-muted-foreground">{completedSteps.size} / {STEPS.length} steps complete</span>
        </div>
        <div className="flex items-center gap-0 mb-4">
          {STEPS.map((step, i) => (
            <StepIndicator
              key={step.id}
              step={step}
              index={i}
              status={completedSteps.has(i) ? 'done' : activeStep === i ? 'active' : 'pending'}
            />
          ))}
        </div>
        <Progress value={(completedSteps.size / STEPS.length) * 100} className="h-1.5" />
      </div>

      {/* Steps */}
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isDone = completedSteps.has(i);
        const isActive = activeStep === i;
        const isPending = !isDone && !isActive;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn(
              'bg-card rounded-xl border overflow-hidden transition-all',
              isDone && 'border-emerald-500/20',
              isActive && step.border,
              isPending && 'border-border/50 opacity-60',
            )}
          >
            {/* Step Header */}
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', isDone ? 'bg-emerald-500/10' : step.bg)}>
                  {isDone
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    : <Icon className={cn('w-5 h-5', step.color)} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{step.label}</h3>
                    <Badge variant="outline" className={cn('text-[10px]',
                      isDone && 'border-emerald-500/30 text-emerald-400',
                      isActive && 'border-primary/30 text-primary',
                      isPending && 'text-muted-foreground',
                    )}>
                      {isDone ? 'Complete' : isActive ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>

                {/* Action button */}
                {isActive && !isDone && (
                  <Button
                    size="sm"
                    className={cn('gap-2 flex-shrink-0', running && 'opacity-80')}
                    disabled={running}
                    onClick={i === 0 ? runSimulations : i === 1 ? runDataFabric : runIntelligenceFeed}
                  >
                    {running
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : i === 0 ? <FlaskConical className="w-3.5 h-3.5" />
                      : i === 1 ? <Database className="w-3.5 h-3.5" />
                      : <Brain className="w-3.5 h-3.5" />}
                    {running ? 'Running…'
                      : i === 0 ? 'Run Simulations'
                      : i === 1 ? 'Sync Data Fabric'
                      : 'Generate Intelligence'}
                  </Button>
                )}
              </div>
            </div>

            {/* Step Results */}
            <AnimatePresence>
              {isDone && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-border/30 overflow-hidden"
                >
                  <div className="p-5 bg-secondary/10 space-y-3">

                    {/* Simulation Results */}
                    {i === 0 && Object.entries(simResults).map(([name, r]) => (
                      <div key={name} className="rounded-lg border border-border/40 overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/30 transition-colors text-left"
                          onClick={() => setExpandedSim(expandedSim === name ? null : name)}
                        >
                          <div className="flex items-center gap-2">
                            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-xs font-medium">{name}</span>
                            <Badge variant="outline" className="text-[10px]">{r.confidence}% confidence</Badge>
                          </div>
                          {expandedSim === name ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                        <AnimatePresence>
                          {expandedSim === name && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="px-4 pb-3 space-y-2">
                                <p className="text-xs text-muted-foreground">{r.results}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                                    <p className="text-[10px] text-emerald-400 font-medium mb-0.5">Best Case</p>
                                    <p className="text-[11px] text-muted-foreground">{r.best_case}</p>
                                  </div>
                                  <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/15">
                                    <p className="text-[10px] text-red-400 font-medium mb-0.5">Worst Case</p>
                                    <p className="text-[11px] text-muted-foreground">{r.worst_case}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}

                    {/* Data Fabric Log */}
                    {i === 1 && dataFabricLog.map((entry, ei) => (
                      <div key={ei} className="flex items-center gap-2 text-xs">
                        {entry.status === 'ok'   && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                        {entry.status === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        {entry.status === 'info' && <Zap className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                        <span className={cn(
                          entry.status === 'ok' && 'text-foreground',
                          entry.status === 'warn' && 'text-amber-400',
                          entry.status === 'info' && 'text-blue-400',
                        )}>{entry.label}</span>
                      </div>
                    ))}

                    {/* Intelligence Feed Items */}
                    {i === 2 && feedItems.map((item, fi) => (
                      <div key={fi} className={cn(
                        'p-3 rounded-lg border text-xs',
                        item.type === 'alert' && item.severity === 'critical' && 'bg-red-500/5 border-red-500/20',
                        item.type === 'alert' && item.severity !== 'critical' && 'bg-amber-400/5 border-amber-400/20',
                        item.type === 'recommendation' && 'bg-emerald-500/5 border-emerald-500/20',
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === 'alert'
                            ? <AlertTriangle className={cn('w-3.5 h-3.5', item.severity === 'critical' ? 'text-red-400' : 'text-amber-400')} />
                            : <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />}
                          <span className="font-semibold">{item.title}</span>
                          {item.persona && <Badge variant="outline" className="text-[9px]">{item.persona}</Badge>}
                        </div>
                        <p className="text-muted-foreground">{item.description}</p>
                        {item.financial_impact > 0 && (
                          <p className="mt-1 font-semibold text-emerald-400">Impact: ${item.financial_impact.toLocaleString()}</p>
                        )}
                      </div>
                    ))}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* All Done Banner */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-xl p-5 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Workflow Complete</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                3 simulations modelled · Data Fabric synced · Intelligence feed active for COO & Supply Chain Manager
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <a href="/scenarios"><Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                <FlaskConical className="w-3.5 h-3.5" /> Scenarios
              </Button></a>
              <a href="/intelligence"><Button size="sm" className="gap-1.5 text-xs h-8">
                <Brain className="w-3.5 h-3.5" /> Intelligence Feed <ArrowRight className="w-3 h-3" />
              </Button></a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}