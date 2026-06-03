import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Brain, FlaskConical, Globe, TrendingUp,
  Check, ChevronRight, ChevronDown, Zap, Plus, X,
  Settings, ArrowRight, Star, DollarSign, Gauge, Shield,
  BarChart3, Cpu, RefreshCw, AlertTriangle, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ── MODELS ────────────────────────────────────────────────────────────────────
const MODELS = [
  { id: 'gpt4o',      label: 'GPT-4o',         provider: 'OpenAI',    cost: 3, perf: 5, speed: 3, use: 'Complex reasoning, multi-step tasks' },
  { id: 'gpt4o_mini', label: 'GPT-4o mini',    provider: 'OpenAI',    cost: 1, perf: 3, speed: 5, use: 'High-volume, fast classification' },
  { id: 'claude35',   label: 'Claude 3.5',      provider: 'Anthropic', cost: 3, perf: 5, speed: 3, use: 'Long-context, nuanced analysis' },
  { id: 'gemini15',   label: 'Gemini 1.5 Pro',  provider: 'Google',   cost: 2, perf: 4, speed: 4, use: 'Multimodal, document understanding' },
  { id: 'llama3',     label: 'Llama 3 70B',     provider: 'Meta',      cost: 1, perf: 3, speed: 4, use: 'Open-source, on-prem deployment' },
  { id: 'mistral',    label: 'Mistral Large',   provider: 'Mistral',   cost: 2, perf: 4, speed: 4, use: 'European compliance, low latency' },
];

const EVAL_METRICS = [
  { id: 'accuracy',    label: 'Accuracy',          icon: Target,    desc: 'Correctness against ground truth' },
  { id: 'faithfulness',label: 'Faithfulness',       icon: Shield,    desc: 'Grounded in provided context' },
  { id: 'latency',     label: 'Latency p95',        icon: Gauge,     desc: 'Response time at 95th percentile' },
  { id: 'cost',        label: 'Cost per 1k calls',  icon: DollarSign,desc: 'Token cost at production volume' },
  { id: 'hallucination',label: 'Hallucination rate',icon: AlertTriangle, desc: 'Rate of unsupported claims' },
  { id: 'relevance',   label: 'Answer relevance',   icon: Star,      desc: 'Alignment with user intent' },
];

const GROUNDING_SOURCES = [
  { id: 'erp',     label: 'ERP / SAP',      icon: '🏭' },
  { id: 'crm',     label: 'CRM / Salesforce',icon: '🤝' },
  { id: 'kb',      label: 'Knowledge Base', icon: '📚' },
  { id: 'realtime',label: 'Real-time feeds', icon: '📡' },
  { id: 'web',     label: 'Web search',     icon: '🌐' },
  { id: 'docs',    label: 'Internal docs',  icon: '📄' },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Dot({ active }) {
  return (
    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${active ? 'bg-indigo-500' : 'bg-slate-300'}`} />
  );
}

function PipeArrow() {
  return (
    <div className="hidden md:flex items-center justify-center w-8 flex-shrink-0 self-stretch">
      <div className="flex flex-col items-center h-full justify-center">
        <div className="flex-1 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
        <ArrowRight className="w-4 h-4 text-indigo-400 my-1 rotate-0" />
        <div className="flex-1 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
      </div>
    </div>
  );
}

function ScoreBar({ value, max = 5, color = 'bg-indigo-500' }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`h-1.5 w-4 rounded-full ${i < value ? color : 'bg-slate-200'}`} />
      ))}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color, subtitle }) {
  return (
    <div className="flex items-start gap-2.5 mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 leading-tight">{label}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── PANELS ────────────────────────────────────────────────────────────────────

function GoalPanel({ data, onChange }) {
  const [inputVal, setInputVal] = useState('');
  const goals = data.goals || [];
  const successMetric = data.successMetric || '';
  const timeline = data.timeline || '30d';

  const addGoal = () => {
    if (!inputVal.trim()) return;
    onChange({ ...data, goals: [...goals, inputVal.trim()] });
    setInputVal('');
  };

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-5 flex-1 min-w-[220px]">
      <SectionHeader icon={Target} label="Goal Setting" color="bg-indigo-100 text-indigo-600" subtitle="Define agent objectives & success criteria" />

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Agent Goals</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGoal()}
              placeholder="e.g. Reduce MTTR by 30%"
              className="text-xs h-8 border-slate-200"
            />
            <Button size="icon" onClick={addGoal} className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {goals.length === 0 && <p className="text-xs text-slate-400 italic">No goals added yet</p>}
            {goals.map((g, i) => (
              <div key={i} className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5">
                <span className="text-xs text-indigo-800 flex items-center gap-1.5"><Dot active /> {g}</span>
                <button onClick={() => onChange({ ...data, goals: goals.filter((_, j) => j !== i) })}>
                  <X className="w-3 h-3 text-indigo-400 hover:text-indigo-700" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Success Metric</label>
          <Input
            value={successMetric}
            onChange={e => onChange({ ...data, successMetric: e.target.value })}
            placeholder="e.g. Precision ≥ 92%, Latency < 2s"
            className="text-xs h-8 border-slate-200"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Timeline</label>
          <div className="flex gap-1.5">
            {['7d', '30d', '90d', 'ongoing'].map(t => (
              <button key={t} onClick={() => onChange({ ...data, timeline: t })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${timeline === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold' : 'border-slate-200 text-slate-500 hover:border-indigo-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelPanel({ data, onChange }) {
  const selected = data.model || null;
  const m = MODELS.find(x => x.id === selected);

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-5 flex-1 min-w-[220px]">
      <SectionHeader icon={Cpu} label="Model Choice" color="bg-violet-100 text-violet-600" subtitle="Select LLM for the agentic core" />

      <div className="space-y-2 mb-3">
        {MODELS.map(mo => (
          <button key={mo.id} onClick={() => onChange({ ...data, model: mo.id })}
            className={`w-full text-left p-2.5 rounded-lg border-2 transition-all ${selected === mo.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-violet-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dot active={selected === mo.id} />
                <span className="text-xs font-semibold text-slate-800">{mo.label}</span>
                <span className="text-[10px] text-slate-400">{mo.provider}</span>
              </div>
              {selected === mo.id && <Check className="w-3 h-3 text-violet-600" />}
            </div>
            {selected === mo.id && (
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
                <div><p className="text-slate-400 mb-0.5">Perf</p><ScoreBar value={mo.perf} color="bg-violet-500" /></div>
                <div><p className="text-slate-400 mb-0.5">Speed</p><ScoreBar value={mo.speed} color="bg-blue-500" /></div>
                <div><p className="text-slate-400 mb-0.5">Cost</p><ScoreBar value={mo.cost} color="bg-amber-500" /></div>
              </div>
            )}
          </button>
        ))}
      </div>
      {m && <p className="text-[10px] text-slate-400 italic">Best for: {m.use}</p>}
    </div>
  );
}

function EvalPanel({ data, onChange }) {
  const selected = data.evals || [];
  const toggle = id => onChange({ ...data, evals: selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id] });
  const threshold = data.threshold || '';

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-5 flex-1 min-w-[220px]">
      <SectionHeader icon={FlaskConical} label="Evaluation" color="bg-emerald-100 text-emerald-600" subtitle="Define quality gates & eval metrics" />

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {EVAL_METRICS.map(em => {
          const Icon = em.icon;
          const on = selected.includes(em.id);
          return (
            <button key={em.id} onClick={() => toggle(em.id)}
              className={`text-left p-2.5 rounded-lg border-2 transition-all ${on ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon className={`w-3 h-3 ${on ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-semibold ${on ? 'text-emerald-800' : 'text-slate-600'}`}>{em.label}</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">{em.desc}</p>
            </button>
          );
        })}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1 block">Pass Threshold</label>
        <Input
          value={threshold}
          onChange={e => onChange({ ...data, threshold: e.target.value })}
          placeholder="e.g. accuracy > 0.90, latency < 1.5s"
          className="text-xs h-8 border-slate-200"
        />
      </div>
    </div>
  );
}

function GroundingPanel({ data, onChange }) {
  const selected = data.grounding || [];
  const toggle = id => onChange({ ...data, grounding: selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id] });
  const strategy = data.groundingStrategy || 'rag';

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-5 flex-1 min-w-[220px]">
      <SectionHeader icon={Globe} label="Grounding" color="bg-blue-100 text-blue-600" subtitle="Connect agent to trusted data sources" />

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {GROUNDING_SOURCES.map(gs => {
          const on = selected.includes(gs.id);
          return (
            <button key={gs.id} onClick={() => toggle(gs.id)}
              className={`text-left p-2.5 rounded-lg border-2 transition-all ${on ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}>
              <span className="text-base">{gs.icon}</span>
              <p className={`text-xs font-semibold mt-1 ${on ? 'text-blue-800' : 'text-slate-700'}`}>{gs.label}</p>
            </button>
          );
        })}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Retrieval Strategy</label>
        <div className="flex gap-1.5">
          {[
            { id: 'rag', label: 'RAG' },
            { id: 'rerank', label: 'RAG + Rerank' },
            { id: 'hybrid', label: 'Hybrid' },
          ].map(s => (
            <button key={s.id} onClick={() => onChange({ ...data, groundingStrategy: s.id })}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${strategy === s.id ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-500 hover:border-blue-200'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CostPerfPanel({ data }) {
  const modelId = data.model;
  const m = MODELS.find(x => x.id === modelId);
  const evalCount = (data.evals || []).length;
  const groundingCount = (data.grounding || []).length;
  const goalCount = (data.goals || []).length;

  // Compute a simple readiness score
  const score = Math.min(100, Math.round(
    (goalCount > 0 ? 20 : 0) +
    (modelId ? 25 : 0) +
    (evalCount >= 2 ? 25 : evalCount * 8) +
    (groundingCount >= 1 ? 20 : 0) +
    (data.successMetric ? 10 : 0)
  ));

  const costTier = m ? (m.cost <= 1 ? 'Low' : m.cost <= 2 ? 'Medium' : 'High') : '—';
  const perfTier = m ? (m.perf >= 5 ? 'Best-in-class' : m.perf >= 4 ? 'High' : 'Standard') : '—';
  const speedTier = m ? (m.speed >= 5 ? 'Very fast' : m.speed >= 4 ? 'Fast' : 'Moderate') : '—';

  const matrix = [
    { label: 'Goals defined',       val: goalCount > 0,    detail: `${goalCount} goal${goalCount !== 1 ? 's' : ''}` },
    { label: 'Model selected',      val: !!modelId,        detail: m?.label || '—' },
    { label: 'Eval metrics',        val: evalCount >= 2,   detail: `${evalCount} metrics` },
    { label: 'Grounding sources',   val: groundingCount >= 1, detail: `${groundingCount} source${groundingCount !== 1 ? 's' : ''}` },
    { label: 'Success threshold',   val: !!data.successMetric, detail: data.successMetric || '—' },
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-5 flex-1 min-w-[220px]">
      <SectionHeader icon={TrendingUp} label="Cost × Performance" color="bg-amber-100 text-amber-600" subtitle="Readiness score & deployment profile" />

      {/* Readiness gauge */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500 font-semibold">Workflow Readiness</span>
          <span className={`text-sm font-bold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{score}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-1.5 mb-4">
        {matrix.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${r.val ? 'bg-green-500' : 'bg-slate-200'}`}>
                {r.val && <Check className="w-2 h-2 text-white" />}
              </div>
              <span className={`text-xs ${r.val ? 'text-slate-700' : 'text-slate-400'}`}>{r.label}</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate max-w-[90px] text-right">{r.detail}</span>
          </div>
        ))}
      </div>

      {/* Model cost/perf table */}
      {m && (
        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Selected model profile</p>
          {[
            { label: 'Cost tier',    val: costTier,  color: m.cost <= 1 ? 'text-green-600 bg-green-50' : m.cost <= 2 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50' },
            { label: 'Performance',  val: perfTier,  color: 'text-violet-600 bg-violet-50' },
            { label: 'Speed',        val: speedTier, color: 'text-blue-600 bg-blue-50' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{row.label}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${row.color}`}>{row.val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function WorkflowBuilder({ config }) {
  const navigate = useNavigate();
  const [wf, setWf] = useState({ goals: [], model: null, evals: [], grounding: [], successMetric: '', timeline: '30d', groundingStrategy: 'rag' });
  const [launched, setLaunched] = useState(false);

  const updateSection = patch => setWf(prev => ({ ...prev, ...patch }));

  const readiness = Math.min(100, Math.round(
    ((wf.goals.length > 0 ? 20 : 0) + (wf.model ? 25 : 0) + (Math.min((wf.evals.length) * 8, 25)) + (wf.grounding.length >= 1 ? 20 : 0) + (wf.successMetric ? 10 : 0))
  ));

  const handleDeploy = () => {
    setLaunched(true);
    setTimeout(() => navigate('/'), 1400);
  };

  if (launched) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Deploying your agentic workflow…</h2>
        <p className="text-slate-400 text-sm">Routing to your dashboard.</p>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Instance Provisioned — Configure Agentic Workflow</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{config.company_name} · AI Agent Designer</h1>
        <p className="text-sm text-slate-500">Set your goals, pick your model, define evaluation criteria, ground it in your data, and review the cost-performance tradeoff.</p>
      </motion.div>

      {/* Pipeline label bar */}
      <div className="hidden md:grid grid-cols-5 gap-2 mb-2 px-0.5">
        {[
          { n: '1', label: 'Goal Setting',    color: 'text-indigo-600' },
          { n: '2', label: 'Model Choice',    color: 'text-violet-600' },
          { n: '3', label: 'Evaluation',      color: 'text-emerald-600' },
          { n: '4', label: 'Grounding',       color: 'text-blue-600' },
          { n: '5', label: 'Cost × Perf',     color: 'text-amber-600' },
        ].map(s => (
          <div key={s.n} className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${s.color}`}>{s.n}</span>
            <span className="text-xs font-semibold text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* 5-Panel pipeline */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <GoalPanel data={wf} onChange={updateSection} />
        <PipeArrow />
        <ModelPanel data={wf} onChange={updateSection} />
        <PipeArrow />
        <EvalPanel data={wf} onChange={updateSection} />
        <PipeArrow />
        <GroundingPanel data={wf} onChange={updateSection} />
        <PipeArrow />
        <CostPerfPanel data={wf} />
      </div>

      {/* Footer bar */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-400 font-semibold">Instance:</span>
          <Badge variant="outline" className="text-xs">{config.company_name}</Badge>
          <Badge variant="outline" className="text-xs">{config.domains.length} domains</Badge>
          <Badge variant="outline" className="text-xs">{config.modules.length} modules</Badge>
          <Badge variant="outline" className={`text-xs font-bold ${readiness >= 80 ? 'border-green-400 text-green-700' : readiness >= 50 ? 'border-amber-400 text-amber-700' : 'border-slate-300 text-slate-500'}`}>
            {readiness}% ready
          </Badge>
        </div>
        <Button
          onClick={handleDeploy}
          disabled={readiness < 40}
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-5 text-sm gap-2 disabled:opacity-40"
        >
          Deploy Workflow <Zap className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}