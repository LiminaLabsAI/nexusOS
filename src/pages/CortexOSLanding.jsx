import { Link } from 'react-router-dom';
import { Cpu, ArrowRight, CheckCircle, BarChart3, Shield, Brain, Workflow, Database, Bell, Zap, Target, FlaskConical, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const features = [
  { icon: Target, title: 'Goal-Driven Agents', description: 'Define agent objectives with success metrics, timelines, and measurable outcomes baked in from day one.' },
  { icon: Brain, title: 'Multi-Model Orchestration', description: 'Choose from GPT-4o, Claude 3.5, Gemini, Llama and more — routed intelligently based on task complexity.' },
  { icon: FlaskConical, title: 'Built-In Evaluation', description: 'Continuous evaluation across accuracy, faithfulness, latency and hallucination rate — with auto-gating.' },
  { icon: Globe, title: 'Enterprise Grounding', description: 'Connect agents to your ERP, CRM, knowledge bases, and real-time feeds via RAG or hybrid retrieval.' },
  { icon: BarChart3, title: 'Cost × Performance Matrix', description: 'Live readiness scores and model profiles help you optimize for quality, speed, and budget simultaneously.' },
  { icon: Shield, title: 'Enterprise Security', description: 'SOC 2 Type II, role-based access, full audit logs, and on-prem deployment options available.' },
];

const stats = [
  { value: '10x', label: 'Faster agent deployment' },
  { value: '67%', label: 'Reduction in hallucination' },
  { value: '4.1x', label: 'ROI within 90 days' },
  { value: '99.9%', label: 'Platform uptime SLA' },
];

const steps = [
  { n: '01', title: 'Set Goals', desc: 'Define what success looks like for your agents — metrics, timelines, KPIs.', color: 'bg-indigo-600' },
  { n: '02', title: 'Choose Model', desc: 'Select from frontier or open-source LLMs. Cortex recommends based on your use case.', color: 'bg-violet-600' },
  { n: '03', title: 'Configure Evals', desc: 'Set quality gates: accuracy thresholds, latency targets, hallucination limits.', color: 'bg-emerald-600' },
  { n: '04', title: 'Ground It', desc: 'Connect to your enterprise data sources — ERP, CRM, knowledge base, real-time APIs.', color: 'bg-blue-600' },
  { n: '05', title: 'Deploy', desc: 'Go live with a production-grade agentic workflow in minutes, not months.', color: 'bg-amber-500' },
];

export default function CortexOSLanding() {
  return (
    <div className="min-h-screen bg-[#080C14] text-white font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#080C14]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">CortexOS</span>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full ml-1">BETA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#results" className="hover:text-white transition-colors">Results</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Sign In</Link>
            <Link to="/cortex-builder">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 h-9 rounded-lg">
                Start Building <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
              <Zap className="w-3 h-3" />
              Agentic AI Platform for the Enterprise
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              Ship Production{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                AI Agents
              </span>
              <br />in Minutes
            </h1>
            <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-2xl mx-auto">
              CortexOS is the self-serve platform for building enterprise-grade agentic workflows — with built-in goal setting, multi-model routing, evaluation pipelines, and enterprise data grounding.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
              <Link to="/cortex-builder">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white h-12 px-8 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30">
                  Build Your First Agent <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="h-12 px-8 rounded-xl text-sm font-semibold border-white/20 text-white/80 bg-white/5 hover:bg-white/10 hover:border-white/30">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
            <p className="text-xs text-white/30">No credit card required · SOC 2 certified · Deploy in minutes</p>
          </motion.div>
        </div>

        {/* Hero UI mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-5xl mx-auto mt-16"
        >
          <div className="bg-[#0F1420] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-[#0A0E18] px-4 py-3 flex items-center gap-2 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs font-medium text-white/30">CortexOS · Agentic Workflow Designer</span>
            </div>
            <div className="p-5">
              {/* Pipeline preview */}
              <div className="hidden md:flex items-stretch gap-2 mb-4">
                {[
                  { label: 'Goal Setting', sub: '3 goals defined', icon: Target, color: 'border-indigo-500/60 bg-indigo-500/10', iconColor: 'text-indigo-400' },
                  { label: 'Model Choice', sub: 'GPT-4o selected', icon: Cpu, color: 'border-violet-500/60 bg-violet-500/10', iconColor: 'text-violet-400' },
                  { label: 'Evaluation', sub: '4 metrics active', icon: FlaskConical, color: 'border-emerald-500/60 bg-emerald-500/10', iconColor: 'text-emerald-400' },
                  { label: 'Grounding', sub: 'ERP + CRM + KB', icon: Globe, color: 'border-blue-500/60 bg-blue-500/10', iconColor: 'text-blue-400' },
                  { label: 'Cost × Perf', sub: '92% ready', icon: BarChart3, color: 'border-amber-500/60 bg-amber-500/10', iconColor: 'text-amber-400' },
                ].map((node, i) => (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className={`flex-1 p-3 rounded-xl border-2 ${node.color}`}>
                      <node.icon className={`w-4 h-4 mb-2 ${node.iconColor}`} />
                      <p className="text-xs font-semibold text-white/90">{node.label}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{node.sub}</p>
                    </div>
                    {i < 4 && <ArrowRight className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              {/* Readiness bar */}
              <div className="bg-[#0A0E18] rounded-xl border border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">Workflow ready — 92% readiness score</p>
                    <p className="text-xs text-white/40">Cost tier: Medium · Performance: Best-in-class · Speed: Moderate</p>
                  </div>
                </div>
                <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Deploy</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section id="results" className="py-16 px-6 border-y border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-indigo-400 mb-1">{s.value}</p>
              <p className="text-sm text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Five steps to a production agent</h2>
            <p className="text-white/50 max-w-xl mx-auto">CortexOS guides you through the full agentic workflow — from blank slate to deployed intelligence.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            {steps.map((s, i) => (
              <div key={i} className="flex-1 relative">
                <div className="bg-[#0F1420] rounded-xl border border-white/10 p-5 h-full hover:border-white/20 transition-all">
                  <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
                    <span className="text-xs font-bold text-white">{s.n}</span>
                  </div>
                  <h3 className="font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-white/20" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-[#0A0E18]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Everything you need, nothing you don't</h2>
            <p className="text-white/50 max-w-xl mx-auto">CortexOS is purpose-built for enterprise agentic AI — not a general-purpose tool bolted with AI features.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-[#0F1420] rounded-xl border border-white/10 p-6 hover:border-indigo-500/40 hover:bg-[#111827] transition-all group">
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-all">
                  <f.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to deploy your first agent?</h2>
          <p className="text-white/50 mb-10 text-lg">Join enterprises running production-grade agentic AI with CortexOS.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {['No setup fees', 'Deploy in minutes', 'SOC 2 certified', 'Dedicated support'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                <CheckCircle className="w-4 h-4 text-indigo-400" />
                {item}
              </div>
            ))}
          </div>
          <Link to="/cortex-builder">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white h-13 px-10 rounded-xl text-base font-semibold shadow-lg shadow-indigo-600/30">
              Start Building Free <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Cpu className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm text-white">CortexOS</span>
          </div>
          <p className="text-xs text-white/30">© 2026 CortexOS. Agentic AI Platform for the Enterprise.</p>
          <div className="flex gap-4 text-sm text-white/40">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}