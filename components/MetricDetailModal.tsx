import React, { useState, useEffect } from 'react';
import { SeoReport } from '../types';
import { X, Sparkles, FileText, Link as LinkIcon, Image as ImageIcon, Loader2, Copy, Check, Activity, Smartphone, ArrowRight } from 'lucide-react';
import { generateSpecificFix } from '../services/geminiService';

interface MetricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: 'score' | 'words' | 'links' | 'images' | null;
  report: SeoReport;
}

const MetricDetailModal: React.FC<MetricDetailModalProps> = ({ isOpen, onClose, metricType, report }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [activeFixId, setActiveFixId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset state when metric type changes or modal is closed/opened
  useEffect(() => {
    setSuggestion(null);
    setActiveFixId(null);
    setLoading(false);
  }, [metricType, isOpen]);

  if (!isOpen || !metricType) return null;

  const handleFix = async (fixType: any, context?: any, id?: string) => {
    setLoading(true);
    setActiveFixId(id || 'main');
    setSuggestion(null);
    try {
        const keywords = report.keywords.map(k => k.word).slice(0, 5);
        const result = await generateSpecificFix(fixType, {
            ...context,
            keywords,
            pageContext: report.meta.title || report.url
        });
        setSuggestion(result);
    } catch (e) {
        setSuggestion("Failed to generate fix. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleCopy = () => {
    if (suggestion) {
        navigator.clipboard.writeText(suggestion);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderContent = () => {
      switch(metricType) {
          case 'words':
              return (
                  <div className="space-y-6">
                      <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] flex items-center justify-between">
                           <div>
                               <h4 className="text-gray-400 text-sm mb-1">Total Word Count</h4>
                               <p className="text-3xl font-bold text-white">{report.wordCount}</p>
                           </div>
                           <div className={`px-3 py-1 rounded-full text-xs font-bold ${report.wordCount > 300 ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                {report.wordCount > 300 ? 'Healthy Amount' : 'Thin Content'}
                           </div>
                      </div>
                      
                      <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <FileText size={16} className="text-brand-500" /> Content Analysis
                          </h4>
                          <p className="text-gray-400 text-sm leading-relaxed mb-4">
                              {report.wordCount < 300 
                                ? "Your page content is too short for optimal ranking. Search engines prefer in-depth content that thoroughly covers the topic."
                                : "Your content length is good. Focus on semantic richness and keyword coverage."}
                          </p>
                          <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4">
                              <div className="flex justify-between items-center mb-4">
                                  <span className="text-sm font-medium text-gray-300">Top Keywords Found</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                  {report.keywords.slice(0, 6).map((k, i) => (
                                      <span key={i} className="bg-[#1a1a1a] text-gray-400 text-xs px-2 py-1 rounded border border-[#333]">
                                          {k.word} ({k.count})
                                      </span>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {!suggestion ? (
                          <button 
                            onClick={() => handleFix('content_ideas', { currentValue: `Current count: ${report.wordCount}` })}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                            disabled={loading}
                          >
                              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                              {loading ? 'Analyzing Content...' : 'Generate Content Expansion Ideas'}
                          </button>
                      ) : renderSuggestion()}
                  </div>
              );
        
          case 'links':
              return (
                  <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                               <h4 className="text-gray-400 text-sm mb-1">Internal Links</h4>
                               <p className="text-2xl font-bold text-white">{report.links.internal}</p>
                          </div>
                          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                               <h4 className="text-gray-400 text-sm mb-1">External Links</h4>
                               <p className="text-2xl font-bold text-white">{report.links.external}</p>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <LinkIcon size={16} className="text-brand-500" /> Link Strategy
                          </h4>
                          <p className="text-gray-400 text-sm leading-relaxed mb-4">
                              Internal links help distribute page authority and guide users. External links to authoritative sources build credibility.
                          </p>
                      </div>

                      {!suggestion ? (
                          <button 
                            onClick={() => handleFix('link_strategy', { currentValue: `Internal: ${report.links.internal}, External: ${report.links.external}` })}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                            disabled={loading}
                          >
                              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                              {loading ? 'Formulating Strategy...' : 'Suggest Internal Linking Strategy'}
                          </button>
                      ) : renderSuggestion()}
                  </div>
              );

          case 'images':
               const missingAlt = report.images.details.filter(i => !i.alt);
               return (
                  <div className="space-y-6">
                      <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] flex items-center justify-between">
                           <div>
                               <h4 className="text-gray-400 text-sm mb-1">Missing Alt Text</h4>
                               <p className="text-3xl font-bold text-white">{report.images.withoutAlt}</p>
                           </div>
                           <div className="text-right">
                               <p className="text-xs text-gray-500">Total Images</p>
                               <p className="text-sm font-bold text-gray-300">{report.images.total}</p>
                           </div>
                      </div>

                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-3">
                          {missingAlt.length > 0 ? missingAlt.map((img, idx) => (
                              <div key={idx} className="bg-[#0a0a0a] border border-[#333] p-3 rounded-lg group hover:border-brand-500/30 transition-colors">
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                      <span className="text-xs text-gray-400 font-mono truncate flex-1 block" title={img.src}>
                                          {img.src}
                                      </span>
                                      <span className="text-[10px] text-red-400 font-bold uppercase whitespace-nowrap">Missing Alt</span>
                                  </div>
                                  
                                  {activeFixId === `img-${idx}` && suggestion ? (
                                      <div className="mt-2 bg-[#1a1a1a] p-2 rounded border border-brand-500/30 text-sm text-white">
                                          <div className="flex justify-between items-start">
                                              <span>{suggestion}</span>
                                              <button onClick={handleCopy} className="text-gray-500 hover:text-white">
                                                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                              </button>
                                          </div>
                                      </div>
                                  ) : (
                                    <button 
                                        onClick={() => handleFix('alt', { url: img.src }, `img-${idx}`)}
                                        className="text-xs flex items-center gap-1 text-brand-500 hover:text-brand-400 font-medium"
                                        disabled={loading && activeFixId !== null}
                                    >
                                        {loading && activeFixId === `img-${idx}` ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                        Generate Alt Text
                                    </button>
                                  )}
                              </div>
                          )) : (
                              <div className="text-center py-8 text-gray-500">
                                  <Check size={32} className="mx-auto mb-2 text-green-500" />
                                  <p>All images have alt text!</p>
                              </div>
                          )}
                      </div>
                  </div>
              );

          case 'score':
              return (
                  <div className="space-y-6">
                       <div className="flex justify-center mb-6">
                           <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 ${report.score >= 80 ? 'border-green-500 text-green-500' : report.score >= 50 ? 'border-orange-500 text-orange-500' : 'border-red-500 text-red-500'}`}>
                               <span className="text-4xl font-bold">{report.score}</span>
                           </div>
                       </div>

                       <div className="space-y-3">
                           <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] flex justify-between items-center">
                               <span className="text-sm text-gray-300 flex items-center gap-2"><Smartphone size={16} /> Viewport Meta Tag</span>
                               {report.meta.viewport ? (
                                   <span className="text-xs bg-green-900/20 text-green-500 px-2 py-1 rounded">Configured</span>
                               ) : (
                                   <button 
                                      onClick={() => handleFix('viewport', {}, 'viewport')}
                                      className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300"
                                   >
                                       <Sparkles size={12} /> Fix Missing
                                   </button>
                               )}
                           </div>
                           <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] flex justify-between items-center">
                               <span className="text-sm text-gray-300 flex items-center gap-2"><Activity size={16} /> Robots.txt</span>
                               {report.meta.robots ? (
                                   <span className="text-xs bg-green-900/20 text-green-500 px-2 py-1 rounded">Found</span>
                               ) : (
                                   <span className="text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded">Not detected</span>
                               )}
                           </div>
                       </div>

                       {activeFixId === 'viewport' && suggestion && (
                           renderSuggestion()
                       )}
                  </div>
              );
          default:
              return null;
      }
  };

  const renderSuggestion = () => (
      <div className="bg-[#000] border border-brand-500/30 rounded-lg p-4 relative animate-fade-in mt-4">
          <p className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-wider flex items-center gap-2">
              <Sparkles size={12} className="text-brand-500" /> AI Recommendation
          </p>
          <div className="text-sm text-gray-200 font-mono whitespace-pre-wrap break-words max-h-[40vh] overflow-y-auto custom-scrollbar">
            {suggestion}
          </div>
          <button 
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
          >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
      </div>
  );

  const getTitle = () => {
      switch(metricType) {
          case 'words': return 'Content Analysis';
          case 'links': return 'Link Structure';
          case 'images': return 'Image Audit';
          case 'score': return 'Technical Health';
          default: return 'Details';
      }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121212] w-full max-w-md rounded-xl border border-[#333] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#0a0a0a]">
          <h3 className="font-bold text-white text-base">{getTitle()}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MetricDetailModal;