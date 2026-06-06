import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Lightbulb, Check, X, Play, ChevronDown, ChevronUp,
  DollarSign, AlertTriangle, Sparkles, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getPersonaConfig, filterByPersona } from '@/lib/personaConfig';

const priorityColors = {
  critical: 'border-red-500/30 text-red-400',
  high:     'border-amber-400/30 text-amber-300',
  medium:   'border-blue-400/30 text-blue-300',
  low:      'border-muted-foreground/30 text-muted-foreground',
};

const statusColors = {
  pending:   'bg-amber-400/20 text-amber-300',
  approved:  'bg-blue-500/20 text-blue-400',
  rejected:  'bg-red-500/20 text-red-400',
  executing: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  failed:    'bg-red-500/20 text-red-400',
};

export default function Recommendations() {
  const { persona } = useOutletContext() || {};
  const config = getPersonaConfig(persona);

  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [outcomeNotes, setOutcomeNotes] = useState({});
  const queryClient = useQueryClient();

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => base44.entities.Recommendation.list('-created_date', 100),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Recommendation.update(id, data),
    onSuccess: (_, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      base44.entities.AgentLog.create({
        agent_type: data.status === 'executing' ? 'execution' : 'learning',
        action: `Recommendation ${data.status}: ${recommendations.find(r => r.id === id)?.title}`,
        status: 'completed',
        related_entity_id: id,
      });
    },
  });

  // Domain filter first
  const domainFiltered = filterByPersona(recommendations, persona);

  const filtered = domainFiltered.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  // Summary stats
  const totalImpact = domainFiltered.reduce((sum, r) => sum + (r.financial_impact || 0), 0);
  const pendingCount = domainFiltered.filter(r => r.status === 'pending').length;

  // Admin grouping
  const isAdmin = persona === 'administrator';
  const adminRecGroups = config.recGroups || [];
  const adminGrouped = isAdmin
    ? adminRecGroups.map(g => ({ ...g, items: filtered.filter(g.filter) })).filter(g => g.items.length > 0)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Recommendations</h1>
        <p className="text-sm text-muted-foreground mt-1">{isAdmin ? 'Platform-wide recommendation governance — approve, track, and close the loop' : 'AI-generated action recommendations with execution tracking'}</p>
      </div>

      {/* Persona summary bar */}
      <div className={cn("px-4 py-3 rounded-lg bg-gradient-to-r border border-border/30 flex items-center gap-6 flex-wrap", config.bannerColor)}>
        <div className="text-xs">
          <span className="font-medium text-foreground">{config.label} view</span>
          {config.domains.length > 0 && (
            <span className="text-muted-foreground ml-2">
              — {config.domains.map(d => <Badge key={d} variant="outline" className="text-[10px] mr-1 capitalize">{d}</Badge>)}
            </span>
          )}
        </div>
        <div className="flex gap-4 ml-auto text-xs">
          {config.showFinancialImpact && totalImpact > 0 && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <DollarSign className="w-3 h-3" />{totalImpact.toLocaleString()} est. impact
            </span>
          )}
          <span className="text-amber-300 font-semibold">{pendingCount} pending</span>
          <span className="text-muted-foreground">{domainFiltered.length} total</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="executing">Executing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Admin grouped view */}
      {isAdmin && adminGrouped && (
        <div className="space-y-8">
          {adminGrouped.map((group) => (
            <div key={group.key}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-3 h-px bg-amber-400/50 inline-block" />{group.label}
                <Badge variant="outline" className="text-[9px] ml-auto">{group.items.length}</Badge>
              </p>
              <div className="space-y-3">
                {group.items.map((rec, i) => <RecCard key={rec.id} rec={rec} i={i} config={config} updateMutation={updateMutation} recommendations={recommendations} outcomeNotes={outcomeNotes} setOutcomeNotes={setOutcomeNotes} />)}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No recommendations yet. Run AI Analysis from the Intelligence Feed.</p>
            </div>
          )}
        </div>
      )}

      {/* Standard view */}
      {!isAdmin && <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((rec, i) => {
            const isExpanded = expandedId === rec.id;
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl border border-border/50 overflow-hidden"
              >
                <div
                  className="p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold">{rec.title}</h3>
                        {rec.priority && (
                          <Badge variant="outline" className={cn("text-[10px]", priorityColors[rec.priority])}>
                            {rec.priority}
                          </Badge>
                        )}
                        <Badge className={cn("text-[10px]", statusColors[rec.status])}>
                          {rec.status}
                        </Badge>
                        {rec.confidence_score && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Sparkles className="w-2.5 h-2.5" />{rec.confidence_score}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{rec.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {config.showFinancialImpact && rec.financial_impact > 0 && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                            <DollarSign className="w-3 h-3" />{rec.financial_impact.toLocaleString()} est. impact
                          </span>
                        )}
                        {rec.domain && <Badge variant="outline" className="text-[10px] capitalize">{rec.domain}</Badge>}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/30 overflow-hidden"
                    >
                      <div className="p-5 space-y-4 bg-secondary/10">
                        {rec.reasoning && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">AI Reasoning</p>
                            <p className="text-sm">{rec.reasoning}</p>
                          </div>
                        )}

                        {config.showExecutionSteps && rec.execution_steps?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Execution Steps</p>
                            <ol className="space-y-2">
                              {rec.execution_steps.map((step, si) => (
                                <li key={si} className="flex items-start gap-2 text-sm">
                                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {si + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {config.showRiskFlags && rec.risk_flags?.length > 0 && (
                          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                            <p className="text-xs font-medium text-red-400 mb-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Risk Flags
                            </p>
                            <ul className="text-xs text-red-300 space-y-1">
                              {rec.risk_flags.map((flag, fi) => (
                                <li key={fi}>• {flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {config.showAlternatives && rec.alternatives?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Alternatives</p>
                            <div className="space-y-2">
                              {rec.alternatives.map((alt, ai) => (
                                <div key={ai} className="p-3 bg-secondary/30 rounded-lg">
                                  <p className="text-xs font-semibold">{alt.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{alt.description}</p>
                                  {alt.trade_off && <p className="text-[10px] text-amber-300 mt-1">Trade-off: {alt.trade_off}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 flex-wrap">
                          {rec.status === 'pending' && (
                            <>
                              <Button size="sm" className="h-8 text-xs gap-1"
                                onClick={() => updateMutation.mutate({ id: rec.id, data: { status: 'approved' } })}>
                                <Check className="w-3 h-3" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="h-8 text-xs gap-1"
                                onClick={() => updateMutation.mutate({ id: rec.id, data: { status: 'rejected' } })}>
                                <X className="w-3 h-3" /> Reject
                              </Button>
                            </>
                          )}
                          {rec.status === 'approved' && (
                            <Button size="sm" className="h-8 text-xs gap-1"
                              onClick={() => updateMutation.mutate({ id: rec.id, data: { status: 'executing' } })}>
                              <Play className="w-3 h-3" /> Execute
                            </Button>
                          )}
                          {rec.status === 'executing' && (
                            <div className="flex-1 space-y-2">
                              <Textarea
                                placeholder="Record outcome notes..."
                                value={outcomeNotes[rec.id] || ''}
                                onChange={(e) => setOutcomeNotes({ ...outcomeNotes, [rec.id]: e.target.value })}
                                className="text-xs h-16"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => updateMutation.mutate({ id: rec.id, data: { status: 'completed', outcome_success: true, outcome_notes: outcomeNotes[rec.id] } })}>
                                  Successful
                                </Button>
                                <Button size="sm" variant="destructive" className="h-7 text-xs gap-1"
                                  onClick={() => updateMutation.mutate({ id: rec.id, data: { status: 'failed', outcome_success: false, outcome_notes: outcomeNotes[rec.id] } })}>
                                  Failed
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No recommendations for your domain yet. Run AI Analysis from the Intelligence Feed.</p>
          </div>
        )}
      </div>}
    </div>
  );
}

function RecCard({ rec, i, config, updateMutation, recommendations, outcomeNotes, setOutcomeNotes }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.03 }}
      className="bg-card rounded-xl border border-border/50 overflow-hidden"
    >
      <div className="p-5 cursor-pointer hover:bg-secondary/20 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold">{rec.title}</h3>
              {rec.priority && (
                <Badge variant="outline" className={cn("text-[10px]", priorityColors[rec.priority])}>{rec.priority}</Badge>
              )}
              <Badge className={cn("text-[10px]", statusColors[rec.status])}>{rec.status}</Badge>
              {rec.confidence_score && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Sparkles className="w-2.5 h-2.5" />{rec.confidence_score}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{rec.description}</p>
            <div className="flex items-center gap-3 mt-2">
              {config.showFinancialImpact && rec.financial_impact > 0 && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <DollarSign className="w-3 h-3" />{rec.financial_impact.toLocaleString()} est. impact
                </span>
              )}
              {rec.domain && <Badge variant="outline" className="text-[10px] capitalize">{rec.domain}</Badge>}
            </div>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/30 overflow-hidden"
          >
            <div className="p-5 space-y-4 bg-secondary/10">
              {rec.reasoning && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">AI Reasoning</p>
                  <p className="text-sm">{rec.reasoning}</p>
                </div>
              )}
              {config.showExecutionSteps && rec.execution_steps?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Execution Steps</p>
                  <ol className="space-y-2">
                    {rec.execution_steps.map((step, si) => (
                      <li key={si} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">{si + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {config.showRiskFlags && rec.risk_flags?.length > 0 && (
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <p className="text-xs font-medium text-red-400 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Risk Flags
                  </p>
                  <ul className="text-xs text-red-300 space-y-1">
                    {rec.risk_flags.map((flag, fi) => <li key={fi}>• {flag}</li>)}
                  </ul>
                </div>
              )}
              {config.showAlternatives && rec.alternatives?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Alternatives</p>
                  <div className="space-y-2">
                    {rec.alternatives.map((alt, ai) => (
                      <div key={ai} className="p-3 bg-secondary/30 rounded-lg">
                        <p className="text-xs font-semibold">{alt.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alt.description}</p>
                        {alt.trade_off && <p className="text-[10px] text-amber-300 mt-1">Trade-off: {alt.trade_off}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                {rec.status === 'pending' && (
                  <>
                    <Button size="sm" className="h-8 text-xs gap-1"
                      onClick={() => updateMutation.mutate({ id: rec.id, data: { status: 'approved' } })}>
                      <Check className="w-3 h-3" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="h-8 text-xs gap-1"
                      onClick={() => updateMutation.mutate({ id: rec.id, data: { status: 'rejected' } })}>
                      <X className="w-3 h-3" /> Reject
                    </Button>
                  </>
                )}
                {rec.status === 'approved' && (
                  <Button size="sm" className="h-8 text-xs gap-1"
                    onClick={() => updateMutation.mutate({ id: rec.id, data: { status: 'executing' } })}>
                    <Play className="w-3 h-3" /> Execute
                  </Button>
                )}
                {rec.status === 'executing' && (
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Record outcome notes..."
                      value={outcomeNotes[rec.id] || ''}
                      onChange={(e) => setOutcomeNotes({ ...outcomeNotes, [rec.id]: e.target.value })}
                      className="text-xs h-16"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => updateMutation.mutate({ id: rec.id, data: { status: 'completed', outcome_success: true, outcome_notes: outcomeNotes[rec.id] } })}>
                        Successful
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs gap-1"
                        onClick={() => updateMutation.mutate({ id: rec.id, data: { status: 'failed', outcome_success: false, outcome_notes: outcomeNotes[rec.id] } })}>
                        Failed
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}