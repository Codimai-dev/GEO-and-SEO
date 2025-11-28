
import React, { useState } from 'react';
import { PageSpeedResult, PerformanceAiAnalysis, AnalysisStatus } from '../types';
import { Gauge, Zap, Layout, MousePointer2, X, Code2, Terminal, Smartphone, Monitor, Loader2, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PerformanceAnalysisProps {
  mobileResult: PageSpeedResult | null;
  desktopResult: PageSpeedResult | null;
  aiAnalysis: PerformanceAiAnalysis | null;
  status: AnalysisStatus;
  onClose: () => void;
}

const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({ mobileResult, desktopResult, aiAnalysis, status, onClose }) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');

  // If idle and no data, don't show
  if (status === AnalysisStatus.IDLE && !mobileResult && !desktopResult) return null;

  const currentResult = activeTab === 'mobile' ? mobileResult : desktopResult;

  // Theme Colors
  const THEME_RED = '#ff4444';
  const THEME_DARK_RED = '#b91c1c';
  const THEME_BG_DARK = '#000';
  const THEME_BG_DARKER = '#000000';
  const THEME_TEXT_GRAY = '#9ca3af';

  const getScoreColor = (score: number) => {
    // Even though theme is red/black, score colors should remain semantic (Green=Good)
    if (score >= 90) return '#22c55e'; // Green
    if (score >= 50) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const renderGauge = (score: number) => {
    const data = [{ value: score }, { value: 100 - score }];
    const color = getScoreColor(score);
    
    return (
      <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={75}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              <Cell fill={color} />
              <Cell fill="#333" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
          <span className="text-4xl md:text-5xl font-bold tracking-tighter" style={{ color }}>{score}</span>
          <span className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-medium">Score</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center md:p-4 bg-black/90 backdrop-blur-md transition-all">
      <div className="bg-[#121212] w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-2xl border-0 md:border border-[#333] shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header */}
          <div className="p-4 md:p-5 border-b border-[#333] flex justify-between items-center bg-[#000]">
          <div className="flex items-center gap-3">
            <div className="bg-red-900/20 p-2 rounded-lg border border-red-500/30 hidden sm:block">
              <Gauge className="text-red-500" size={24} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Performance & Core Web Vitals</h2>
              <p className="text-xs text-gray-400 font-medium">Powered by Google PageSpeed & Gemini AI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-[#333] p-2 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-[#121212] relative">
          
          {status === AnalysisStatus.LOADING ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] z-20">
               {/* Modern Loading State */}
               <div className="relative mb-8">
                  <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 animate-pulse rounded-full"></div>
                  <div className="relative w-20 h-20 bg-[#000] rounded-xl border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                     <Loader2 size={40} className="text-red-500 animate-spin" />
                  </div>
               </div>
               <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Running Diagnostics</h3>
               <p className="text-red-400 animate-pulse font-mono text-sm">Analyzing Mobile & Desktop Performance...</p>
               
               <div className="mt-8 flex gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce delay-75"></div>
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce delay-150"></div>
               </div>
            </div>
          ) : currentResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              
              {/* Left Column: Metrics (4 cols) */}
              <div className="lg:col-span-4 space-y-4 md:space-y-6">
                
                {/* Tab Switcher */}
                <div className="flex p-1 bg-[#000] rounded-lg border border-[#333]">
                    <button 
                        onClick={() => setActiveTab('mobile')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs md:text-sm font-bold transition-all ${activeTab === 'mobile' ? 'bg-[#222] text-white shadow-sm ring-1 ring-white/10 border border-[#333]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Smartphone size={14} /> Mobile
                    </button>
                    <button 
                        onClick={() => setActiveTab('desktop')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs md:text-sm font-bold transition-all ${activeTab === 'desktop' ? 'bg-[#222] text-white shadow-sm ring-1 ring-white/10 border border-[#333]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Monitor size={14} /> Desktop
                    </button>
                </div>

                {/* Main Gauge Card */}
                <div className="bg-[#000] rounded-xl p-4 md:p-6 border border-[#333] flex flex-col items-center relative overflow-hidden min-h-[260px] md:min-h-[300px]">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                  <h3 className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-6 text-center">
                    {activeTab.toUpperCase()} PERFORMANCE
                  </h3>
                  
                  <div className="flex-1 flex items-center justify-center w-full">
                    {renderGauge(currentResult.performanceScore)}
                  </div>
                </div>

                {/* Core Web Vitals Grid */}
                <div className="bg-[#000] rounded-xl border border-[#333] overflow-hidden">
                  <div className="p-3 bg-[#111] border-b border-[#333] text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 flex items-center gap-2">
                     <Activity size={12} className="text-red-500"/> Core Web Vitals
                  </div>
                  <div className="divide-y divide-[#222]">
                    {/* LCP */}
                    <div className="p-3 md:p-4 flex items-center justify-between hover:bg-[#111] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 md:p-2 rounded-lg ${currentResult.coreWebVitals.lcp.score === 'good' ? 'bg-green-900/10 text-green-500' : currentResult.coreWebVitals.lcp.score === 'average' ? 'bg-orange-900/10 text-orange-500' : 'bg-red-900/10 text-red-500'}`}>
                            <Zap size={16} />
                        </div>
                        <div>
                            <span className="text-sm text-gray-200 block font-bold">LCP</span>
                            <span className="text-[9px] md:text-[10px] text-gray-500 block">Largest Contentful Paint</span>
                        </div>
                      </div>
                      <span className={`text-sm font-mono font-bold ${currentResult.coreWebVitals.lcp.score === 'good' ? 'text-green-400' : currentResult.coreWebVitals.lcp.score === 'average' ? 'text-orange-400' : 'text-red-400'}`}>
                          {currentResult.coreWebVitals.lcp.value}
                      </span>
                    </div>
                    
                    {/* INP */}
                    <div className="p-3 md:p-4 flex items-center justify-between hover:bg-[#111] transition-colors">
                      <div className="flex items-center gap-3">
                         <div className={`p-1.5 md:p-2 rounded-lg ${currentResult.coreWebVitals.inp.score === 'good' ? 'bg-green-900/10 text-green-500' : currentResult.coreWebVitals.inp.score === 'average' ? 'bg-orange-900/10 text-orange-500' : 'bg-red-900/10 text-red-500'}`}>
                            <MousePointer2 size={16} />
                        </div>
                        <div>
                            <span className="text-sm text-gray-200 block font-bold">INP</span>
                            <span className="text-[9px] md:text-[10px] text-gray-500 block">Interaction to Next Paint</span>
                        </div>
                      </div>
                      <span className={`text-sm font-mono font-bold ${currentResult.coreWebVitals.inp.score === 'good' ? 'text-green-400' : currentResult.coreWebVitals.inp.score === 'average' ? 'text-orange-400' : 'text-red-400'}`}>
                        {currentResult.coreWebVitals.inp.value}
                      </span>
                    </div>

                    {/* CLS */}
                    <div className="p-3 md:p-4 flex items-center justify-between hover:bg-[#111] transition-colors">
                      <div className="flex items-center gap-3">
                         <div className={`p-1.5 md:p-2 rounded-lg ${currentResult.coreWebVitals.cls.score === 'good' ? 'bg-green-900/10 text-green-500' : currentResult.coreWebVitals.cls.score === 'average' ? 'bg-orange-900/10 text-orange-500' : 'bg-red-900/10 text-red-500'}`}>
                            <Layout size={16} />
                        </div>
                        <div>
                            <span className="text-sm text-gray-200 block font-bold">CLS</span>
                            <span className="text-[9px] md:text-[10px] text-gray-500 block">Cumulative Layout Shift</span>
                        </div>
                      </div>
                      <span className={`text-sm font-mono font-bold ${currentResult.coreWebVitals.cls.score === 'good' ? 'text-green-400' : currentResult.coreWebVitals.cls.score === 'average' ? 'text-orange-400' : 'text-red-400'}`}>
                        {currentResult.coreWebVitals.cls.value}
                      </span>
                    </div>
                  </div>
                </div>
                
                {currentResult.screenshot && (
                   <div className="rounded-xl overflow-hidden border border-[#333] shadow-lg relative group bg-black hidden md:block">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 z-10"></div>
                       <img src={currentResult.screenshot} alt="Screenshot" className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity" />
                       <div className="absolute bottom-3 left-3 text-xs text-white font-medium z-20 flex items-center gap-2">
                          <Monitor size={12} /> Page Preview
                       </div>
                   </div>
                )}
              </div>

              {/* Right Column: AI Recommendations (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {aiAnalysis ? (
                  <>
                    <div className="bg-gradient-to-br from-red-950 to-[#000] border border-red-900/50 p-5 md:p-8 rounded-xl relative overflow-hidden shadow-[0_0_30px_-10px_rgba(220,38,38,0.3)]">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                          <Terminal size={120} className="text-white" />
                      </div>
                      <div className="relative z-10">
                          <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2 text-lg md:text-xl">
                             <Terminal size={20} /> Executive Summary
                          </h3>
                          <p className="text-gray-300 text-xs md:text-sm leading-6 md:leading-7 tracking-wide font-light">{aiAnalysis.summary}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                            <Code2 className="text-red-500" /> AI Repair Guide
                          </h3>
                          <span className="text-[10px] font-bold uppercase bg-[#111] px-3 py-1.5 rounded-md text-gray-400 border border-[#333] tracking-wider">
                             Optimized for {activeTab}
                          </span>
                      </div>
                      
                      {(aiAnalysis.fixes && Array.isArray(aiAnalysis.fixes) ? aiAnalysis.fixes : []).map((fix, idx) => (
                        <div key={idx} className="bg-[#0a0a0a] rounded-xl border border-[#222] overflow-hidden group hover:border-red-900/50 transition-all shadow-md hover:shadow-lg">
                          {/* Header */}
                          <div className="p-4 md:p-5 border-b border-[#222] flex flex-col sm:flex-row sm:items-center justify-between bg-[#111] gap-3">
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded bg-[#222] border border-[#333] flex items-center justify-center text-xs font-bold text-red-500 mt-0.5 flex-shrink-0">{idx + 1}</span>
                                <div>
                                    <h4 className="text-white font-bold text-sm md:text-base group-hover:text-red-400 transition-colors">{fix.title}</h4>
                                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">{fix.impact_on_seo}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 md:px-3 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest self-start sm:self-center ${
                                fix.severity === 'High' ? 'bg-red-900/20 text-red-400 border border-red-900/30' : 
                                fix.severity === 'Medium' ? 'bg-orange-900/20 text-orange-400 border border-orange-900/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}>
                                {fix.severity} Priority
                            </span>
                          </div>
                          
                          {/* Body */}
                          <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                            <div className="text-gray-300 text-xs md:text-sm leading-relaxed flex gap-3">
                               <div className="min-w-[4px] w-1 rounded-full bg-red-900/30"></div>
                               <p>{fix.technical_explanation}</p>
                            </div>
                            
                            <div className="relative group/code mt-2">
                                <div className="absolute top-0 right-0 text-[9px] md:text-[10px] text-gray-500 uppercase font-bold bg-[#222] px-2 py-1 rounded-bl-lg border-l border-b border-[#333]">Suggested Code</div>
                                <pre className="bg-[#000] p-4 md:p-5 rounded-lg overflow-x-auto border border-[#222] shadow-inner">
                                    <code className="text-xs md:text-sm font-mono text-gray-300 font-medium">{fix.code_suggestion}</code>
                                </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-500 space-y-4 bg-[#000] rounded-xl border border-[#222] border-dashed">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full animate-pulse"></div>
                            <Loader2 className="animate-spin text-red-500 relative z-10" size={48} />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-bold">Generating AI Solutions</p>
                            <p className="text-xs text-gray-500 mt-1">Analysing performance bottlenecks...</p>
                        </div>
                    </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <div className="bg-red-900/10 p-8 rounded-full mb-6 border border-red-500/20">
                    <X size={48} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Analysis Failed</h3>
                <p className="text-gray-400 max-w-md">We couldn't retrieve performance data at this time. Please check your URL and try again.</p>
                <button onClick={onClose} className="mt-6 px-6 py-2 bg-[#333] hover:bg-[#444] text-white rounded-lg font-medium transition-colors">
                    Close
                </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PerformanceAnalysis;
