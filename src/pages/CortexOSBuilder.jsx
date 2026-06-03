import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, ArrowRight, ArrowLeft, Check, Building2, Users, BarChart3, Database, Bell, Brain, Workflow, Shield, Globe, Factory, Truck, ShoppingCart, DollarSign, UserCheck, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import CortexWorkflowBuilder from '@/components/cortexos/CortexWorkflowBuilder';

const STEPS = ['Company', 'Industry', 'Modules', 'Team', 'Launch'];

const DOMAINS = [
  { id: 'manufacturing', label: 'Manufacturing', icon: Factory, description: 'OEE, downtime, quality metrics' },
  { id: 'logistics', label: 'Logistics', icon: Truck, description: 'OTD, SLA, delivery performance' },
  { id: 'retail', label: 'Retail', icon: ShoppingCart, description: 'Sales, inventory, customer metrics' },
  { id: 'finance', label: 'Finance', icon: DollarSign, description: 'Revenue, margins, forecasting' },
  { id: 'hr', label: 'HR', icon: UserCheck, description: 'Headcount, attrition, engagement' },
  { id: 'operations', label: 'Operations', icon: Settings, description: 'Cross-functional KPIs & workflows' },
];

const MODULES = [
  { id: 'alerts', label: 'Smart Alerts', icon: Bell, description: 'AI-powered anomaly detection & alerting' },
  { id: 'recommendations', label: 'Recommendations', icon: Brain, description: 'Ranked action plans with AI reasoning' },
  { id: 'scenarios', label: 'Scenario Planner', icon: Workflow, description: 'What-if simulations & forecasting' },
  { id: 'data_sources', label: 'Data Hub', icon: Database, description: 'ERP, CRM, IoT, API connectors' },
  { id: 'analytics', label: 'KPI Dashboard', icon: BarChart3, description: 'Real-time metrics across all domains' },
  { id: 'rbac', label: 'Access Control', icon: Shield, description: 'Role-based permissions & audit logs' },
];

const TEAM_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+'];

export default function CortexOSBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    company_name: '',
    company_url: '',
    domains: [],
    modules: [],
    team_size: '',
    admin_email: '',
  });

  const toggleItem = (key, id) => {
    setConfig(prev => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter(x => x !== id) : [...prev[key], id],
    }));
  };

  const canNext = () => {
    if (step === 0) return config.company_name.trim().length > 0;
    if (step === 1) return config.domains.length > 0;
    if (step === 2) return config.modules.length > 0;
    if (step === 3) return config.team_size && config.admin_email.trim().length > 0;
    return true;
  };

  const handleLaunch = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success('Your CortexOS instance is being provisioned!');
    setStep(4);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col">
      {/* Nav */}
      <div className="bg-[#0A0E18] border-b border-white/10 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white">CortexOS</span>
          <span className="text-white/30 mx-1">·</span>
          <span className="text-sm text-white/50">Builder</span>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                i < step ? 'bg-indigo-500/20 text-indigo-400' :
                i === step ? 'bg-indigo-600 text-white' :
                'bg-white/5 text-white/30'
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-4 h-px ${i < step ? 'bg-indigo-500/40' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className={`w-full ${step === 4 ? 'max-w-6xl' : 'max-w-2xl'}`}>

          {/* Step 0: Company */}
          {step === 0 && (
            <div>
              <div className="mb-8">
                <Building2 className="w-10 h-10 text-indigo-400 mb-3" />
                <h1 className="text-2xl font-bold text-white mb-2">Let's set up your CortexOS instance</h1>
                <p className="text-white/50">Tell us about your company to customize your agentic AI platform.</p>
              </div>
              <div className="bg-[#0F1420] rounded-xl border border-white/10 p-6 space-y-5">
                <div>
                  <Label className="text-sm font-medium text-white/70 mb-1.5 block">Company Name *</Label>
                  <Input
                    placeholder="Acme Corp"
                    value={config.company_name}
                    onChange={e => setConfig(p => ({ ...p, company_name: e.target.value }))}
                    className="bg-[#080C14] border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/60"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-white/70 mb-1.5 block">Company Website</Label>
                  <Input
                    placeholder="https://acme.com"
                    value={config.company_url}
                    onChange={e => setConfig(p => ({ ...p, company_url: e.target.value }))}
                    className="bg-[#080C14] border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/60"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Domains */}
          {step === 1 && (
            <div>
              <div className="mb-8">
                <Globe className="w-10 h-10 text-indigo-400 mb-3" />
                <h1 className="text-2xl font-bold text-white mb-2">Which domains do you operate in?</h1>
                <p className="text-white/50">Select all that apply. We'll configure KPIs, alerts, and dashboards for each.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DOMAINS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => toggleItem('domains', d.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      config.domains.includes(d.id)
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-white/10 bg-[#0F1420] hover:border-indigo-500/40'
                    }`}
                  >
                    <d.icon className={`w-6 h-6 mb-2 ${config.domains.includes(d.id) ? 'text-indigo-400' : 'text-white/30'}`} />
                    <p className={`font-semibold text-sm ${config.domains.includes(d.id) ? 'text-indigo-300' : 'text-white/70'}`}>{d.label}</p>
                    <p className="text-xs text-white/30 mt-0.5">{d.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Modules */}
          {step === 2 && (
            <div>
              <div className="mb-8">
                <Brain className="w-10 h-10 text-indigo-400 mb-3" />
                <h1 className="text-2xl font-bold text-white mb-2">Which AI modules do you need?</h1>
                <p className="text-white/50">Pick the capabilities to include in your platform. You can add more later.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MODULES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleItem('modules', m.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                      config.modules.includes(m.id)
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-white/10 bg-[#0F1420] hover:border-indigo-500/40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      config.modules.includes(m.id) ? 'bg-indigo-500/20' : 'bg-white/5'
                    }`}>
                      <m.icon className={`w-4 h-4 ${config.modules.includes(m.id) ? 'text-indigo-400' : 'text-white/30'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${config.modules.includes(m.id) ? 'text-indigo-300' : 'text-white/70'}`}>{m.label}</p>
                      <p className="text-xs text-white/30 mt-0.5">{m.description}</p>
                    </div>
                    {config.modules.includes(m.id) && (
                      <Check className="w-4 h-4 text-indigo-400 ml-auto flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Team */}
          {step === 3 && (
            <div>
              <div className="mb-8">
                <Users className="w-10 h-10 text-indigo-400 mb-3" />
                <h1 className="text-2xl font-bold text-white mb-2">Almost there — your team details</h1>
                <p className="text-white/50">Help us size your instance and set up your admin account.</p>
              </div>
              <div className="bg-[#0F1420] rounded-xl border border-white/10 p-6 space-y-6">
                <div>
                  <Label className="text-sm font-medium text-white/70 mb-2 block">Team Size *</Label>
                  <div className="flex flex-wrap gap-2">
                    {TEAM_SIZES.map(s => (
                      <button
                        key={s}
                        onClick={() => setConfig(p => ({ ...p, team_size: s }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                          config.team_size === s
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                            : 'border-white/10 bg-transparent text-white/50 hover:border-indigo-500/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-white/70 mb-1.5 block">Admin Email *</Label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={config.admin_email}
                    onChange={e => setConfig(p => ({ ...p, admin_email: e.target.value }))}
                    className="bg-[#080C14] border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/60"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Workflow Builder */}
          {step === 4 && <CortexWorkflowBuilder config={config} />}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="border-white/10 text-white/60 bg-transparent hover:bg-white/5 hover:text-white disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              {step < 3 ? (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleLaunch}
                  disabled={!canNext() || loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
                >
                  {loading ? 'Launching...' : 'Launch My CortexOS'} <Zap className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}