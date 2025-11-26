
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ScoreCardProps {
  score: number;
  loading?: boolean;
  onClick?: () => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, loading, onClick }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  let color = '#22c55e'; // Green
  if (score < 50) color = '#ef4444'; // Red
  else if (score < 80) color = '#f97316'; // Orange

  const COLORS = [color, '#333333'];

  if (loading) {
    return (
      <div className="bg-[#2a2a2a] p-6 rounded-xl border border-[#333] flex flex-col items-center justify-center h-full min-h-[280px] md:min-h-[320px] animate-pulse">
        <div className="w-48 h-48 bg-[#333] rounded-full mb-4"></div>
        <div className="w-32 h-8 bg-[#333] rounded"></div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`bg-[#2a2a2a] p-6 rounded-xl border border-[#333] flex flex-col items-center justify-center h-full min-h-[280px] md:min-h-[320px] relative overflow-hidden transition-all ${onClick ? 'cursor-pointer hover:border-gray-500 hover:bg-[#333]' : ''}`}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-red-500 to-white"></div>
      <h2 className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider mb-4 md:mb-6">Overall SEO Health</h2>
      
      <div className="relative w-56 h-56 md:w-64 md:h-64 mx-auto flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl md:text-5xl font-bold text-white">{score}</span>
          <span className="text-xs md:text-sm text-gray-400 mt-1">/ 100</span>
        </div>
      </div>

      <p className="mt-4 md:mt-6 text-gray-300 text-center text-xs md:text-sm px-4">
        {score >= 90 ? 'Excellent! Your site is well optimized.' : 
         score >= 70 ? 'Good job, but there is room for improvement.' : 
         'Critical issues detected. Action required.'}
      </p>
      
      {onClick && (
          <div className="absolute bottom-4 text-[10px] text-gray-500 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Click for details
          </div>
      )}
    </div>
  );
};

export default ScoreCard;
    