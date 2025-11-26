import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
  color?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtext, color = 'text-brand-500', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-[#2a2a2a] p-4 md:p-6 rounded-xl border border-[#333] transition-all group h-full flex flex-col justify-between ${onClick ? 'cursor-pointer hover:border-gray-500 hover:bg-[#333]' : 'hover:border-gray-600'}`}
    >
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <h3 className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className={`p-2 bg-[#333] rounded-lg group-hover:bg-[#444] transition-colors ${color}`}>
          <Icon size={18} className="md:w-5 md:h-5" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl md:text-5xl font-bold text-white mb-1 md:mb-2">{value}</span>
        {subtext && <span className="text-xs md:text-sm text-gray-400">{subtext}</span>}
      </div>
    </div>
  );
};

export default StatCard;