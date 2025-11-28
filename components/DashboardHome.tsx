import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface DashboardHomeProps {
  onStart: (url: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onStart }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input) return;
    setLoading(true);
    try {
      await onStart(input);
    } catch (err) {
      // swallow; App will show errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000] text-white pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Start a new analysis</h2>
        <p className="text-gray-400 mb-6">Enter a website URL to run an on-page SEO + GEO analysis. Results will appear in the dashboard.</p>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="url"
              placeholder="https://example.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-red-800 px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            {loading ? 'Running...' : 'Analyze'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardHome;
