import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ArrowRight, Database, Bell, Brain, BarChart3, Workflow,
  Shield, Zap, ChevronRight, Play, Eye, Lock, Settings,
  Factory, Truck, ShoppingCart, DollarSign, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DOMAIN_ICONS = {
  manufacturing: Factory, logistics: Truck, retail: ShoppingCart,
  finance: DollarSign, hr: UserCheck, operations: Settings,
};
const DOMAIN_COLORS = {
  manufacturing: 'text-orange-600 bg-orange-50 border-orange-200',
  logistics: 'text-blue-600 bg-blue-50 border-blue-200',
  retail: 'text-pink-600 bg-pink-50 border-pink-200',
  finance: 'text-green-600 bg-green-50 border-green-200',
  hr: 'text-purple-600 bg-purple-50 border-purple-200',
  operations: 'text-slate-600 bg-slate-50 border-slate-200',
};

const MODULE_META = {
  alerts:          { icon: Bell,      label: 'Smart Alerts',      color: 'text-red-600 bg-red-50 border-red-200',       desc: 'Anomaly detection & alerting' },
  recommendations: { icon: Brain,     label: 'Recommendations',   color: 'text-violet-600 bg-violet-50 border-violet-200', desc: 'AI action plans' },
  scenarios:       { icon: Workflow,  label: 'Scenario Planner',  color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'What-if simulations' },
  data_sources:    { icon: Database,  label: 'Data Hub',          color: 'text-blue-600 bg-blue-50 border-blue-200',    desc: 'ERP, CRM, IoT connectors' },
  analytics:       { icon: BarChart3, label: 'KPI Dashboard',     color: 'text-teal-600 bg-teal-50 border-teal-200',    desc: 'Real-time metrics' },
  rbac:            { icon: Shield,    label: 'Access Control',    color: 'text-slate-600 bg-slate-50 border-slate-200', desc: 'Role-based permissions' },
};

function FlowArrow() {
  return (
    <div className="flex items-center justify-center w-8 flex-shrink-0">
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-px h-3 bg-slate-300" />
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 -rotate-90" />
      </div>
    </div>
  );
}

function FlowNode({ icon: Icon, label, sublabel, color, index, active, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
        active ? 'border-indigo-500 shadow-md shadow-indigo-100' : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'
      } bg-white`}
    >
      {active && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-2.5 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
    </motion.div>
  );
}

export default function WorkflowBuilder({ config }) {
  const navigate = useNavigate();
  const [activeNode, setActiveNode] = useState(null);
  const [launched, setLaunched] = useState(false);

  const selectedDomains = config.domains.map(id => ({
    id,
    icon: DOMAIN_ICONS[id] || Settings,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    color: DOMAIN_COLORS[id] || DOMAIN_COLORS.operations,
  }));

  const selectedModules = config.modules.map(id => MODULE_META[id]).filter(Boolean);

  const handleLive = () => {
    setLaunched(true);
    setTimeout(() => navigate('/'), 1200);
  };

  if (launched) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Taking you to your dashboard…</h2>
        <p className="text-slate-500 text-sm">Your OperaOS is live.</p>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Instance Provisioned</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{config.company_name}'s AI Workflow</h1>
        <p className="text-sm text-slate-500">Review your intelligence pipeline — data flows left to right through each layer.</p>
      </motion.div>

      {/* Pipeline canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 overflow-x-auto">
        <div className="flex items-start gap-0 min-w-[640px]">

          {/* Layer 1: Data Sources */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Data Layer</p>
            <div className="space-y-2">
              {selectedDomains.map((d, i) => (
                <FlowNode
                  key={d.id} index={i}
                  icon={d.icon} label={d.label} sublabel="Domain data"
                  color={d.color}
                  active={activeNode === `domain-${d.id}`}
                  onClick={() => setActiveNode(activeNode === `domain-${d.id}` ? null : `domain-${d.id}`)}
                />
              ))}
              {selectedDomains.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No domains</div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center self-stretch pt-8 mx-2">
            <div className="flex flex-col items-center gap-0">
              <div className="w-10 h-px bg-gradient-to-r from-slate-300 to-indigo-300" />
              <ArrowRight className="w-4 h-4 text-indigo-400 -ml-1" />
            </div>
          </div>

          {/* Layer 2: AI Engine (always present) */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">AI Engine</p>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setActiveNode(activeNode === 'engine' ? null : 'engine')}
            >
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center mb-2.5">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-bold">OperaOS Core</p>
              <p className="text-xs text-indigo-200 mt-0.5">Detect · Diagnose · Forecast</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {['Anomaly', 'Root Cause', 'Forecast'].map(t => (
                  <span key={t} className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Arrow */}
          <div className="flex items-center self-stretch pt-8 mx-2">
            <div className="flex flex-col items-center">
              <div className="w-10 h-px bg-gradient-to-r from-indigo-300 to-violet-300" />
              <ArrowRight className="w-4 h-4 text-violet-400 -ml-1" />
            </div>
          </div>

          {/* Layer 3: Modules */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Modules</p>
            <div className="space-y-2">
              {selectedModules.map((m, i) => (
                <FlowNode
                  key={m.label} index={i}
                  icon={m.icon} label={m.label} sublabel={m.desc}
                  color={m.color}
                  active={activeNode === `module-${m.label}`}
                  onClick={() => setActiveNode(activeNode === `module-${m.label}` ? null : `module-${m.label}`)}
                />
              ))}
              {selectedModules.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No modules</div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center self-stretch pt-8 mx-2">
            <div className="flex flex-col items-center">
              <div className="w-10 h-px bg-gradient-to-r from-violet-300 to-slate-300" />
              <ArrowRight className="w-4 h-4 text-slate-400 -ml-1" />
            </div>
          </div>

          {/* Layer 4: Outputs */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Outputs</p>
            <div className="space-y-2">
              {[
                { icon: Eye, label: 'Command Center', sublabel: 'Live dashboard', color: 'text-teal-600 bg-teal-50 border-teal-200' },
                { icon: Bell, label: 'Alerts', sublabel: 'Prioritized feed', color: 'text-red-600 bg-red-50 border-red-200' },
                { icon: Play, label: 'Auto-Actions', sublabel: 'Approved workflows', color: 'text-green-600 bg-green-50 border-green-200' },
                { icon: Lock, label: 'Audit Trail', sublabel: 'Full log history', color: 'text-slate-600 bg-slate-50 border-slate-200' },
              ].map((o, i) => (
                <FlowNode
                  key={o.label} index={i}
                  icon={o.icon} label={o.label} sublabel={o.sublabel}
                  color={o.color}
                  active={activeNode === `out-${o.label}`}
                  onClick={() => setActiveNode(activeNode === `out-${o.label}` ? null : `out-${o.label}`)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Config summary */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3 items-center text-sm">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Your config:</span>
        <Badge variant="outline" className="text-xs">{config.company_name}</Badge>
        <Badge variant="outline" className="text-xs">{config.domains.length} domains</Badge>
        <Badge variant="outline" className="text-xs">{config.modules.length} modules</Badge>
        <Badge variant="outline" className="text-xs">{config.team_size} team</Badge>
        <Badge variant="outline" className="text-xs">{config.admin_email}</Badge>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Setup link sent to <strong className="text-slate-600">{config.admin_email}</strong></p>
        <Button
          onClick={handleLive}
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-6 rounded-lg gap-2"
        >
          Go Live <Zap className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}