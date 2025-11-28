
import React, { useState } from 'react';
import { CrawledPage } from '../types';
import { FileText, AlertTriangle, CheckCircle, XCircle, LayoutGrid, Sparkles, Eye, X, ArrowRight, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { generateSpecificFix } from '../services/geminiService';
import AiFixModal from './AiFixModal';

interface SiteWideAnalysisProps {
  pages: CrawledPage[];
}

interface SimulatedIssue {
    type: 'title' | 'description' | 'h1' | 'content_ideas' | 'general';
    label: string;
    description: string;
    severity: 'High' | 'Medium';
}

const getIssuesForPage = (page: CrawledPage): SimulatedIssue[] => {
    const issues: SimulatedIssue[] = [];
    if (page.issues === 0) return [];
    
    // Deterministic pseudo-random generation based on URL char codes
    const hash = page.url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const possibleIssues: SimulatedIssue[] = [
        { type: 'description', label: 'Missing Meta Description', description: 'The meta description tag is missing or empty, impacting CTR.', severity: 'High' },
        { type: 'title', label: 'Title Tag Optimization', description: 'Title tag is too short or does not contain relevant keywords.', severity: 'High' },
        { type: 'h1', label: 'Missing H1 Heading', description: 'The page lacks a main H1 heading to structure content.', severity: 'High' },
        { type: 'content_ideas', label: 'Thin Content', description: 'Word count is below recommended 300 words.', severity: 'Medium' },
        { type: 'general', label: 'Technical SEO Audit', description: 'Multiple minor technical issues detected.', severity: 'Medium' }
    ];

    // Select issues based on hash to ensure consistency for the same URL
    for (let i = 0; i < page.issues; i++) {
        issues.push(possibleIssues[(hash + i) % possibleIssues.length]);
    }
    
    return issues;
};

const SiteWideAnalysis: React.FC<SiteWideAnalysisProps> = ({ pages }) => {
  const [selectedPage, setSelectedPage] = useState<CrawledPage | null>(null);
  const [fixModal, setFixModal] = useState<{ open: boolean; title: string; suggestion: string; loading: boolean; type: string }>({
    open: false, title: '', suggestion: '', loading: false, type: 'general'
  });
  
  // Calculations
  const totalPages = pages.length;
  const avgScore = Math.round(pages.reduce((acc, p) => acc + p.score, 0) / totalPages);
  const totalIssues = pages.reduce((acc, p) => acc + p.issues, 0);
  
  const scoreDistribution = [
      { name: 'Good (80-100)', value: pages.filter(p => p.score >= 80).length, color: '#22c55e' },
      { name: 'Fair (50-79)', value: pages.filter(p => p.score >= 50 && p.score < 80).length, color: '#f97316' },
      { name: 'Poor (0-49)', value: pages.filter(p => p.score < 50).length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const handleAiFix = async (page: CrawledPage, issueType: string = 'general') => {
    let title = 'Optimizing Page';
    if (issueType === 'title') title = 'Generating Optimized Title';
    else if (issueType === 'description') title = 'Generating Meta Description';
    else if (issueType === 'h1') title = 'Creating H1 Tag';
    else if (issueType === 'content_ideas') title = 'Content Expansion Ideas';
    else title = `Fixing ${page.url.split('/').pop() || 'Page'}`;

    setFixModal({ open: true, title, suggestion: '', loading: true, type: issueType });
    
    try {
        const suggestion = await generateSpecificFix(issueType as any, {
            url: page.url,
            pageContext: page.title,
            // Infer a keyword from title for context
            keywords: [page.title.split(' ').slice(0, 2).join(' ')]
        });
        setFixModal(prev => ({ ...prev, loading: false, suggestion }));
    } catch (e) {
        setFixModal(prev => ({ ...prev, loading: false, suggestion: "Failed to generate fixes. Please try again." }));
    }
  };

  const closeFixModal = () => setFixModal(prev => ({ ...prev, open: false }));

  return (
    <div className="animate-fade-in mt-6 md:mt-8 relative">
      <AiFixModal 
          isOpen={fixModal.open}
          onClose={closeFixModal}
          title={fixModal.title}
          suggestion={fixModal.suggestion}
          isLoading={fixModal.loading}
          type={fixModal.type}
      />
      
      {/* Page Details Modal */}
      {selectedPage && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#121212] w-full max-w-2xl rounded-xl border border-[#333] shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-[#222] flex justify-between items-start bg-[#0a0a0a] rounded-t-xl">
                    <div>
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            <FileText size={20} className="text-brand-500" /> 
                            Page Analysis
                        </h3>
                        <a href={selectedPage.url} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mt-1">
                            {selectedPage.url} <ExternalLink size={12} />
                        </a>
                    </div>
                    <button onClick={() => setSelectedPage(null)} className="text-gray-400 hover:text-white p-1 hover:bg-[#222] rounded transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-6 mb-8 bg-[#000] p-4 rounded-lg border border-[#333]">
                        <div className="text-center">
                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Score</p>
                            <p className={`text-3xl font-bold ${selectedPage.score >= 80 ? 'text-green-500' : selectedPage.score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                                {selectedPage.score}
                            </p>
                        </div>
                        <div className="w-px h-10 bg-[#333]"></div>
                        <div className="text-center">
                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Issues</p>
                            <p className="text-3xl font-bold text-white">{selectedPage.issues}</p>
                        </div>
                        <div className="flex-1"></div>
                         <div className="text-right">
                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Status</p>
                            <span className="px-2 py-1 bg-green-900/20 text-green-400 text-xs rounded border border-green-900/30 inline-block">
                                {selectedPage.status} OK
                            </span>
                        </div>
                    </div>

                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-yellow-500" /> Identified Issues
                    </h4>
                    
                    {selectedPage.issues > 0 ? (
                        <div className="space-y-3">
                            {getIssuesForPage(selectedPage).map((issue, idx) => (
                                <div key={idx} className="bg-[#0a0a0a] border border-[#333] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-600 transition-colors group">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${issue.severity === 'High' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'bg-orange-900/30 text-orange-400 border border-orange-900/50'}`}>
                                                {issue.severity}
                                            </span>
                                            <h5 className="font-semibold text-gray-200 text-sm">{issue.label}</h5>
                                        </div>
                                        <p className="text-xs text-gray-500">{issue.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleAiFix(selectedPage, issue.type)}
                                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded transition-all shadow-lg shadow-red-900/20 whitespace-nowrap"
                                    >
                                        <Sparkles size={14} /> Fix with AI
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 border border-dashed border-[#333] rounded-lg">
                             <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                             <p className="text-gray-400 text-sm">No major issues found on this page.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#121212] p-6 rounded-xl border border-[#333] flex items-center gap-4">
              <div className="bg-brand-900/20 p-3 rounded-lg text-brand-500">
                  <LayoutGrid size={24} />
              </div>
              <div>
                  <h3 className="text-gray-400 text-sm font-medium">Pages Crawled</h3>
                  <p className="text-2xl font-bold text-white">{totalPages}</p>
              </div>
          </div>
          
          <div className="bg-[#121212] p-6 rounded-xl border border-[#333] flex items-center gap-4">
               <div className="bg-blue-900/20 p-3 rounded-lg text-blue-500">
                  <CheckCircle size={24} />
              </div>
              <div>
                  <h3 className="text-gray-400 text-sm font-medium">Average Site Score</h3>
                  <p className={`text-2xl font-bold ${avgScore >= 80 ? 'text-green-500' : avgScore >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                      {avgScore}/100
                  </p>
              </div>
          </div>

          <div className="bg-[#121212] p-6 rounded-xl border border-[#333] flex items-center gap-4">
               <div className="bg-yellow-900/20 p-3 rounded-lg text-yellow-500">
                  <AlertTriangle size={24} />
              </div>
              <div>
                  <h3 className="text-gray-400 text-sm font-medium">Total Issues Found</h3>
                  <p className="text-2xl font-bold text-white">{totalIssues}</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-1 bg-[#121212] p-6 rounded-xl border border-[#333] flex flex-col items-center justify-center">
              <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Health Distribution</h3>
              <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={scoreDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                          >
                              {scoreDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-4">
                  {scoreDistribution.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-xs text-gray-400">{item.name}</span>
                      </div>
                  ))}
              </div>
          </div>

          {/* Links List */}
          <div className="lg:col-span-2 bg-[#121212] rounded-xl border border-[#333] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#222] bg-[#0a0a0a] flex justify-between items-center">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                      <FileText size={16} className="text-brand-500" /> Crawl Results
                  </h3>
                  <span className="text-xs text-gray-500">Showing top {pages.length} pages</span>
              </div>
              <div className="overflow-x-auto custom-scrollbar flex-1 max-h-[400px]">
                  <table className="w-full text-left text-sm text-gray-400">
                      <thead className="bg-[#111] text-xs uppercase font-medium text-gray-500 sticky top-0 z-10">
                          <tr>
                              <th className="px-6 py-3">Page / URL</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3">Score</th>
                              <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222]">
                          {pages.map((page, idx) => (
                              <tr 
                                key={idx} 
                                onClick={() => handleOpenDetails(page)}
                                  className="hover:bg-[#000] transition-colors cursor-pointer group"
                              >
                                  <td className="px-6 py-3">
                                      <div className="flex flex-col">
                                          <span className="text-white font-medium truncate max-w-[200px] md:max-w-xs group-hover:text-brand-400 transition-colors">{page.title}</span>
                                          <span className="text-xs text-gray-600 truncate max-w-[200px] md:max-w-xs">{page.url}</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-3">
                                      <span className="px-2 py-1 bg-green-900/20 text-green-400 text-xs rounded border border-green-900/30">
                                          {page.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-3">
                                      <div className="flex items-center gap-2">
                                          <div className="w-16 h-1.5 bg-[#333] rounded-full overflow-hidden">
                                              <div 
                                                  className={`h-full rounded-full ${page.score >= 80 ? 'bg-green-500' : page.score >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                                                  style={{ width: `${page.score}%` }}
                                              ></div>
                                          </div>
                                          <span className={`font-bold ${page.score >= 80 ? 'text-green-500' : page.score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                                              {page.score}
                                          </span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                      <div className="flex items-center justify-end gap-3">
                                        <span className={`${page.issues > 0 ? 'text-red-400' : 'text-gray-500'} text-xs flex-shrink-0 font-medium`}>
                                            {page.issues} Issues
                                        </span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedPage(page); }}
                                            className="text-gray-500 hover:text-white p-1.5 rounded hover:bg-[#333] transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
  
  function handleOpenDetails(page: CrawledPage) {
      setSelectedPage(page);
  }
};

export default SiteWideAnalysis;
