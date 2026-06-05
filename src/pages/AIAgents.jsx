import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, Send, Loader2, CheckCircle, XCircle, Clock,
  Search, Crosshair, TrendingUp, Lightbulb, Play, GraduationCap,
  MessageSquare, Plus, Zap, ArrowRight, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

const agentTypes = [
  { key: 'orchestrator', label: 'Orchestrator', icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Master agent that coordinates all sub-agents' },
  { key: 'detection', label: 'Detection', icon: Search, color: 'text-cyan-400', bg: 'bg-cyan-500/10', desc: 'Monitors KPI streams and triggers anomaly alerts' },
  { key: 'diagnosis', label: 'Diagnosis', icon: Crosshair, color: 'text-purple-400', bg: 'bg-purple-500/10', desc: 'Performs root cause analysis using causal reasoning' },
  { key: 'forecast', label: 'Forecast', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Generates probabilistic forecasts' },
  { key: 'recommendation', label: 'Recommendation', icon: Lightbulb, color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: 'Produces ranked action recommendations' },
  { key: 'execution', label: 'Execution', icon: Play, color: 'text-pink-400', bg: 'bg-pink-500/10', desc: 'Manages action lifecycle and integrations' },
  { key: 'learning', label: 'Learning', icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-500/10', desc: 'Collects outcomes and improves models' },
];

const statusIcons = {
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
};

export default function AIAgents() {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: agentLogs = [] } = useQuery({
    queryKey: ['agent-logs'],
    queryFn: () => base44.entities.AgentLog.list('-created_date', 50),
    initialData: [],
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const message = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setChatLoading(true);

    // Gather context
    const kpis = await base44.entities.KPI.list();
    const alerts = await base44.entities.Alert.list('-created_date', 10);
    const recs = await base44.entities.Recommendation.list('-created_date', 10);

    const context = `
Current KPIs:
${kpis.map(k => `- ${k.name} (${k.domain}): ${k.current_value}${k.unit || ''} [${k.status}]`).join('\n')}

Recent Alerts:
${alerts.map(a => `- [${a.severity}] ${a.title}: ${a.description}`).join('\n')}

Recent Recommendations:
${recs.map(r => `- [${r.status}] ${r.title}: ${r.description}`).join('\n')}
    `.trim();

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the NexusOS Master Orchestrator Agent — an AI-native enterprise decision intelligence system. You have access to the following enterprise data:

${context}

User Query: ${message}

Respond with actionable intelligence. Be specific, data-driven, and quantitative where possible. Reference specific KPIs, alerts, and recommendations when relevant. Format your response using markdown for readability.`,
      model: 'claude_sonnet_4_6'
    });

    await base44.entities.AgentLog.create({
      agent_type: 'orchestrator',
      action: `User query: ${message.substring(0, 100)}`,
      output_summary: typeof response === 'string' ? response.substring(0, 200) : 'Response generated',
      status: 'completed',
    });

    setChatMessages(prev => [...prev, { role: 'assistant', content: typeof response === 'string' ? response : JSON.stringify(response) }]);
    setChatLoading(false);
    queryClient.invalidateQueries({ queryKey: ['agent-logs'] });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">AI Agents</h1>
        <p className="text-sm text-muted-foreground mt-1">Multi-agent orchestration for enterprise intelligence</p>
      </div>

      {/* CortexOS Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-0.5">Powered by CortexOS</p>
            <h2 className="text-lg font-bold text-white">Self-Serve Agent Builder</h2>
            <p className="text-sm text-indigo-200 mt-0.5">Let enterprise teams spin up their own AI Operating System — no code required.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href="https://weightless-cortex-os-core.base44.app/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="h-8 text-xs border-white/30 text-white bg-white/10 hover:bg-white/20 gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> View Landing
            </Button>
          </a>
          <a href="https://weightless-cortex-os-core.base44.app/" target="_blank" rel="noopener noreferrer">
            <Button className="h-8 text-xs bg-white text-indigo-700 hover:bg-indigo-50 gap-1.5">
              Open Builder <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Agent Architecture */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {agentTypes.map((agent, i) => {
          const Icon = agent.icon;
          const logCount = agentLogs.filter(l => l.agent_type === agent.key).length;
          return (
            <motion.div
              key={agent.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn("p-4 rounded-xl border border-border/50 text-center", agent.bg)}
            >
              <Icon className={cn("w-6 h-6 mx-auto mb-2", agent.color)} />
              <p className="text-xs font-semibold">{agent.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{agent.desc}</p>
              <Badge variant="outline" className="text-[10px] mt-2">{logCount} runs</Badge>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <div className="bg-card rounded-xl border border-border/50 flex flex-col h-[500px]">
          <div className="p-4 border-b border-border/50 flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Nexus Orchestrator</h3>
            <Badge variant="outline" className="text-[10px] ml-auto">Active</Badge>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Ask the Orchestrator anything about your enterprise data.</p>
                  <div className="mt-4 space-y-2">
                    {["What are the critical issues right now?", "Summarize today's KPI performance", "What should we prioritize this week?"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setChatInput(q); }}
                        className="block w-full text-left text-xs text-primary/70 hover:text-primary p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === 'user' && "justify-end")}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5",
                    msg.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 border border-border/50"
                  )}>
                    {msg.role === 'user' ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary animate-pulse" />
                  </div>
                  <div className="bg-secondary/50 border border-border/50 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border/50">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask the Orchestrator..."
                className="text-sm"
                disabled={chatLoading}
              />
              <Button type="submit" size="icon" disabled={!chatInput.trim() || chatLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-card rounded-xl border border-border/50 flex flex-col h-[500px]">
          <div className="p-4 border-b border-border/50">
            <h3 className="text-sm font-semibold">Agent Activity Log</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/30">
              {agentLogs.map((log, i) => {
                const agentConfig = agentTypes.find(a => a.key === log.agent_type);
                const StatusIcon = statusIcons[log.status] || Clock;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="p-3 px-4 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5",
                        agentConfig?.bg || 'bg-muted')}>
                        {agentConfig ? <agentConfig.icon className={cn("w-3.5 h-3.5", agentConfig.color)} /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] capitalize">{log.agent_type}</Badge>
                          <StatusIcon className={cn("w-3 h-3",
                            log.status === 'completed' && "text-emerald-400",
                            log.status === 'running' && "text-blue-400 animate-spin",
                            log.status === 'failed' && "text-red-400",
                          )} />
                        </div>
                        <p className="text-xs mt-1 truncate">{log.action}</p>
                        {log.output_summary && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{log.output_summary}</p>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {log.created_date ? formatDistanceToNow(new Date(log.created_date), { addSuffix: true }) : ''}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {agentLogs.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No agent activity yet
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}