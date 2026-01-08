import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ComparisonData {
  category: string;
  candidate1: number;
  candidate2: number;
  candidate3?: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  candidate1Name: string;
  candidate2Name: string;
  candidate3Name?: string;
  height?: number;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  candidate1Name,
  candidate2Name,
  candidate3Name,
  height = 400
}) => {
  const colors = {
    candidate1: '#10B981', // emerald
    candidate2: '#3B82F6', // blue
    candidate3: '#F59E0B'  // amber
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-sm mb-2 text-slate-900 dark:text-slate-100">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value.toFixed(1)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
          className="dark:stroke-slate-700"
        />
        <XAxis
          dataKey="category"
          tick={{
            fill: '#64748b',
            fontSize: 12
          }}
          angle={-15}
          textAnchor="end"
          height={80}
        />
        <YAxis
          domain={[0, 10]}
          tick={{
            fill: '#64748b',
            fontSize: 12
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            paddingTop: '20px'
          }}
          iconType="circle"
        />
        <Bar
          dataKey="candidate1"
          name={candidate1Name}
          fill={colors.candidate1}
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
        <Bar
          dataKey="candidate2"
          name={candidate2Name}
          fill={colors.candidate2}
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
        {candidate3Name && (
          <Bar
            dataKey="candidate3"
            name={candidate3Name}
            fill={colors.candidate3}
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};
