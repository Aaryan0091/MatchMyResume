/**
 * ScoreChart component - displays the match score as a donut chart using Recharts.
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ScoreChartProps } from '../types';

const ScoreChart: React.FC<ScoreChartProps> = ({ score }) => {
  // Determine color based on score
  const getColor = (score: number): string => {
    if (score >= 80) return '#22c55e'; // green-500
    if (score >= 60) return '#eab308'; // yellow-500
    if (score >= 40) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  const color = getColor(score);

  // Prepare data for the pie chart
  const data = [
    { name: 'Match', value: score },
    { name: 'Gap', value: 100 - score },
  ];

  return (
    <div className="flex items-center justify-center">
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#f3f4f6" />
          </Pie>
          <Tooltip
            formatter={(value: number) => `${value}%`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.5rem',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute">
        <div className="text-4xl font-bold" style={{ color }}>
          {score}
        </div>
        <div className="text-sm text-gray-500 text-center">%</div>
      </div>
    </div>
  );
};

export default ScoreChart;
