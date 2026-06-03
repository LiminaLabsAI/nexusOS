import React from 'react';
import { Search, Crosshair, TrendingUp, Lightbulb, Play, GraduationCap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const stages = [
  { key: 'detect', label: 'Detect', icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'diagnose', label: 'Diagnose', icon: Crosshair, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { key: 'forecast', label: 'Forecast', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { key: 'recommend', label: 'Recommend', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'execute', label: 'Execute', icon: Play, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { key: 'learn', label: 'Learn', icon: GraduationCap, color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

export default function DecisionPipeline({ alerts = [], recommendations = [] }) {
  const counts = {
    detect: alerts.filter(a => a.status === 'new').length,
    diagnose: alerts.filter(a => a.status === 'investigating').length,
    forecast: alerts.filter(a => a.status === 'acknowledged').length,
    recommend: recommendations.filter(r => r.status === 'pending').length,
    execute: recommendations.filter(r => r.status === 'executing').length,
    learn: recommendations.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5">
      <h3 className="font-semibold text-sm mb-4">Decision Pipeline</h3>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {stages.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <React.Fragment key={stage.key}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg flex-1 min-w-[80px]",
                  stage.bg
                )}
              >
                <Icon className={cn("w-4 h-4 mb-1", stage.color)} />
                <span className="text-[10px] font-medium text-muted-foreground">{stage.label}</span>
                <span className={cn("text-xl font-bold font-display mt-1", stage.color)}>
                  {counts[stage.key]}
                </span>
              </motion.div>
              {i < stages.length - 1 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}