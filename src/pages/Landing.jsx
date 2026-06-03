import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, Brain, TrendingUp, Shield, ArrowRight, ChevronRight,
  BarChart3, Bell, Lightbulb, FlaskConical, Bot, Database,
  CheckCircle, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const features = [
  { icon: Brain, title: 'Agentic Intelligence', description: 'Multi-agent AI system detects anomalies, diagnoses root causes, and generates ranked action recommendations autonomously.' },
  { icon: BarChart3, title: 'Unified Command Center', description: 'Real-time KPI monitoring across manufacturing, logistics, retail, finance, HR, and operations in one view.' },
  { icon: Bell, title: 'Predictive Alerting', description: 'AI-powered anomaly detection with causal reasoning — know about problems before they impact the business.' },
  { icon: Lightbulb, title: 'Decision Intelligence', description: 'Every recommendation comes with confidence scores, execution steps, risk flags, and alternative approaches.' },
  { icon: FlaskConical, title: 'Simulation Lab', description: "Run what-if scenarios powered by AI forecasting. Model outcomes before committing to a course of action." },
  { icon: Database, title: 'Enterprise Data Fabric', description: 'Connect SAP, Oracle, Salesforce, IoT, and any API. Unified data layer across your entire enterprise stack.' },
];

const stats = [
  { value: '87%', label: 'Faster decision cycles' },
  { value: '3.2x', label: 'ROI in Year 1' },
  { value: '94%', label: 'Anomaly detection accuracy' },
  { value: '<2min', label: 'Mean time to insight' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'COO, Global Manufacturing Co.', quote: 'NexusOS identified a $2.1M logistics SLA risk 3 weeks before it would have triggered. That single alert paid for 18 months of the platform.' },
  { name: 'Marcus Webb', role: 'CFO, Retail Group', quote: 'The AI recommendations aren\'t vague suggestions — they come with execution steps, confidence scores, and financial impact estimates. My team actually uses them.' },
  { name: 'Dr. Priya Mehta', role: 'VP Operations, Industrial Corp', quote: 'We replaced 4 BI dashboards and a weekly analyst report with NexusOS. The signal-to-noise ratio is completely different.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">NEXUS<span className="text-primary">OS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Results</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Customers</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gap-1.5">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="mb-6 text-primary border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium">
              <Zap className="w-3 h-3 mr-1.5" /> AI-Native Enterprise Operating System
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-display tracking-tight leading-[1.05] mb-6"
          >
            Enterprise Intelligence,{' '}
            <span className="text-primary">Automated</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            NexusOS is the AI brain for your enterprise. It detects anomalies, diagnoses root causes, forecasts outcomes, and delivers ranked recommendations — before your team even knows there's a problem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button size="lg" className="h-12 px-8 text-base gap-2 glow-blue">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Sign In to Dashboard
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted-foreground mt-4"
          >
            No credit card required · Enterprise SSO available · SOC 2 Type II certified
          </motion.p>
        </div>

        {/* Mock Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto mt-16 relative"
        >
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl">
            <div className="bg-secondary/50 p-3 flex items-center gap-2 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-xs text-muted-foreground mx-auto font-mono">nexusos.app — Command Center</span>
            </div>
            <div className="p-6 grid grid-cols-4 gap-3">
              {[
                { label: 'OEE', value: '71.4%', status: 'warning', change: '-4.8pp' },
                { label: 'OTD Rate', value: '87.3%', status: 'critical', change: '-4.8pp' },
                { label: 'Revenue YTD', value: '$142.7M', status: 'healthy', change: '+8.8%' },
                { label: 'NPS Score', value: '42 pts', status: 'healthy', change: '+3 pts' },
              ].map((kpi, i) => (
                <div key={i} className={`rounded-lg p-3 border-l-2 bg-secondary/30 ${kpi.status === 'critical' ? 'border-l-red-500' : kpi.status === 'warning' ? 'border-l-amber-400' : 'border-l-emerald-500'}`}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-lg font-bold font-display mt-0.5">{kpi.value}</p>
                  <p className={`text-[10px] font-medium ${kpi.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>{kpi.change}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3 flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-3 h-3 text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-400">Critical: Logistics SLA Breach Imminent</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">On-Time Delivery dropped to 87.3% — $2.1M SLA penalty exposure · AI Confidence: 88%</p>
                </div>
                <Badge className="text-[10px] bg-red-500/20 text-red-400 ml-auto flex-shrink-0">critical</Badge>
              </div>
            </div>
          </div>
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        </motion.div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 px-6 border-y border-border/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-bold font-display text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display tracking-tight">Everything your enterprise needs</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">From raw data to executed decisions — NexusOS handles the full intelligence lifecycle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display tracking-tight">Trusted by enterprise leaders</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border/50 bg-card"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, si) => <Star key={si} className="w-4 h-4 fill-primary text-primary" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-6">
              Ready to run your enterprise on intelligence?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">Start your free trial today. No data migration required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="h-12 px-10 text-base gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-12 px-10 text-base">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
              {['No credit card required', 'SOC 2 certified', 'Enterprise SSO', '99.9% SLA'].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-semibold">NEXUS<span className="text-primary">OS</span></span>
          </div>
          <p>© 2026 NexusOS. Enterprise Intelligence Platform.</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}