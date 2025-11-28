
import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { FadeIn, CountUp } from './Animations';
import Products from './Products';
import Services from './Services';
import { AnalysisStatus } from '../types';

type PageType = 'LANDING' | 'DASHBOARD' | 'PRICING' | 'LOGIN' | 'SIGNUP' | 'CONTACT' | 'HISTORY';

interface LandingPageProps {
    url: string;
    setUrl: (url: string) => void;
    onAnalyze: () => void;
    status: AnalysisStatus;
    errorMsg: string | null;
    onNavigate: (page: PageType, section?: string) => void;
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
              
                            {/* Infographic Panels (replace URL analyzer) */}
                            <div className="relative mt-10 max-w-4xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 rounded-2xl bg-black/60 border border-white/8 text-center">
                                        <Search size={36} className="mx-auto text-red-500" />
                                        <h3 className="mt-4 text-xl font-semibold">On-Page SEO</h3>
                                        <p className="mt-2 text-gray-400 text-sm">Quick insights on titles, headings, metadata and keyword signals.</p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-black/60 border border-white/8 text-center">
                                        <Sparkles size={36} className="mx-auto text-red-500" />
                                        <h3 className="mt-4 text-xl font-semibold">Generative Engine Optimization</h3>
                                        <p className="mt-2 text-gray-400 text-sm">Prepare content to surface in AI answers across chat and assistant platforms.</p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-black/60 border border-white/8 text-center">
                                        <Target size={36} className="mx-auto text-red-500" />
                                        <h3 className="mt-4 text-xl font-semibold">Performance & Core Web Vitals</h3>
                                        <p className="mt-2 text-gray-400 text-sm">Understand speed and interaction metrics that affect visibility and UX.</p>
                                    </div>
                                </div>

                                <div className="mt-6 text-center">
                                    <button
                                        className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2"
                                        onClick={() => { onNavigate('LANDING','products'); setTimeout(()=>{ document.getElementById('products')?.scrollIntoView({behavior:'smooth'}); },80); }}
                                    >
                                        Explore Products <ArrowRight size={16} />
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

          <button className="explore-btn group" onClick={() => { onNavigate('LANDING','products'); setTimeout(()=>document.getElementById('products')?.scrollIntoView({behavior:'smooth'}),80); }}>
              Explore CodimAi One <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
          </button>
      </section>

    <section className="growth-section pt-[150px] pb-0">
          <div className="max-w-4xl mx-auto px-4">
          <FadeIn>
              <h2 className="growth-title">The growth engine for Enterprises</h2>
              <ul className="growth-list space-y-4 mt-6">
                  <li className="flex items-center gap-4 text-left p-4 rounded-xl bg-transparent">
                      <div className="bg-green-500/20 p-1.5 rounded-full">
                          <CheckCircle className="text-green-500" size={20} /> 
                      </div>
                      <span className="block">Automate SEO and content at scale</span>
                  </li>
                  <li className="flex items-center gap-4 text-left p-4 rounded-xl bg-transparent">
                      <div className="bg-green-500/20 p-1.5 rounded-full">
                          <CheckCircle className="text-green-500" size={20} /> 
                      </div>
                      <span className="block">Forecast traffic, revenue, and ROI accurately</span>
                  </li>
                  <li className="flex items-center gap-4 text-left p-4 rounded-xl bg-transparent">
                      <div className="bg-green-500/20 p-1.5 rounded-full">
                          <CheckCircle className="text-green-500" size={20} /> 
                      </div>
                      <span className="block">Optimize for next-gen AI search platforms</span>
                  </li>
              </ul>
                            <div className="mt-6">
                              <button className="discover-btn mt-2 px-6 py-3 rounded-xl" onClick={() => { onNavigate('LANDING','services'); setTimeout(()=>document.getElementById('services')?.scrollIntoView({behavior:'smooth'}),80); }}>Discover more</button>
                            </div>
          </FadeIn>
          </div>
      </section>

            {/* Products Section (embedded) */}
            <section id="products" className="products-section">
                <div className="max-w-5xl mx-auto">
                    <Products />
                </div>
            </section>

            {/* Services Section (embedded) */}
            <section id="services" className="services-section bg-[#000] pb-20">
                <div className="max-w-5xl mx-auto">
                    <Services />
                </div>
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
