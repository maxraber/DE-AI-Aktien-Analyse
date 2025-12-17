import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { ScoreItem } from '../types';

interface AnalysisChartProps {
  scores: ScoreItem[];
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ scores }) => {
  // Simplify category names for the chart axis
  const data = scores.map(s => ({
    fullCategory: s.category,
    subject: s.category.split(' ')[0], // Take first word (e.g., "Bewertung", "Wachstum")
    A: s.score,
    fullMark: 10,
  }));

  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#cbd5e1', fontSize: 12 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 10]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#10b981" // Emerald 500
            strokeWidth={2}
            fill="#10b981"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ color: '#10b981' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};