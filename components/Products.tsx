
import React from 'react';
import { Search, Sparkles, BarChart3, Globe, Cpu, Shield } from 'lucide-react';

const Products: React.FC = () => {
  const products = [
    {
      icon: Search,
      title: "SEO Analyzer",
      desc: "Comprehensive on-page technical analysis. Identify broken links, missing meta tags, and structural issues instantly."
    },
    {
      icon: Sparkles,
      title: "GEO Optimizer",
      desc: "Generative Engine Optimization. Prepare your content to rank in AI answers like ChatGPT, Gemini, and Perplexity."
    },
    {
      icon: Globe,
      title: "CodimAi One",
      desc: "The all-in-one suite. Manage SEO, GEO, and Performance from a single dashboard with unified reporting."
    },
    {
      icon: Cpu,
      title: "AI Content Architect",
      desc: "Generate SEO-optimized content outlines and drafts that target specific entity gaps in your niche."
    },
    {
      icon: BarChart3,
      title: "Rank Tracker",
      desc: "Monitor your visibility not just on Google SERPs, but across AI chat responses and voice search."
    },
    {
      icon: Shield,
      title: "Brand Authority",
      desc: "Measure and improve your E-E-A-T signals to establish trust with both users and search algorithms."
    }
  ];

  return (
    <div className="min-h-screen bg-[#000] text-white pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Our Product Suite
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tools designed for the future of search. Dominate traditional results and win the AI conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((prod, idx) => (
            <div key={idx} className="bg-[#121212] border border-[#333] rounded-xl p-8 hover:border-red-600/50 hover:bg-[#1a1a1a] transition-all group">
              <div className="bg-[#222] w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-900/20 transition-colors">
                <prod.icon size={28} className="text-white group-hover:text-red-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{prod.title}</h3>
              <p className="text-gray-400 leading-relaxed">{prod.desc}</p>
              <a href="#" className="inline-flex items-center gap-2 text-red-500 font-semibold mt-6 hover:gap-3 transition-all">
                Learn more <span className="text-lg">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
