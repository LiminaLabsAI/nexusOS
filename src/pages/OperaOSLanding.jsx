import { Link } from 'react-router-dom';
import { Zap, ArrowRight, CheckCircle, BarChart3, Shield, Brain, Workflow, Database, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Brain, title: 'AI Anomaly Detection', description: 'Automatically detect anomalies across all your enterprise data streams in real time.' },
  { icon: BarChart3, title: 'KPI Intelligence', description: 'Track every critical metric across manufacturing, logistics, finance, and more.' },
  { icon: Bell, title: 'Smart Alerts', description: 'Get ranked, context-aware alerts with root cause analysis before issues escalate.' },
  { icon: Workflow, title: 'Recommendation Engine', description: 'AI-generated action plans with confidence scores and alternative strategies.' },
  { icon: Database, title: 'Data Source Hub', description: 'Connect ERPs, CRMs, IoT, databases, and APIs — all in one unified platform.' },
  { icon: Shield, title: 'Role-Based Access', description: 'Granular permissions for admins, analysts, operators, and viewers.' },
];

const stats = [
  { value: '94%', label: 'Faster issue detection' },
  { value: '$2.4M', label: 'Avg. cost savings / year' },
  { value: '3.2x', label: 'ROI within 6 months' },
  { value: '99.9%', label: 'Platform uptime' },
];

export default function OperaOSLanding() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">OperaOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#results" className="hover:text-indigo-600 transition-colors">Results</a>
            <a href="#customers" className="hover:text-indigo-600 transition-colors">Customers</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/builder">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 h-9 rounded-lg">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-10 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <Zap className="w-3 h-3" />
            AI-Native Enterprise Operating System
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
            Enterprise Intelligence,{' '}
            <span className="text-indigo-600">Automated</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            OperaOS is the AI brain for your enterprise. It detects anomalies, diagnoses root causes, forecasts outcomes, and delivers ranked recommendations — before your team even knows there's a problem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Link to="/builder">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 rounded-lg text-sm font-semibold">
                Start Building Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="h-11 px-6 rounded-lg text-sm font-semibold border-slate-200 text-slate-700">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-400">No credit card required · Enterprise SSO available · SOC 2 Type II certified</p>
        </div>

        {/* Hero Screenshot */}
        <div className="max-w-4xl mx-auto mt-14">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs font-medium text-slate-500">Command Center — operaos.app</span>
            </div>
            <div className="p-6 bg-[#F8FAFC]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'OEE', value: '71.4%', delta: '-4.8pp', color: 'text-red-500' },
                  { label: 'OTD RATE', value: '87.3%', delta: '-4.8pp', color: 'text-red-500' },
                  { label: 'REVENUE YTD', value: '$142.7M', delta: '+8.8%', color: 'text-green-600' },
                  { label: 'NPS SCORE', value: '42 pts', delta: '+3 pts', color: 'text-green-600' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1">{kpi.label}</p>
                    <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
                    <p className={`text-xs font-medium ${kpi.color}`}>{kpi.delta}</p>
                  </div>
                ))}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <Bell className="w-3 h-3 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-700">Critical: Logistics SLA Breach Imminent</p>
                    <p className="text-xs text-slate-500">On-Time Delivery dropped to 87.3% — $2.1M SLA penalty exposure. AI Confidence: 88%</p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-md">critical</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="results" className="py-16 px-6 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-indigo-600 mb-1">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything your enterprise needs</h2>
            <p className="text-slate-500 max-w-xl mx-auto">From raw data to executed decisions — OperaOS handles the full intelligence lifecycle.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="customers" className="py-20 px-6 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Trusted by enterprise leaders</h2>
          <p className="text-indigo-200 mb-8">Join hundreds of enterprises that run smarter operations with OperaOS.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            {['No setup fees', 'Deploy in days', 'Dedicated support', 'SOC 2 certified'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white">
                <CheckCircle className="w-4 h-4 text-indigo-300" />
                {item}
              </div>
            ))}
          </div>
          <Link to="/builder">
            <Button className="bg-white text-indigo-700 hover:bg-indigo-50 h-12 px-8 rounded-lg text-sm font-semibold">
              Start Building Your OS <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-900">OperaOS</span>
          </div>
          <p className="text-xs text-slate-400">© 2026 OperaOS. Enterprise Intelligence Platform.</p>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link to="/login" className="hover:text-slate-900">Sign In</Link>
            <Link to="/register" className="hover:text-slate-900">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}