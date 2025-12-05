import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import History from './History';

interface DashboardHomeProps {
  onStart: (url: string) => void;
  onSelectReport: (report: any) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onStart, onSelectReport }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Normalize URL: add https:// if missing, handle various formats
  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();
    if (!normalized) return '';
    
    // Remove any leading/trailing whitespace
    normalized = normalized.replace(/\s+/g, '');
    
    // If it doesn't start with http:// or https://, add https://
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    
    return normalized;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    
    const normalizedUrl = normalizeUrl(input);
    if (!normalizedUrl) return;
    
    setLoading(true);
    try {
      await onStart(normalizedUrl);
    } catch (err) {
      // swallow; App will show errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000] text-white pt-20 pb-20 px-4 md:px-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-full mb-6">
          <Sparkles size={16} className="text-red-400" />
          <span className="text-red-300 text-sm font-medium">SEO + GEO Analysis</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Start a New Analysis</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Enter any website URL to get comprehensive SEO insights, Core Web Vitals, and AI-powered recommendations.</p>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto mb-16">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="example.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-xl pl-12 pr-4 py-4 text-white text-lg outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze'} <ArrowRight size={18} />
          </button>
        </form>
        <p className="text-gray-500 text-sm mt-3 text-center">Supports: example.com, www.example.com, https://example.com</p>
      </div>

      {/* History Section */}
      <History onSelectReport={onSelectReport} />
    </div>
  );
};

export default DashboardHome;
