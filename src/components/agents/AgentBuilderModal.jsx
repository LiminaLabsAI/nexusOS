import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot, Search, Crosshair, TrendingUp, Lightbulb, Play, GraduationCap,
  Puzzle, ArrowRight, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const builderAgentTypes = [
  { key: 'orchestrator', label: 'Orchestrator', icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', desc: 'Master agent that coordinates all sub-agents and routes tasks intelligently.' },
  { key: 'detection', label: 'Detection', icon: Search, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', desc: 'Monitors data streams in real-time and triggers alerts on anomalies.' },
  { key: 'diagnosis', label: 'Diagnosis', icon: Crosshair, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', desc: 'Performs root cause analysis using causal reasoning and historical patterns.' },
  { key: 'forecast', label: 'Forecast', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', desc: 'Generates probabilistic forecasts across KPIs, demand, and risk scenarios.' },
  { key: 'recommendation', label: 'Recommendation', icon: Lightbulb, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', desc: 'Produces ranked, context-aware action recommendations with confidence scores.' },
  { key: 'execution', label: 'Execution', icon: Play, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', desc: 'Manages action lifecycle, approvals, and integrations with enterprise systems.' },
  { key: 'learning', label: 'Learning', icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', desc: 'Collects outcomes and continuously improves models from feedback loops.' },
  { key: 'custom', label: 'Bring Your Own Agent', icon: Puzzle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', desc: 'Connect your existing agent or build a fully custom workflow from scratch.' },
];

export default function AgentBuilderModal({ open, onOpenChange }) {
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    window.open('https://weightless-cortex-os-core.base44.app/', '_blank');
    onOpenChange(false);
    setSelected(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSelected(null); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Build an AI Agent</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the type of agent you want to build. No code required — configure, connect, and deploy in minutes.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {builderAgentTypes.map((agent, i) => {
            const Icon = agent.icon;
            const isSelected = selected === agent.key;
            return (
              <motion.button
                key={agent.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(agent.key)}
                className={cn(
                  "relative text-left p-4 rounded-xl border transition-all",
                  agent.bg,
                  isSelected ? `${agent.border} ring-2 ring-offset-1 ring-offset-background ring-current` : "border-border/40 hover:border-border"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
                <Icon className={cn("w-5 h-5 mb-2", agent.color)} />
                <p className="text-sm font-semibold">{agent.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{agent.desc}</p>
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!selected} onClick={handleContinue} className="gap-1.5">
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}