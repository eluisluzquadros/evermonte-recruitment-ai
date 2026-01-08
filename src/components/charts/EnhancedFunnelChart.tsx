import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';

interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  color?: string;
}

interface EnhancedFunnelChartProps {
  data: FunnelData[];
  showConversionRate?: boolean;
}

export const EnhancedFunnelChart: React.FC<EnhancedFunnelChartProps> = ({
  data,
  showConversionRate = true
}) => {
  const maxCount = Math.max(...data.map(d => d.count));

  const defaultColors = [
    'bg-emerald-500',
    'bg-emerald-600',
    'bg-emerald-700',
    'bg-emerald-800',
    'bg-emerald-900'
  ];

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const widthPercent = (item.count / maxCount) * 100;
        const prevCount = index > 0 ? data[index - 1].count : item.count;
        const conversionRate = prevCount > 0 ? ((item.count / prevCount) * 100).toFixed(0) : '100';
        const color = item.color || defaultColors[index % defaultColors.length];

        return (
          <div key={index} className="space-y-1">
            {/* Conversion Rate Indicator */}
            {showConversionRate && index > 0 && (
              <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                <TrendingDown className="w-3 h-3" />
                <span>{conversionRate}% conversão</span>
              </div>
            )}

            {/* Funnel Bar */}
            <div className="flex items-center gap-4 group">
              <div className="w-28 text-right">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {item.stage}
                </div>
              </div>

              <div className="flex-1 relative">
                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                    className={`h-full ${color} relative flex items-center justify-between px-4 shadow-sm`}
                  >
                    {/* Count */}
                    <span className="text-sm font-bold text-white drop-shadow">
                      {item.count}
                    </span>

                    {/* Percentage Badge */}
                    <div className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <span className="text-xs font-semibold text-white">
                        {item.percentage}%
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-emerald-400 dark:group-hover:border-emerald-500 transition-colors pointer-events-none" />
              </div>
            </div>
          </div>
        );
      })}

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Taxa de Sucesso Total:</span>
            <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
              {data.length > 0 ? ((data[data.length - 1].count / data[0].count) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Funil:</span>
            <span className="ml-2 font-bold text-slate-700 dark:text-slate-300">
              {data[0]?.count || 0} → {data[data.length - 1]?.count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
