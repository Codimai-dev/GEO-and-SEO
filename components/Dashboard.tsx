

import React, { useState } from 'react';
import { Activity, FileCode, Globe, AlertCircle, Gauge, ExternalLink, LayoutList, FileSearch, Brain } from 'lucide-react';
import { SeoReport, AiAnalysisResult, AnalysisStatus } from '../types';
import ScoreCard from './ScoreCard';
import StatCard from './StatCard';
import AnalysisDetails from './AnalysisDetails';
import AiReport from './AiReport';
import SiteWideAnalysis from './SiteWideAnalysis';
import MetricDetailModal from './MetricDetailModal';

interface DashboardProps {
  report: SeoReport;
  loading: boolean;
  onReset: (e?: React.MouseEvent) => void;
  aiStatus: AnalysisStatus;
  aiResult: AiAnalysisResult | null;
  onRequestAi: () => void;
  onOpenPerformance: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ report, loading, onReset, aiStatus, aiResult, onRequestAi, onOpenPerformance }) => {
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'SITE' | 'AI'>('SINGLE');
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'words' | 'links' | 'images' | null>(null);

  const handleMetricClick = (type: 'score' | 'words' | 'links' | 'images') => {
      setSelectedMetric(type);
  };

  const closeMetricModal = () => setSelectedMetric(null);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-200 pt-8 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
            
            <MetricDetailModal 
                isOpen={!!selectedMetric}
                onClose={closeMetricModal}
                metricType={selectedMetric}
                report={report}
            />

            <div className="flex justify-between items-end mb-6">
                  <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <Activity className="text-brand-500" /> Analysis Report
                      </h2>
                      <p className="text-gray-400 text-sm mt-1 font-mono flex items-center gap-2">
                          {report.url}
                          {report.crawledPages && report.crawledPages.length > 1 && (
                              <span className="bg-[#333] text-xs px-2 py-0.5 rounded text-gray-400 border border-[#444]">
                                  + {report.crawledPages.length - 1} Internal Pages Scanned
                              </span>
                          )}
                      </p>
                  </div>
                  <button onClick={(e) => onReset(e)} className="text-sm text-gray-400 hover:text-white transition-colors bg-[#2a2a2a] border border-[#333] px-4 py-2 rounded">
                      Start New Analysis
                  </button>
            </div>

            <div className="animate-fade-in flex flex-col gap-6">
                {/* Dashboard Tabs */}
                <div className="flex gap-6 border-b border-[#333] overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('SINGLE')}
                        className={`pb-3 px-2 flex items-center gap-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                            activeTab === 'SINGLE' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <FileSearch size={16} /> Current Page
                        {activeTab === 'SINGLE' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('SITE')}
                        className={`pb-3 px-2 flex items-center gap-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                            activeTab === 'SITE' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <LayoutList size={16} /> Site Audit ({report.crawledPages?.length || 0})
                        {activeTab === 'SITE' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('AI')}
                        className={`pb-3 px-2 flex items-center gap-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                            activeTab === 'AI' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Brain size={16} /> Deep SEO Audit
                        {activeTab === 'AI' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></div>}
                    </button>
                </div>

                {activeTab === 'SINGLE' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Metrics Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 h-full">
                                <ScoreCard 
                                    score={report.score} 
                                    loading={loading} 
                                    onClick={() => handleMetricClick('score')}
                                />
                            </div>
                            <div className="lg:col-span-2 h-full">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                                    <StatCard 
                                        title="Word Count" 
                                        value={report.wordCount} 
                                        icon={FileCode} 
                                        subtext="Total words in body" 
                                        color="text-brand-500"
                                        onClick={() => handleMetricClick('words')}
                                    />
                                    <StatCard 
                                        title="Internal Links" 
                                        value={report.links.internal} 
                                        icon={Globe} 
                                        subtext={`${report.links.external} External links found`} 
                                        color="text-white"
                                        onClick={() => handleMetricClick('links')}
                                    />
                                    <StatCard 
                                        title="Image Issues" 
                                        value={report.images.withoutAlt} 
                                        icon={AlertCircle} 
                                        subtext="Images missing Alt text" 
                                        color={report.images.withoutAlt > 0 ? 'text-brand-500' : 'text-white'}
                                        onClick={() => handleMetricClick('images')}
                                    />
                                    <div 
                                      className="bg-[#2a2a2a] p-4 md:p-6 rounded-xl border border-[#333] hover:border-gray-600 hover:bg-[#333] transition-all group h-full flex flex-col justify-between cursor-pointer"
                                      onClick={onOpenPerformance}
                                    >
                                      <div className="flex justify-between items-start mb-3 md:mb-4">
                                          <h3 className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider">Performance</h3>
                                          <div className="p-2 bg-[#333] rounded-lg group-hover:bg-[#444] transition-colors text-white">
                                              <Gauge size={18} className="md:w-5 md:h-5" />
                                          </div>
                                      </div>
                                      <div className="flex flex-col">
                                          <span className="text-lg md:text-xl font-bold text-white flex items-center gap-2 mb-1 md:mb-2">
                                              Check Speed <ExternalLink size={14} className="text-gray-500 group-hover:text-white transition-colors"/>
                                          </span>
                                          <span className="text-xs md:text-sm text-gray-400">Run Deep PSI & Core Web Vitals Audit</span>
                                      </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technical Details */}
                        <AnalysisDetails report={report} />
                    </div>
                )}

                {activeTab === 'SITE' && (
                    <div className="animate-fade-in">
                        <SiteWideAnalysis pages={report.crawledPages || []} />
                    </div>
                )}

                {activeTab === 'AI' && (
                     <div className="animate-fade-in max-w-4xl mx-auto w-full">
                        <AiReport 
                            aiResult={aiResult}
                            loading={aiStatus === AnalysisStatus.LOADING}
                            onRequest={onRequestAi}
                        />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Dashboard;