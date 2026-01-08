import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  trend?: string;
  trendPositive?: boolean;
  target?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose';
  animate?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  icon,
  label,
  value,
  subtitle,
  description,
  trend,
  trendPositive,
  target,
  color = 'emerald',
  animate = true
}) => {
  const colorConfig = {
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-200 dark:ring-emerald-800'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-200 dark:ring-blue-800'
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-200 dark:ring-amber-800'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      ring: 'ring-purple-200 dark:ring-purple-800'
    },
    rose: {
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      text: 'text-rose-600 dark:text-rose-400',
      ring: 'ring-rose-200 dark:ring-rose-800'
    }
  };

  const config = colorConfig[color];

  const CardWrapper = animate ? motion.div : 'div';
  const cardProps = animate ? {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <CardWrapper {...cardProps}>
      <Card className={`border-none shadow-sm ring-1 ${config.ring} hover:shadow-md transition-shadow`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {label}
              </p>

              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                  {value}
                </p>
                {trend && (
                  <div className={`flex items-center gap-1 text-sm font-semibold ${trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                    {trendPositive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{trend}</span>
                  </div>
                )}
              </div>

              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}

              {description && (
                <p className="text-xs text-muted-foreground mt-2">
                  {description}
                </p>
              )}

              {target && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-muted-foreground">
                    {target}
                  </p>
                </div>
              )}
            </div>

            <div className={`p-3 ${config.bg} rounded-lg shrink-0`}>
              <div className={config.text}>
                {icon}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  );
};
