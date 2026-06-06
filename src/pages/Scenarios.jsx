import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FlaskConical, Plus, Loader2, Play, Trash2, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AgenticWorkflow from '@/components/scenarios/AgenticWorkflow';
import { getPersonaConfig, filterByPersona, PERSONA_SCENARIO_GROUPS } from '@/lib/personaConfig';

export default function Scenarios() {
  const { persona } = useOutletContext() || {};
  const config = getPersonaConfig(persona);
  const simCfg = config.simulation || {};

  const [activeTab, setActiveTab] = useState('scenarios');
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [simulating, setSimulating] = useState(null);
  const [newScenario, setNewScenario] = useState({
    name: '', description: '', domain: simCfg.defaultDomain || 'manufacturing',
    variables: [{ name: '', current_value: 0, simulated_value: 0, unit: '' }]
  });
  const queryClient = useQueryClient();

  const { data: scenarios = [] } = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => base44.entities.Scenario.list('-created_date', 50),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Scenario.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      setShowCreate(false);
      setNewScenario({ name: '', description: '', domain: 'manufacturing', variables: [{ name: '', current_value: 0, simulated_value: 0, unit: '' }] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Scenario.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scenarios'] }),
  });

  const runSimulation = async (scenario) => {
    setSimulating(scenario.id);
    const variableDesc = scenario.variables?.map(v => 
      `${v.name}: ${v.current_value}${v.unit || ''} → ${v.simulated_value}${v.unit || ''}`
    ).join('\n') || 'No variables specified';

    const focusInstruction = simCfg.promptFocus || 'Be specific with numbers, timelines, and business impact.';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the NexusOS Forecast Agent. Run a what-if simulation for this scenario:

Scenario: ${scenario.name}
Description: ${scenario.description}
Domain: ${scenario.domain}
Variable Changes:
${variableDesc}

Provide detailed simulation results including:
1. Central prediction of what will happen
2. Best case scenario
3. Worst case scenario
4. Confidence level (0-100)

${focusInstruction}`,
      response_json_schema: {
        type: "object",
        properties: {
          results: { type: "string" },
          best_case: { type: "string" },
          worst_case: { type: "string" },
          confidence: { type: "number" }
        }
      }
    });

    await base44.entities.Scenario.update(scenario.id, {
      status: 'completed',
      results: result.results,
      best_case: result.best_case,
      worst_case: result.worst_case,
      confidence: result.confidence,
    });

    await base44.entities.AgentLog.create({
      agent_type: 'forecast',
      action: `Simulation completed: ${scenario.name}`,
      output_summary: result.results?.substring(0, 200),
      status: 'completed',
      confidence: result.confidence,
    });

    queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    queryClient.invalidateQueries({ queryKey: ['agent-logs'] });
    setSimulating(null);
    setExpandedId(scenario.id);
  };

  const addVariable = () => {
    setNewScenario({
      ...newScenario,
      variables: [...newScenario.variables, { name: '', current_value: 0, simulated_value: 0, unit: '' }]
    });
  };

  const updateVariable = (idx, field, value) => {
    const vars = [...newScenario.variables];
    vars[idx] = { ...vars[idx], [field]: field === 'current_value' || field === 'simulated_value' ? Number(value) : value };
    setNewScenario({ ...newScenario, variables: vars });
  };

  const removeVariable = (idx) => {
    setNewScenario({ ...newScenario, variables: newScenario.variables.filter((_, i) => i !== idx) });
  };

  // Filter displayed scenarios by persona's allowed domains (if simulation config restricts)
  const allowedDomains = simCfg.allowedDomains || [];
  const filteredScenarios = allowedDomains.length
    ? scenarios.filter(s => !s.domain || allowedDomains.includes(s.domain))
    : scenarios;

  // Persona-specific grouped preset templates
  const presetGroups = PERSONA_SCENARIO_GROUPS[persona] || null;

  // Launch a preset: pre-fill the create form and open the dialog
  const launchPreset = (template) => {
    setNewScenario({ ...template });
    setShowCreate(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Simulation Lab</h1>
          <p className="text-sm text-muted-foreground mt-1">What-if analysis and scenario modeling</p>
        </div>
        {activeTab === 'scenarios' && (
          <div className="flex items-center gap-2">
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> New Scenario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Scenario</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label className="text-xs">Scenario Name</Label>
                    <Input value={newScenario.name} onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })} placeholder="e.g., Supplier delay impact" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea value={newScenario.description} onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })} placeholder="Describe the scenario..." className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Domain</Label>
                    <Select value={newScenario.domain} onValueChange={(v) => setNewScenario({ ...newScenario, domain: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(allowedDomains.length ? allowedDomains : ['manufacturing','logistics','retail','finance','operations']).map(d => (
                          <SelectItem key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs">Variables</Label>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addVariable}>+ Add Variable</Button>
                    </div>
                    <div className="space-y-3">
                      {newScenario.variables.map((v, i) => (
                        <div key={i} className="p-3 bg-secondary/30 rounded-lg space-y-2">
                          <div className="flex gap-2">
                            <Input placeholder="Variable name" value={v.name} onChange={(e) => updateVariable(i, 'name', e.target.value)} className="text-xs" />
                            <Input placeholder="Unit" value={v.unit} onChange={(e) => updateVariable(i, 'unit', e.target.value)} className="text-xs w-20" />
                            {newScenario.variables.length > 1 && (
                              <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => removeVariable(i)}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <span className="text-[10px] text-muted-foreground">Current</span>
                              <Input type="number" value={v.current_value} onChange={(e) => updateVariable(i, 'current_value', e.target.value)} className="text-xs" />
                            </div>
                            <div className="flex-1">
                              <span className="text-[10px] text-muted-foreground">Simulated</span>
                              <Input type="number" value={v.simulated_value} onChange={(e) => updateVariable(i, 'simulated_value', e.target.value)} className="text-xs" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => createMutation.mutate(newScenario)} disabled={!newScenario.name} className="w-full">
                    Create Scenario
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button className="gap-2" onClick={() => setActiveTab('workflow')}>
              <Zap className="w-4 h-4" /> Agentic Workflow
            </Button>
          </div>
        )}
      </div>

      {/* Persona banner */}
      {simCfg.bannerText && (
        <div className={cn("px-4 py-2.5 rounded-lg bg-gradient-to-r border border-border/30 flex items-center gap-3 flex-wrap text-xs text-muted-foreground", config.bannerColor)}>
          <span className="font-medium text-foreground">{config.label} view:</span>
          <span>{simCfg.bannerText}</span>
          {allowedDomains.length > 0 && (
            <span className="flex gap-1 ml-1">
              {allowedDomains.map(d => (
                <Badge key={d} variant="outline" className="text-[10px] capitalize">{d}</Badge>
              ))}
            </span>
          )}
          <span className="ml-auto">{filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''}</span>
        </div>
      )}

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary/40 p-1 rounded-lg w-fit">
        <button
        onClick={() => setActiveTab('scenarios')}
        className={cn('px-4 py-1.5 text-sm rounded-md transition-all', activeTab === 'scenarios' ? 'bg-card text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground')}
        >
        Active Scenarios
        </button>
        </div>

        {activeTab === 'workflow' && (
          <div>
            <button onClick={() => setActiveTab('scenarios')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
              ← Back to Scenarios
            </button>
            <AgenticWorkflow />
          </div>
        )}

        {activeTab === 'scenarios' && <div className="space-y-6">

        {/* Persona-specific grouped preset scenarios */}
        {presetGroups && (
          <div className="space-y-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recommended Scenarios</p>
            {presetGroups.map((group) => (
              <div key={group.group}>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="w-3 h-px bg-border inline-block" />{group.group}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {group.scenarios.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => launchPreset(template)}
                      className="text-left p-4 rounded-xl border border-border/50 bg-card hover:bg-secondary/30 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-purple-500/20 transition-colors">
                          <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug">{template.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <Badge variant="outline" className="text-[10px] capitalize">{template.domain}</Badge>
                            <Badge variant="outline" className="text-[10px]">{template.variables?.length} vars</Badge>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="border-t border-border/30" />
          </div>
        )}

        {/* Active scenarios from DB */}
        {filteredScenarios.length > 0 && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Active Scenarios</p>
        )}
        <div className="space-y-3">
        {filteredScenarios.map((scenario, i) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-xl border border-border/50 overflow-hidden"
          >
            <div className="p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              onClick={() => setExpandedId(expandedId === scenario.id ? null : scenario.id)}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold">{scenario.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{scenario.domain}</Badge>
                    <Badge className={cn("text-[10px]",
                      scenario.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      scenario.status === 'running' ? 'bg-blue-500/20 text-blue-400' : 'bg-muted text-muted-foreground'
                    )}>{scenario.status}</Badge>
                    {scenario.confidence && (
                      <Badge variant="outline" className="text-[10px]">{scenario.confidence}% confidence</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {scenario.status !== 'completed' && (
                    <Button size="sm" className="h-7 text-xs gap-1" 
                      disabled={simulating === scenario.id}
                      onClick={(e) => { e.stopPropagation(); runSimulation(scenario); }}>
                      {simulating === scenario.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      {simulating === scenario.id ? 'Running...' : 'Simulate'}
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(scenario.id); }}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                  {expandedId === scenario.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === scenario.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border/30 overflow-hidden"
                >
                  <div className="p-5 space-y-4 bg-secondary/10">
                    {simCfg.showVariableDetail !== false && scenario.variables?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Variables</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {scenario.variables.map((v, vi) => (
                            <div key={vi} className="p-2 bg-secondary/30 rounded-lg">
                              <p className="text-[10px] text-muted-foreground">{v.name}</p>
                              <p className="text-xs font-mono">
                                {v.current_value}{v.unit} → <span className="text-primary font-semibold">{v.simulated_value}{v.unit}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {scenario.results && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Simulation Results</p>
                        <p className="text-sm">{scenario.results}</p>
                      </div>
                    )}
                    {simCfg.showBestWorstCase !== false && scenario.best_case && (
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                        <p className="text-xs font-medium text-emerald-400 mb-1">Best Case</p>
                        <p className="text-xs">{scenario.best_case}</p>
                      </div>
                    )}
                    {simCfg.showBestWorstCase !== false && scenario.worst_case && (
                      <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                        <p className="text-xs font-medium text-red-400 mb-1">Worst Case</p>
                        <p className="text-xs">{scenario.worst_case}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {filteredScenarios.length === 0 && !presetGroups && (
          <div className="text-center py-16 text-muted-foreground">
            <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No scenarios yet. Create one to start modeling.</p>
          </div>
        )}
        {filteredScenarios.length === 0 && presetGroups && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-xs">No active scenarios yet — select a template above to get started.</p>
          </div>
        )}
        </div>
      </div>}
    </div>
  );
}