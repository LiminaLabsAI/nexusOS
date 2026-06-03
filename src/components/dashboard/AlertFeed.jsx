import React from 'react';
import { AlertTriangle, AlertCircle, Info, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
  warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10', badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', badge: 'bg-blue-400/20 text-blue-300 border-blue-400/30' },
};

export default function AlertFeed({ alerts = [], limit = 5 }) {
  const displayAlerts = alerts.slice(0, limit);

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <h3 className="font-semibold text-sm">Live Alert Feed</h3>
        <Link to="/alerts" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border/30">
        {displayAlerts.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No active alerts — systems nominal
          </div>
        )}
        {displayAlerts.map((alert, i) => {
          const config = severityConfig[alert.severity] || severityConfig.info;
          const Icon = config.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.bg)}>
                  <Icon className={cn("w-4 h-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <Badge variant="outline" className={cn("text-[10px] flex-shrink-0 border", config.badge)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.created_date ? formatDistanceToNow(new Date(alert.created_date), { addSuffix: true }) : 'just now'}
                    </span>
                    {alert.domain && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {alert.domain}
                      </Badge>
                    )}
                    {alert.ai_confidence && (
                      <span>AI: {alert.ai_confidence}%</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}