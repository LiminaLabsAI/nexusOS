import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, Brain, FlaskConical, Globe, TrendingUp,
  Check, Cpu, Zap, Plus, X,
  ArrowRight, Star, DollarSign, Gauge, Shield,
  BarChart3, AlertTriangle, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const MODELS = [
  { id: 'gpt4o',      label: 'GPT-4o',          provider: 'OpenAI',    cost: 3, perf: 5, speed: 3, use: 'Complex reasoning, multi-step tasks' },
  { id: 'gpt4o_mini', label: 'GPT-4o mini',      provider: 'OpenAI',    cost: 1, perf: 3, speed: 5, use: 'High-volume, fast classification' },
  { id: 'claude35',   label: 'Claude 3.5 Sonnet', provider: 'Anthropic', cost: 3, perf: 5, speed: 3, use: 'Long-context, nuanced analysis' },
  { id: 'gemini15',   label: 'Gemini 1.5 Pro',   provider: 'Google',    cost: 2, perf: 4, speed: 4, use: 'Multimodal, document understanding' },
  { id: 'llama3',     label: 'Llama 3 70B',      provider: 'Meta',      cost: 1, perf: 3, speed: 4, use: 'Open-source, on-prem deployment' },
  { id: 'mistral',    label: 'Mistral Large',    provider: 'Mistral',   cost: 2, perf: 4, speed: 4, use: 'European compliance, low latency' },
];

const EVAL_METRICS = [
  { id: 'accuracy',     label: 'Accuracy',           icon: Target,       desc: 'Correctness against ground truth' },
  { id: 'faithfulness', label: 'Faithfulness',        icon: Shield,       desc: 'Grounded in provided context' },
  { id: 'latency',      label: 'Latency p95',         icon: Gauge,        desc: 'Response time at 95th percentile' },
  { id: 'cost',         label: 'Cost per 1k calls',   icon: DollarSign,   desc: 'Token cost at production volume' },
  { id: 'hallucination',label: 'Hallucination rate',  icon: AlertTriangle,desc: 'Rate of unsupported claims' },
  { id: 'relevance',    label: 'Answer relevance',    icon: Star,         desc: 'Alignment with user intent' },
];

const GROUNDING_SOURCES = [
  { id: 'erp',      label: 'ERP / SAP',       icon: '🏭' },
  { id: 'crm',      label: 'CRM / Salesforce', icon: '🤝' },
  { id: 'kb',       label: 'Knowledge Base',  icon: '📚' },
  { id: 'realtime', label: 'Real-time feeds',  icon: '📡' },
  { id: 'web',      label: 'Web search',      icon: '🌐' },
  { id: 'docs',     label: 'Internal docs',   icon: '📄' },
];

function ScoreBar({ value, max = 5, color }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`h-1.5 w-4 rounded-full ${i < value ? color : 'bg-white/10'}`} />
      ))}
    </div>
  );
}

function PanelShell({ children, accent }) {
  return (
    <div className={`bg-[#0F1420] rounded-xl border-2 ${accent} p-5 flex-1 min-w-[210px]`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, subtitle, iconBg, iconColor }) {
  return (
    <div className="flex items-start gap-2.5 mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-bold text-white/90 leading-tight">{label}</p>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function PipeArrow() {
  return (
    <div className="hidden lg:flex items-center justify-center w-6 flex-shrink-0">
      <ArrowRight className="w-4 h-4 text-white/20" />
    </div>
  );
}

// ── PANELS ────────────────────────────────────────────────────────────────────

function GoalPanel({ data, onChange }) {
  const [inputVal, setInputVal] = useState('');
  const goals = data.goals || [];

  const addGoal = () => {
    if (!inputVal.trim()) return;
    onChange({ ...data, goals: [...goals, inputVal.trim()] });
    setInputVal('');
  };

  return (
    <PanelShell accent="border-indigo-500/40">
      <SectionHeader icon={Target} label="Goal Setting" subtitle="Objectives & success criteria" iconBg="bg-indigo-500/20" iconColor="text-indigo-400" />
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-white/40 mb-1 block">Agent Goals</label>
          <div className="flex gap-2 mb-2">
            <Input value={inputVal} onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGoal()}
              placeholder="e.g. Reduce MTTR by 30%"
              className="text-xs h-8 bg-[#080C14] border-white/10 text-white placeholder:text-white/25 focus:border-indigo-500/60" />
            <Button size="icon" onClick={addGoal} className="h-8 w-8 bg-indigo-600 hover:bg-indigo-500">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="space-y-1.5 max-h-24 overflow-y-auto">
            {goals.length === 0 && <p className="text-xs text-white/25 italic">No goals yet</p>}
            {goals.map((g, i) => (
              <div key={i} className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5">
                <span className="text-xs text-indigo-300">{g}</span>
                <button onClick={() => onChange({ ...data, goals: goals.filter((_, j) => j !== i) })}>
                  <X className="w-3 h-3 text-indigo-500/60 hover:text-indigo-300" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-white/40 mb-1 block">Success Metric</label>
          <Input value={data.successMetric || ''} onChange={e => onChange({ ...data, successMetric: e.target.value })}
            placeholder="e.g. Precision ≥ 92%, Latency < 2s"
            className="text-xs h-8 bg-[#080C14] border-white/10 text-white placeholder:text-white/25 focus:border-indigo-500/60" />
        </div>
        <div>
          <label className="text-xs font-semibold text-white/40 mb-1 block">Timeline</label>
          <div className="flex gap-1.5 flex-wrap">
            {['7d', '30d', '90d', 'ongoing'].map(t => (
              <button key={t} onClick={() => onChange({ ...data, timeline: t })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${(data.timeline || '30d') === t ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-semibold' : 'border-white/10 text-white/40 hover:border-indigo-500/40'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function ModelPanel({ data, onChange }) {
  const selected = data.model || null;
  const m = MODELS.find(x => x.id === selected);

  return (
    <PanelShell accent="border-violet-500/40">
      <SectionHeader icon={Cpu} label="Model Choice" subtitle="Select LLM for the agentic core" iconBg="bg-violet-500/20" iconColor="text-violet-400" />
      <div className="space-y-1.5 mb-3">
        {MODELS.map(mo => (
          <button key={mo.id} onClick={() => onChange({ ...data, model: mo.id })}
            className={`w-full text-left p-2.5 rounded-lg border-2 transition-all ${selected === mo.id ? 'border-violet-500/70 bg-violet-500/10' : 'border-white/10 hover:border-violet-500/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${selected === mo.id ? 'text-violet-300' : 'text-white/70'}`}>{mo.label}</span>
                <span className="text-[10px] text-white/30">{mo.provider}</span>
              </div>
              {selected === mo.id && <Check className="w-3 h-3 text-violet-400" />}
            </div>
            {selected === mo.id && (
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
                <div><p className="text-white/30 mb-0.5">Perf</p><ScoreBar value={mo.perf} color="bg-violet-500" /></div>
                <div><p className="text-white/30 mb-0.5">Speed</p><ScoreBar value={mo.speed} color="bg-blue-500" /></div>
                <div><p className="text-white/30 mb-0.5">Cost</p><ScoreBar value={mo.cost} color="bg-amber-500" /></div>
              </div>
            )}
          </button>
        ))}
      </div>
      {m && <p className="text-[10px] text-white/30 italic">Best for: {m.use}</p>}
    </PanelShell>
  );
}

function EvalPanel({ data, onChange }) {
  const selected = data.evals || [];
  const toggle = id => onChange({ ...data, evals: selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id] });

  return (
    <PanelShell accent="border-emerald-500/40">
      <SectionHeader icon={FlaskConical} label="Evaluation" subtitle="Quality gates & eval metrics" iconBg="bg-emerald-500/20" iconColor="text-emerald-400" />
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {EVAL_METRICS.map(em => {
          const Icon = em.icon;
          const on = selected.includes(em.id);
          return (
            <button key={em.id} onClick={() => toggle(em.id)}
              className={`text-left p-2.5 rounded-lg border-2 transition-all ${on ? 'border-emerald-500/70 bg-emerald-500/10' : 'border-white/10 hover:border-emerald-500/30'}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className={`w-3 h-3 ${on ? 'text-emerald-400' : 'text-white/30'}`} />
                <span className={`text-[10px] font-semibold ${on ? 'text-emerald-300' : 'text-white/50'}`}>{em.label}</span>
              </div>
              <p className="text-[9px] text-white/30 leading-tight">{em.desc}</p>
            </button>
          );
        })}
      </div>
      <div>
        <label className="text-xs font-semibold text-white/40 mb-1 block">Pass Threshold</label>
        <Input value={data.threshold || ''} onChange={e => onChange({ ...data, threshold: e.target.value })}
          placeholder="e.g. accuracy > 0.90, latency < 1.5s"
          className="text-xs h-8 bg-[#080C14] border-white/10 text-white placeholder:text-white/25 focus:border-emerald-500/60" />
      </div>
    </PanelShell>
  );
}

function GroundingPanel({ data, onChange }) {
  const selected = data.grounding || [];
  const toggle = id => onChange({ ...data, grounding: selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id] });
  const strategy = data.groundingStrategy || 'rag';

  return (
    <PanelShell accent="border-blue-500/40">
      <SectionHeader icon={Globe} label="Grounding" subtitle="Connect to trusted enterprise data" iconBg="bg-blue-500/20" iconColor="text-blue-400" />
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {GROUNDING_SOURCES.map(gs => {
          const on = selected.includes(gs.id);
          return (
            <button key={gs.id} onClick={() => toggle(gs.id)}
              className={`text-left p-2.5 rounded-lg border-2 transition-all ${on ? 'border-blue-500/70 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/30'}`}>
              <span className="text-base">{gs.icon}</span>
              <p className={`text-xs font-semibold mt-1 ${on ? 'text-blue-300' : 'text-white/50'}`}>{gs.label}</p>
            </button>
          );
        })}
      </div>
      <div>
        <label className="text-xs font-semibold text-white/40 mb-1.5 block">Retrieval Strategy</label>
        <div className="flex gap-1.5 flex-wrap">
          {[{ id: 'rag', label: 'RAG' }, { id: 'rerank', label: 'RAG + Rerank' }, { id: 'hybrid', label: 'Hybrid' }].map(s => (
            <button key={s.id} onClick={() => onChange({ ...data, groundingStrategy: s.id })}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${strategy === s.id ? 'border-blue-500 bg-blue-500/10 text-blue-300 font-semibold' : 'border-white/10 text-white/40 hover:border-blue-500/30'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

function CostPerfPanel({ data }) {
  const modelId = data.model;
  const m = MODELS.find(x => x.id === modelId);
  const evalCount = (data.evals || []).length;
  const groundingCount = (data.grounding || []).length;
  const goalCount = (data.goals || []).length;

  const score = Math.min(100, Math.round(
    (goalCount > 0 ? 20 : 0) + (modelId ? 25 : 0) + (Math.min(evalCount * 8, 25)) + (groundingCount >= 1 ? 20 : 0) + (data.successMetric ? 10 : 0)
  ));

  const costTier = m ? (m.cost <= 1 ? 'Low' : m.cost <= 2 ? 'Medium' : 'High') : '—';
  const perfTier = m ? (m.perf >= 5 ? 'Best-in-class' : m.perf >= 4 ? 'High' : 'Standard') : '—';
  const speedTier = m ? (m.speed >= 5 ? 'Very fast' : m.speed >= 4 ? 'Fast' : 'Moderate') : '—';

  const matrix = [
    { label: 'Goals defined',     val: goalCount > 0,        detail: `${goalCount} goal${goalCount !== 1 ? 's' : ''}` },
    { label: 'Model selected',    val: !!modelId,            detail: m?.label || '—' },
    { label: 'Eval metrics',      val: evalCount >= 2,       detail: `${evalCount} metrics` },
    { label: 'Grounding sources', val: groundingCount >= 1,  detail: `${groundingCount} source${groundingCount !== 1 ? 's' : ''}` },
    { label: 'Pass threshold',    val: !!data.successMetric, detail: data.successMetric || '—' },
  ];

  return (
    <PanelShell accent="border-amber-500/40">
      <SectionHeader icon={TrendingUp} label="Cost × Performance" subtitle="Readiness score & deployment profile" iconBg="bg-amber-500/20" iconColor="text-amber-400" />

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-white/40 font-semibold">Workflow Readiness</span>
          <span className={`text-sm font-bold ${score >= 80 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
          />
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        {matrix.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${r.val ? 'bg-green-500' : 'bg-white/10'}`}>
                {r.val && <Check className="w-2 h-2 text-white" />}
              </div>
              <span className={`text-xs ${r.val ? 'text-white/80' : 'text-white/30'}`}>{r.label}</span>
            </div>
            <span className="text-[10px] text-white/30 truncate max-w-[80px] text-right">{r.detail}</span>
          </div>
        ))}
      </div>

      {m && (
        <div className="bg-white/5 rounded-lg p-3 space-y-2 border border-white/10">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wide mb-1">Model profile</p>
          {[
            { label: 'Cost tier',   val: costTier,  color: m.cost <= 1 ? 'text-green-400 bg-green-500/10' : m.cost <= 2 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10' },
            { label: 'Performance', val: perfTier,  color: 'text-violet-400 bg-violet-500/10' },
            { label: 'Speed',       val: speedTier, color: 'text-blue-400 bg-blue-500/10' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-white/40">{row.label}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${row.color}`}>{row.val}</span>
            </div>
          ))}
        </div>
      )}
    </PanelShell>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function CortexWorkflowBuilder({ config }) {
  const navigate = useNavigate();
  const [wf, setWf] = useState({ goals: [], model: null, evals: [], grounding: [], successMetric: '', timeline: '30d', groundingStrategy: 'rag', threshold: '' });
  const [launched, setLaunched] = useState(false);

  const update = patch => setWf(prev => ({ ...prev, ...patch }));

  const readiness = Math.min(100, Math.round(
    (wf.goals.length > 0 ? 20 : 0) + (wf.model ? 25 : 0) + Math.min(wf.evals.length * 8, 25) + (wf.grounding.length >= 1 ? 20 : 0) + (wf.successMetric ? 10 : 0)
  ));

  const handleDeploy = () => {
    setLaunched(true);
    setTimeout(() => navigate('/'), 1400);
  };

  if (launched) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-600/40">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Deploying your CortexOS workflow…</h2>
        <p className="text-white/40 text-sm">Routing to your dashboard.</p>
      </motion.div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-green-400" />
          </div>
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Instance Provisioned — Configure Agentic Workflow</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{config.company_name} · Agent Designer</h1>
        <p className="text-sm text-white/50">Set goals, pick your model, define eval criteria, ground it in your data, and check the cost-performance matrix.</p>
      </motion.div>

      {/* Stage labels */}
      <div className="hidden lg:grid grid-cols-5 gap-2 mb-2">
        {[
          { n: '1', label: 'Goal Setting',  color: 'text-indigo-400' },
          { n: '2', label: 'Model Choice',  color: 'text-violet-400' },
          { n: '3', label: 'Evaluation',    color: 'text-emerald-400' },
          { n: '4', label: 'Grounding',     color: 'text-blue-400' },
          { n: '5', label: 'Cost × Perf',   color: 'text-amber-400' },
        ].map(s => (
          <div key={s.n} className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${s.color}`}>{s.n}</span>
            <span className="text-xs font-semibold text-white/40">{s.label}</span>
          </div>
        ))}
      </div>

      {/* 5-Panel pipeline */}
      <div className="flex flex-col lg:flex-row gap-2 mb-5">
        <GoalPanel data={wf} onChange={update} />
        <PipeArrow />
        <ModelPanel data={wf} onChange={update} />
        <PipeArrow />
        <EvalPanel data={wf} onChange={update} />
        <PipeArrow />
        <GroundingPanel data={wf} onChange={update} />
        <PipeArrow />
        <CostPerfPanel data={wf} />
      </div>

      {/* Footer */}
      <div className="bg-[#0A0E18] rounded-xl border border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-white/30 font-semibold">Instance:</span>
          <Badge variant="outline" className="text-xs border-white/10 text-white/60">{config.company_name}</Badge>
          <Badge variant="outline" className="text-xs border-white/10 text-white/60">{config.domains.length} domains</Badge>
          <Badge variant="outline" className="text-xs border-white/10 text-white/60">{config.modules.length} modules</Badge>
          <Badge variant="outline" className={`text-xs font-bold ${readiness >= 80 ? 'border-green-500/40 text-green-400' : readiness >= 50 ? 'border-amber-500/40 text-amber-400' : 'border-white/10 text-white/40'}`}>
            {readiness}% ready
          </Badge>
        </div>
        <Button
          onClick={handleDeploy}
          disabled={readiness < 40}
          className="bg-indigo-600 hover:bg-indigo-500 text-white h-9 px-5 text-sm gap-2 disabled:opacity-40 shadow-lg shadow-indigo-600/30"
        >
          Deploy Workflow <Zap className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}