import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Loader2, ArrowRight, CheckCircle2,
  Bot, Search, Crosshair, TrendingUp, Lightbulb, Play, GraduationCap
} from 'lucide-react';

const agentTypes = [
  { key: 'orchestrator', label: 'Orchestrator', icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', desc: 'Master agent that coordinates all sub-agents' },
  { key: 'detection', label: 'Detection', icon: Search, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', desc: 'Monitors KPI streams and triggers anomaly alerts' },
  { key: 'diagnosis', label: 'Diagnosis', icon: Crosshair, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', desc: 'Performs root cause analysis using causal reasoning' },
  { key: 'forecast', label: 'Forecast', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', desc: 'Generates probabilistic forecasts and what-if models' },
  { key: 'recommendation', label: 'Recommendation', icon: Lightbulb, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', desc: 'Produces ranked action recommendations' },
  { key: 'execution', label: 'Execution', icon: Play, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', desc: 'Manages action lifecycle and integrations' },
  { key: 'learning', label: 'Learning', icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', desc: 'Collects outcomes and improves models over time' },
];

export default function GoalSetup({ onConfirm }) {
  const [goal, setGoal] = useState('');
  const [suggestedAgents, setSuggestedAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [goalConfirmed, setGoalConfirmed] = useState(false);

  const getSuggestions = async () => {
    if (!goal.trim()) return;
    setLoadingSuggestions(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a NexusOS workflow architect. A user has described their workflow outcome goal:

"${goal}"

Based on this goal, recommend the most relevant AI agent types to include in their workflow from this list:
- orchestrator: Master agent that coordinates all sub-agents
- detection: Monitors KPI streams and triggers anomaly alerts
- diagnosis: Performs root cause analysis using causal reasoning
- forecast: Generates probabilistic forecasts and what-if models
- recommendation: Produces ranked action recommendations
- execution: Manages action lifecycle and integrations
- learning: Collects outcomes and improves models over time

Return only the agent keys that are relevant to this goal, and a one-sentence rationale for each.`,
      response_json_schema: {
        type: 'object',
        properties: {
          agents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                rationale: { type: 'string' },
              }
            }
          }
        }
      }
    });
    setSuggestedAgents(result.agents || []);
    setSelectedAgents((result.agents || []).map(a => a.key));
    setLoadingSuggestions(false);
  };

  const toggleAgent = (key) => {
    setSelectedAgents(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const confirmGoal = () => {
    setGoalConfirmed(true);
    onConfirm({ goal, selectedAgents });
  };

  return (
    <div className="space-y-5">
      {/* Goal Input */}
      <div className="bg-card rounded-xl border border-primary/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Define Your Workflow Goal</h3>
            <p className="text-xs text-muted-foreground">Describe the outcome you want from this agentic workflow</p>
          </div>
        </div>
        <Textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Identify supply chain disruption risks and generate prioritised mitigation actions for our COO before the Q4 peak season..."
          className="text-sm resize-none h-24 mb-3"
          disabled={goalConfirmed}
        />
        {!suggestedAgents.length && !goalConfirmed && (
          <Button
            onClick={getSuggestions}
            disabled={!goal.trim() || loadingSuggestions}
            className="gap-2 w-full sm:w-auto"
          >
            {loadingSuggestions
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analysing goal…</>
              : <><ArrowRight className="w-3.5 h-3.5" /> Recommend AI Agents</>
            }
          </Button>
        )}
      </div>

      {/* Agent Selection */}
      <AnimatePresence>
        {suggestedAgents.length > 0 && !goalConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border/50 p-5 space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-0.5">Recommended AI Agents</h3>
              <p className="text-xs text-muted-foreground">Select the agents to include in your workflow. Toggle to customise.</p>
            </div>
            <div className="space-y-2">
              {agentTypes.map((agent) => {
                const suggestion = suggestedAgents.find(s => s.key === agent.key);
                const isSelected = selectedAgents.includes(agent.key);
                const Icon = agent.icon;
                return (
                  <button
                    key={agent.key}
                    onClick={() => toggleAgent(agent.key)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                      isSelected
                        ? `${agent.bg} ${agent.border}`
                        : 'border-border/30 bg-secondary/10 opacity-50 hover:opacity-75',
                      !suggestion && 'opacity-30 cursor-default'
                    )}
                    disabled={!suggestion}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', agent.bg)}>
                      <Icon className={cn('w-4 h-4', agent.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold">{agent.label}</span>
                        {suggestion && isSelected && (
                          <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400 border-0">Recommended</Badge>
                        )}
                        {!suggestion && (
                          <Badge variant="outline" className="text-[9px] text-muted-foreground">Not needed</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {suggestion ? suggestion.rationale : agent.desc}
                      </p>
                    </div>
                    {suggestion && (
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1',
                        isSelected ? 'border-emerald-500 bg-emerald-500/20' : 'border-border'
                      )}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <Button
              onClick={confirmGoal}
              disabled={selectedAgents.length === 0}
              className="w-full gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Goal & Start Workflow ({selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmed Summary */}
      <AnimatePresence>
        {goalConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-emerald-400 mb-1">Goal Confirmed</p>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{goal}</p>
              <div className="flex flex-wrap gap-1">
                {selectedAgents.map(key => {
                  const agent = agentTypes.find(a => a.key === key);
                  if (!agent) return null;
                  const Icon = agent.icon;
                  return (
                    <span key={key} className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', agent.bg, agent.color)}>
                      <Icon className="w-2.5 h-2.5" /> {agent.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}