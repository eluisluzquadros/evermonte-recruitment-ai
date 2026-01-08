import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface RadarChartProps {
  data: {
    label: string;
    score: number;
    fullMark?: number;
  }[];
  width?: number;
  height?: number;
  color?: string;
  title?: string;
}

export const InteractiveRadarChart: React.FC<RadarChartProps> = ({
  data,
  width,
  height = 300,
  color = "#10B981",
  title
}) => {
  // Transform data for Recharts format
  const chartData = data.map(item => ({
    subject: item.label,
    score: item.score,
    fullMark: item.fullMark || 10
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-700">
          <p className="font-semibold text-sm">{payload[0].payload.subject}</p>
          <p className="text-emerald-400 font-bold">
            {payload[0].value.toFixed(1)} / {payload[0].payload.fullMark}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            className="dark:stroke-slate-700"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: '#64748b',
              fontSize: 11,
              fontWeight: 600
            }}
            className="dark:fill-slate-400"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{
              fill: '#94a3b8',
              fontSize: 10
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Score"
            dataKey="score"
            stroke={color}
            fill={color}
            fillOpacity={0.25}
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: color,
              strokeWidth: 2,
              stroke: '#fff'
            }}
            activeDot={{
              r: 6,
              fill: color,
              strokeWidth: 3,
              stroke: '#fff'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
