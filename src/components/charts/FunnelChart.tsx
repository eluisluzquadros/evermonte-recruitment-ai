import React from 'react';

interface FunnelData {
    stage: string;
    count: number;
    percentage: number;
}

interface FunnelChartProps {
    data: FunnelData[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
    const maxCount = Math.max(...data.map(d => d.count));

    return (
        <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
            {data.map((item, index) => {
                // Calculate width relative to max, but keep min width for visibility
                const widthPercent = Math.max((item.count / maxCount) * 100, 15);

                return (
                    <div key={index} className="flex items-center gap-4 group">
                        <div className="w-24 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {item.stage}
                        </div>

                        <div className="flex-1 h-8 bg-slate-100 rounded-sm relative overflow-hidden flex items-center">
                            <div
                                className="h-full bg-emerald-500/20 border-r-2 border-emerald-500 transition-all duration-1000 ease-out flex items-center justify-end px-2"
                                style={{ width: `${widthPercent}%` }}
                            >
                                <span className="text-xs font-bold text-emerald-700">
                                    {item.count}
                                </span>
                            </div>
                        </div>

                        <div className="w-12 text-xs text-slate-400">
                            {item.percentage}%
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
