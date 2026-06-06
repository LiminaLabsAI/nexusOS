import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Layers, Database, Cpu, GitBranch, Cloud, Monitor, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const BUILD_STEPS = [
  { id: 'clone',    icon: GitBranch, label: 'Pulling Cube.js semantic engine',          detail: 'cube-js/cube @ latest',           duration: 900 },
  { id: 'schema',   icon: Database,  label: 'Generating data model schema',             detail: 'Building cubes & measures…',       duration: 1100 },
  { id: 'fabric',   icon: Layers,    label: 'Assembling semantic data fabric',          detail: 'Linking joins, dimensions & KPIs…',duration: 1300 },
  { id: 'persist',  icon: Cloud,     label: 'Configuring persistence layer',            detail: 'Initialising store adapter…',       duration: 900 },
  { id: 'preag',    icon: Cpu,       label: 'Scheduling pre-aggregations',              detail: 'Partitioning rollup strategy…',     duration: 1000 },
  { id: 'done',     icon: Sparkles,  label: 'Semantic layer ready',                    detail: 'All systems connected ✓',           duration: 0 },
];

function storageLabel(persistence) {
  if (persistence.location === 'local') return 'Local (~/.cube/store)';
  const pLabel = persistence.provider?.toUpperCase() || 'Cloud';
  const region = persistence.region ? ` · ${persistence.region}` : '';
  return `${pLabel}${region}`;
}

export default function CubeFabricModal({ open, onClose, layerName, persistence, entities, sources }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!open) { setCurrentStep(0); setCompleted(false); return; }

    let i = 0;
    let timeout;

    const advance = () => {
      if (i >= BUILD_STEPS.length - 1) { setCompleted(true); return; }
      const dur = BUILD_STEPS[i].duration;
      timeout = setTimeout(() => {
        i++;
        setCurrentStep(i);
        advance();
      }, dur);
    };

    advance();
    return () => clearTimeout(timeout);
  }, [open]);

  const progress = Math.round((currentStep / (BUILD_STEPS.length - 1)) * 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Building Semantic Data Fabric
          </DialogTitle>
        </DialogHeader>

        {/* Layer info */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{layerName}</p>
            <p className="text-[11px] text-muted-foreground">{entities?.length} entities · {sources?.length} sources · {storageLabel(persistence)}</p>
          </div>
          <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] flex items-center gap-1">
            <GitBranch className="w-3 h-3" /> cube-js/cube
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Building fabric…</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Steps */}
        <div className="space-y-1.5">
          {BUILD_STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < currentStep;
            const active = i === currentStep && !completed;
            const isDone = completed && i === BUILD_STEPS.length - 1;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: done || active || isDone ? 1 : 0.35 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active && "bg-primary/5 border border-primary/20",
                  done && "text-muted-foreground",
                  isDone && "bg-emerald-500/10 border border-emerald-500/20"
                )}
              >
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                  done ? "bg-primary/15" : active ? "bg-primary/20" : isDone ? "bg-emerald-500/20" : "bg-muted"
                )}>
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  ) : active ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  ) : isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn("font-medium", isDone && "text-emerald-400")}>{s.label}</span>
                  {(active || isDone) && (
                    <p className="text-[10px] text-muted-foreground">{s.detail}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Completion footer */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Entities', value: entities?.length ?? 0, color: 'text-primary' },
                  { label: 'Sources', value: sources?.length ?? 0, color: 'text-accent' },
                  { label: 'Cubes Built', value: entities?.length ?? 0, color: 'text-emerald-400' },
                ].map(stat => (
                  <div key={stat.label} className="bg-secondary/60 rounded-lg py-2 px-3">
                    <p className={cn("text-lg font-bold font-display", stat.color)}>{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onClose}>
                  <CheckCircle2 className="w-4 h-4" /> Done
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs" asChild>
                  <a href="https://github.com/cube-js/cube" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" /> Cube.js Docs
                  </a>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}