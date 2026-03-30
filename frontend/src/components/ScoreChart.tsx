import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ScoreChartProps } from '../types';

const ScoreChart: React.FC<ScoreChartProps> = ({ score }) => {
  const getColor = (score: number): string => {
    if (score >= 80) return '#34d399'; // emerald-400
    if (score >= 60) return '#facc15'; // yellow-400
    if (score >= 40) return '#fb923c'; // orange-400
    return '#f87171'; // red-400
  };

  const color = getColor(score);

  const data = [
    { name: 'Match', value: score },
    { name: 'Gap', value: 100 - score },
  ];

  return (
    <div className="flex items-center justify-center relative w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}
            cornerRadius={40}
          >
            <Cell fill={color} />
            <Cell fill="#1e293b" /> {/* dark-800 equivalent */}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value}%`, '']}
            contentStyle={{
              backgroundColor: '#0f172a', // dark-900
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.75rem',
              padding: '0.5rem 1rem',
              color: '#f1f5f9',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }}
            itemStyle={{ color: '#f1f5f9' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-5xl font-bold font-display tracking-tight" style={{ color, textShadow: `0 0 20px ${color}40` }}>
          {score}
        </div>
        <div className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">Score</div>
      </div>
    </div>
  );
};

export default ScoreChart;
