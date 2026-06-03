import React from 'react';
import { Bot, CheckCircle, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const agentColors = {
  orchestrator: 'text-blue-400 bg-blue-500/10',
  detection: 'text-cyan-400 bg-cyan-500/10',
  diagnosis: 'text-purple-400 bg-purple-500/10',
  forecast: 'text-amber-400 bg-amber-500/10',
  recommendation: 'text-emerald-400 bg-emerald-500/10',
  execution: 'text-pink-400 bg-pink-500/10',
  learning: 'text-indigo-400 bg-indigo-500/10',
};

const statusIcons = {
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
};

export default function AgentActivityFeed({ logs = [], limit = 6 }) {
  const displayLogs = logs.slice(0, limit);

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          Agent Activity
        </h3>
        <Link to="/agents" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border/30 max-h-[320px] overflow-y-auto">
        {displayLogs.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No agent activity yet
          </div>
        )}
        {displayLogs.map((log, i) => {
          const colors = agentColors[log.agent_type] || 'text-muted-foreground bg-muted';
          const StatusIcon = statusIcons[log.status] || Loader2;
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="p-3 px-5 hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0", colors.split(' ')[1])}>
                  <Bot className={cn("w-3.5 h-3.5", colors.split(' ')[0])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-4 capitalize">
                      {log.agent_type}
                    </Badge>
                    <StatusIcon className={cn(
                      "w-3 h-3",
                      log.status === 'running' && "text-blue-400 animate-spin",
                      log.status === 'completed' && "text-emerald-400",
                      log.status === 'failed' && "text-red-400",
                    )} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.action}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {log.created_date ? formatDistanceToNow(new Date(log.created_date), { addSuffix: true }) : ''}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}