import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

const statusStyles = {
  healthy: 'border-l-emerald-500',
  warning: 'border-l-amber-400',
  critical: 'border-l-red-500',
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export default function KPICard({ kpi, index = 0 }) {
  const TrendIcon = trendIcons[kpi.trend] || Minus;
  const change = kpi.previous_value
    ? (((kpi.current_value - kpi.previous_value) / kpi.previous_value) * 100).toFixed(1)
    : 0;
  const isPositive = change > 0;

  const chartData = (kpi.sparkline_data || []).map((v, i) => ({ v, i }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-card rounded-xl border border-border/50 border-l-[3px] p-5 hover:border-border transition-all",
        statusStyles[kpi.status]
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {kpi.name}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-display">
              {kpi.unit === '$' ? '$' : ''}{typeof kpi.current_value === 'number' ? kpi.current_value.toLocaleString() : kpi.current_value}{kpi.unit === '%' ? '%' : ''}
            </span>
            {kpi.unit && kpi.unit !== '$' && kpi.unit !== '%' && (
              <span className="text-xs text-muted-foreground">{kpi.unit}</span>
            )}
          </div>
        </div>
        {kpi.status === 'critical' && (
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
        )}
      </div>

      {/* Sparkline */}
      {chartData.length > 0 && (
        <div className="h-10 mb-3 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${kpi.name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={kpi.status === 'critical' ? '#ef4444' : kpi.status === 'warning' ? '#f59e0b' : '#3b82f6'} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={kpi.status === 'critical' ? '#ef4444' : kpi.status === 'warning' ? '#f59e0b' : '#3b82f6'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={kpi.status === 'critical' ? '#ef4444' : kpi.status === 'warning' ? '#f59e0b' : '#3b82f6'}
                strokeWidth={1.5}
                fill={`url(#grad-${kpi.name})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trend */}
      <div className="flex items-center justify-between text-xs">
        <div className={cn(
          "flex items-center gap-1 font-medium",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}>
          <TrendIcon className="w-3 h-3" />
          {isPositive ? '+' : ''}{change}%
        </div>
        <span className="text-muted-foreground">
          vs prev: {kpi.previous_value?.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}