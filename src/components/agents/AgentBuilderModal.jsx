import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot, Search, Crosshair, TrendingUp, Lightbulb, Play, GraduationCap,
  Puzzle, ArrowRight, Check, LayoutTemplate, Wand2, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AGENT_TEMPLATES } from './agentTemplates';

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

// Step 0: choose mode
function ModeStep({ onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
        onClick={() => onSelect('template')}
        className="text-left p-5 rounded-xl border border-border/50 bg-indigo-500/10 hover:border-indigo-500/50 hover:bg-indigo-500/15 transition-all group"
      >
        <LayoutTemplate className="w-6 h-6 text-indigo-400 mb-3" />
        <p className="text-sm font-semibold">Start from a Template</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          Choose from pre-built agent workflows for common enterprise use cases like demand forecasting or supply chain diagnosis.
        </p>
        <div className="mt-3 flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
          {AGENT_TEMPLATES.length} templates available <ArrowRight className="w-3 h-3" />
        </div>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        onClick={() => onSelect('scratch')}
        className="text-left p-5 rounded-xl border border-border/50 bg-secondary/30 hover:border-border hover:bg-secondary/50 transition-all group"
      >
        <Wand2 className="w-6 h-6 text-primary mb-3" />
        <p className="text-sm font-semibold">Build from Scratch</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          Select the agent type you need and configure it completely from scratch with full control over its behaviour.
        </p>
        <div className="mt-3 flex items-center gap-1 text-[11px] text-primary font-medium">
          {builderAgentTypes.length} agent types <ArrowRight className="w-3 h-3" />
        </div>
      </motion.button>
    </div>
  );
}

// Step 1a: template picker
function TemplateStep({ selected, onSelect }) {
  return (
    <ScrollArea className="h-[420px] pr-2">
      <div className="grid grid-cols-2 gap-3 mt-1">
        {AGENT_TEMPLATES.map((tpl, i) => {
          const Icon = tpl.icon;
          const isSelected = selected === tpl.key;
          return (
            <motion.button
              key={tpl.key}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(tpl.key)}
              className={cn(
                "relative text-left p-4 rounded-xl border transition-all",
                tpl.bg,
                isSelected ? `${tpl.border} ring-2 ring-offset-1 ring-offset-background` : "border-border/40 hover:border-border"
              )}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
              <Icon className={cn("w-5 h-5 mb-2", tpl.color)} />
              <p className="text-xs font-semibold">{tpl.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mb-2">{tpl.domain}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{tpl.desc}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {tpl.agents.map(a => (
                  <Badge key={a} variant="outline" className="text-[9px] px-1.5 py-0">{a}</Badge>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// Step 1b: scratch agent type picker
function ScratchStep({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-1">
      {builderAgentTypes.map((agent, i) => {
        const Icon = agent.icon;
        const isSelected = selected === agent.key;
        return (
          <motion.button
            key={agent.key}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(agent.key)}
            className={cn(
              "relative text-left p-4 rounded-xl border transition-all",
              agent.bg,
              isSelected ? `${agent.border} ring-2 ring-offset-1 ring-offset-background` : "border-border/40 hover:border-border"
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
  );
}

export default function AgentBuilderModal({ open, onOpenChange }) {
  const [mode, setMode] = useState(null); // null | 'template' | 'scratch'
  const [selected, setSelected] = useState(null);

  const reset = () => { setMode(null); setSelected(null); };

  const handleContinue = () => {
    if (!selected) return;
    window.open('https://weightless-cortex-os-core.base44.app/agents', '_blank');
    onOpenChange(false);
    reset();
  };

  const handleClose = (v) => {
    onOpenChange(v);
    if (!v) reset();
  };

  const subtitle = !mode
    ? 'No code required — configure, connect, and deploy in minutes.'
    : mode === 'template'
    ? 'Select a pre-built template to get started quickly.'
    : 'Select the agent type you want to build.';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {mode && (
              <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <DialogTitle className="text-lg font-bold">Build an AI Agent</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!mode && (
            <motion.div key="mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ModeStep onSelect={setMode} />
            </motion.div>
          )}
          {mode === 'template' && (
            <motion.div key="template" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TemplateStep selected={selected} onSelect={setSelected} />
            </motion.div>
          )}
          {mode === 'scratch' && (
            <motion.div key="scratch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScratchStep selected={selected} onSelect={setSelected} />
            </motion.div>
          )}
        </AnimatePresence>

        {mode && (
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button disabled={!selected} onClick={handleContinue} className="gap-1.5">
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}