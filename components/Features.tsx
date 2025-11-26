
import React from 'react';
import { Zap, Layers, Lock, RefreshCcw, Smartphone, Globe2 } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#000] text-white pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center mb-20">
          <div className="lg:w-1/2">
            <h2 className="text-red-500 font-bold tracking-wider uppercase mb-2">Features</h2>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Everything you need to rank in the AI Era.
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Traditional SEO tools are outdated. CodimAi provides the specific feature set required to optimize for Large Language Models and Semantic Search engines.
            </p>
            <button className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors">
              Explore Features
            </button>
          </div>
          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
                <Zap className="text-yellow-500 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">Real-time Analysis</h3>
                <p className="text-gray-500 text-sm">Get instant feedback on your page structure and content gaps.</p>
             </div>
             <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
                <Layers className="text-blue-500 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">Entity Mapping</h3>
                <p className="text-gray-500 text-sm">Visualize how search engines understand your brand entities.</p>
             </div>
             <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
                <RefreshCcw className="text-green-500 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">Competitor Spy</h3>
                <p className="text-gray-500 text-sm">See exactly why your competitors are ranking in AI answers.</p>
             </div>
             <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
                <Lock className="text-red-500 mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">Secure Audits</h3>
                <p className="text-gray-500 text-sm">Enterprise-grade security for your proprietary data.</p>
             </div>
          </div>
        </div>

        <div className="border-t border-[#222] pt-20">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Technical Excellence</h2>
                <p className="text-gray-400">Built for performance and scale.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                    <Smartphone size={48} className="mx-auto text-gray-600 mb-6" />
                    <h3 className="text-xl font-bold mb-3">Mobile First</h3>
                    <p className="text-gray-500">Analysis prioritizes mobile-first indexing, reflecting modern search behavior.</p>
                </div>
                <div className="text-center p-6">
                    <Globe2 size={48} className="mx-auto text-gray-600 mb-6" />
                    <h3 className="text-xl font-bold mb-3">Global Geo-Targeting</h3>
                    <p className="text-gray-500">Simulate search results from any location worldwide to localize your strategy.</p>
                </div>
                <div className="text-center p-6">
                    <Zap size={48} className="mx-auto text-gray-600 mb-6" />
                    <h3 className="text-xl font-bold mb-3">Core Web Vitals</h3>
                    <p className="text-gray-500">Deep integration with Lighthouse to optimize LCP, CLS, and INP metrics.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
