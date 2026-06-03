import React from 'react';
import { Factory, Truck, ShoppingBag, DollarSign, Users, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const domainConfig = {
  manufacturing: { icon: Factory, label: 'Manufacturing' },
  logistics: { icon: Truck, label: 'Logistics' },
  retail: { icon: ShoppingBag, label: 'Retail' },
  finance: { icon: DollarSign, label: 'Finance' },
  hr: { icon: Users, label: 'Human Resources' },
  operations: { icon: Cog, label: 'Operations' },
};

function getHealthScore(kpis, domain) {
  const domainKpis = kpis.filter(k => k.domain === domain);
  if (domainKpis.length === 0) return { score: 0, healthy: 0, warning: 0, critical: 0 };
  const healthy = domainKpis.filter(k => k.status === 'healthy').length;
  const warning = domainKpis.filter(k => k.status === 'warning').length;
  const critical = domainKpis.filter(k => k.status === 'critical').length;
  const score = Math.round((healthy * 100 + warning * 60 + critical * 20) / domainKpis.length);
  return { score, healthy, warning, critical, total: domainKpis.length };
}

function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreRing(score) {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 60) return 'stroke-amber-400';
  return 'stroke-red-500';
}

export default function DomainHealth({ kpis = [] }) {
  const domains = Object.keys(domainConfig);

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5">
      <h3 className="font-semibold text-sm mb-4">Domain Health</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {domains.map((domain, i) => {
          const config = domainConfig[domain];
          const health = getHealthScore(kpis, domain);
          const Icon = config.icon;
          const circumference = 2 * Math.PI * 20;
          const offset = circumference - (health.score / 100) * circumference;

          return (
            <motion.div
              key={domain}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-secondary/30 transition-colors"
            >
              <div className="relative w-14 h-14 mb-2">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" className="stroke-secondary" />
                  <circle
                    cx="24" cy="24" r="20" fill="none" strokeWidth="3"
                    className={getScoreRing(health.score)}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <span className="text-xs font-medium text-center">{config.label}</span>
              <span className={cn("text-lg font-bold font-display", getScoreColor(health.score))}>
                {health.score || '—'}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}