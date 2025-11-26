
import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { FadeIn, CountUp } from './Animations';
import { AnalysisStatus } from '../types';

type PageType = 'LANDING' | 'DASHBOARD' | 'PRODUCTS' | 'FEATURES' | 'PRICING' | 'LOGIN' | 'SIGNUP' | 'CONTACT' | 'SERVICES' | 'BLOG';

interface LandingPageProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: () => void;
  status: AnalysisStatus;
  errorMsg: string | null;
  onNavigate: (page: PageType) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ url, setUrl, onAnalyze, status, errorMsg, onNavigate }) => {
  const [activePlatform, setActivePlatform] = useState<'SEO' | 'GEO'>('SEO');

  const handleScrollTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <>
      <div className="banner">
          <span className="banner-text">
              <span className="highlight text-red-400">Introducing CodimAi now:</span> The ultimate SEO + AI search solution
          </span>
          <button className="banner-btn" onClick={handleScrollTop}>Try for free</button>
      </div>

      <section className="hero">
          <FadeIn className="hero-content">
              <h1 className="hero-title">CodimAi - Everything About AI</h1>
              <p className="hero-subtitle">Create SEO and GEO that boosts your brand visibility across search and generative platforms.</p>
              
              {/* Premium Input Command Center */}
              <div className="relative mt-10 max-w-2xl mx-auto group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                          <input 
                              type="url" 
                              placeholder="Enter website URL to analyze..." 
                              className="w-full bg-white/5 border border-transparent focus:border-red-500/50 rounded-xl outline-none text-white placeholder-gray-400 px-12 py-4 text-lg transition-all"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
                          />
                      </div>
                      <button 
                          onClick={onAnalyze} 
                          disabled={status === AnalysisStatus.LOADING}
                          className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 sm:w-auto shadow-lg shadow-red-900/40"
                      >
                         {status === AnalysisStatus.LOADING ? (
                             <>Running...</> 
                         ) : (
                             <>Analyze <ArrowRight size={20} /></>
                         )}
                      </button>
                  </div>
              </div>
              
              {errorMsg && (
                  <div className="mt-6 animate-fade-in">
                      <p className="text-red-300 bg-red-950/50 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm border border-red-500/30 backdrop-blur-md">
                          <CheckCircle size={16} /> {errorMsg}
                      </p>
                  </div>
              )}
          </FadeIn>
      </section>

      <section className="platform-section" id="features">
          <h2 className="section-title">The one platform built to make brands seen</h2>

          <div className="cards-container">
              <FadeIn className="card group">
                  <h3 className="card-title group-hover:text-red-400 transition-colors">
                      <div className="bg-red-900/20 p-3 rounded-xl border border-red-500/20">
                          <Search size={28} className="text-red-500" /> 
                      </div>
                      SEO
                  </h3>
                  <ul className="card-list">
                      <li>Find billions of keywords with AI insights</li>
                      <li>Analyze backlinks and traffic potential</li>
                      <li>Run technical audits and track rankings</li>
                  </ul>
                  <button className="card-btn group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white" onClick={handleScrollTop}>Try for free</button>
              </FadeIn>

              <FadeIn className="card group">
                  <h3 className="card-title group-hover:text-red-400 transition-colors">
                      <div className="bg-red-900/20 p-3 rounded-xl border border-red-500/20">
                          <Sparkles size={28} className="text-red-500" /> 
                      </div>
                      GEO
                  </h3>
                  <ul className="card-list">
                      <li>Optimize content for AI and generative search</li>
                      <li>Enhance visibility in AI and answers</li>
                      <li>Use structured data and verified profiles</li>
                  </ul>
                  <button className="card-btn group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white" onClick={handleScrollTop}>Try for free</button>
              </FadeIn>
          </div>
      </section>

      <section className="introducing-section">
          <FadeIn>
              <span className="text-red-500 font-bold uppercase tracking-widest text-sm mb-4 block">Future of Search</span>
              <h2 className="intro-title">Introducing CodimAi</h2>
          </FadeIn>
          
          <div className="grid gap-8 max-w-4xl mx-auto">
              <FadeIn className="intro-content w-full">
                  <div className="flex flex-col md:flex-row items-center md:items-center gap-6 p-6 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                      <div className="p-4 bg-gradient-to-br from-red-500 to-red-800 rounded-2xl shadow-lg shadow-red-500/30 shrink-0 transform rotate-3">
                        <Target className="text-white" size={32} />
                      </div>
                      <div className="text-center md:text-left">
                          <h3 className="intro-subtitle text-xl md:text-2xl mb-2">One solution to win every search.</h3>
                          <p className="intro-text text-base md:text-lg opacity-80">Uniting our leading SEO tools with powerful AI search capabilities - all in one place</p>
                      </div>
                  </div>
              </FadeIn>

              <FadeIn className="intro-content w-full">
                  <div className="flex flex-col md:flex-row items-center md:items-center gap-6 p-6 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                      <div className="p-4 bg-gradient-to-br from-red-500 to-red-800 rounded-2xl shadow-lg shadow-red-500/30 shrink-0 transform -rotate-3">
                        <TrendingUp className="text-white" size={32} />
                      </div>
                      <div className="text-center md:text-left">
                          <h3 className="intro-subtitle text-xl md:text-2xl mb-2">Measure and grow everywhere you're discovered.</h3>
                          <p className="intro-text text-base md:text-lg opacity-80">From Google to ChatGPT, Perplexity, and beyond</p>
                      </div>
                  </div>
              </FadeIn>
          </div>

          <button className="explore-btn group" onClick={() => onNavigate('PRODUCTS')}>
              Explore CodimAi One <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
          </button>
      </section>

      <section className="growth-section">
          <FadeIn>
              <h2 className="growth-title">The growth engine for Enterprises</h2>
              <ul className="growth-list">
                  <li className="flex items-center gap-4 text-left">
                      <div className="bg-green-500/20 p-1.5 rounded-full">
                          <CheckCircle className="text-green-500" size={20} /> 
                      </div>
                      Automate SEO and content at scale
                  </li>
                  <li className="flex items-center gap-4 text-left">
                      <div className="bg-green-500/20 p-1.5 rounded-full">
                          <CheckCircle className="text-green-500" size={20} /> 
                      </div>
                      Forecast traffic, revenue, and ROI accurately
                  </li>
                  <li className="flex items-center gap-4 text-left">
                      <div className="bg-green-500/20 p-1.5 rounded-full">
                          <CheckCircle className="text-green-500" size={20} /> 
                      </div>
                      Optimize for next-gen AI search platforms
                  </li>
              </ul>
              <button className="discover-btn" onClick={() => onNavigate('SERVICES')}>Discover more</button>
          </FadeIn>
      </section>

      <section className="stats-section">
          <div className="stats-container">
              <div className="stat-item group">
                  <div className="absolute -inset-4 bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                  <CountUp end={8} />
                  <p className="stat-label">Success in getting happy customer</p>
              </div>
              <div className="stat-item group">
                  <div className="absolute -inset-4 bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                  <CountUp end={25} />
                  <p className="stat-label">Successful business</p>
              </div>
              <div className="stat-item group">
                   <div className="absolute -inset-4 bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                  <CountUp end={15} />
                  <p className="stat-label">Total clients who love CodimAi</p>
              </div>
              <div className="stat-item group">
                   <div className="absolute -inset-4 bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                  <CountUp end={5} />
                  <p className="stat-label">Stars reviews given by satisfied clients</p>
              </div>
          </div>
      </section>

      <section className="cta-section">
          <FadeIn className="cta-box">
              <h2 className="cta-title">Ready to grow your traffic?</h2>
              <p className="cta-text">Start your free trial and see how our platform helps your brand be seen.</p>
              <button className="cta-btn" onClick={handleScrollTop}>Try for free</button>
          </FadeIn>
      </section>
    </>
  );
};

export default LandingPage;
