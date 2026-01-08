import React from 'react';

interface RadarChartProps {
    data: {
        label: string;
        score: number;
        fullMark?: number; // default 10
    }[];
    width?: number;
    height?: number;
    color?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
    data,
    width = 300,
    height = 300,
    color = "#10B981"
}) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40; // Padding for labels
    const fullMark = 10;
    const levels = 5; // Number of grid circles

    const angleSlice = (Math.PI * 2) / data.length;

    // Helper to get coordinates
    const getCoordinates = (value: number, index: number) => {
        const angle = index * angleSlice - Math.PI / 2; // Start from top
        const r = (value / fullMark) * radius;
        return {
            x: centerX + r * Math.cos(angle),
            y: centerY + r * Math.sin(angle)
        };
    };

    const points = data.map((d, i) => {
        const coords = getCoordinates(d.score, i);
        return `${coords.x},${coords.y}`;
    }).join(' ');

    return (
        <div className="flex justify-center items-center">
            <svg width={width} height={height} className="overflow-visible">
                {/* Grid Circles */}
                {Array.from({ length: levels }).map((_, i) => {
                    const levelRadius = (radius / levels) * (i + 1);
                    return (
                        <circle
                            key={i}
                            cx={centerX}
                            cy={centerY}
                            r={levelRadius}
                            fill="none"
                            stroke="#e5e7eb" // gray-200
                            strokeOpacity={0.5}
                            strokeDasharray="4 4"
                        />
                    );
                })}

                {/* Axes */}
                {data.map((d, i) => {
                    const coords = getCoordinates(fullMark, i);
                    return (
                        <line
                            key={i}
                            x1={centerX}
                            y1={centerY}
                            x2={coords.x}
                            y2={coords.y}
                            stroke="#e5e7eb"
                            strokeOpacity={0.5}
                        />
                    );
                })}

                {/* Data Polygon */}
                <polygon
                    points={points}
                    fill={color}
                    fillOpacity={0.2}
                    stroke={color}
                    strokeWidth={2}
                />

                {/* Data Points */}
                {data.map((d, i) => {
                    const coords = getCoordinates(d.score, i);
                    return (
                        <circle
                            key={i}
                            cx={coords.x}
                            cy={coords.y}
                            r={4}
                            fill={color}
                        />
                    );
                })}

                {/* Labels */}
                {data.map((d, i) => {
                    // Push label out a bit further than max radius
                    const angle = index => index * angleSlice - Math.PI / 2;
                    const labelRadius = radius + 20;
                    const x = centerX + labelRadius * Math.cos(angle(i));
                    const y = centerY + labelRadius * Math.sin(angle(i));

                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] font-medium fill-slate-500 uppercase tracking-wider"
                            style={{ fontSize: '10px' }}
                        >
                            {d.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};
