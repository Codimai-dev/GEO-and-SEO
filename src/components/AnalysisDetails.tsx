/**
 * Analysis Details Component
 * Displays detailed SEO analysis with AI-powered fix suggestions.
 * Uses server-side API for AI operations.
 */
import React, { useState } from 'react';
import { SeoReport } from '../types';
import { CheckCircle, XCircle, Search, Type, Image, Share2, Hash, Sparkles } from 'lucide-react';
import { apiService } from '../services/apiService';
import AiFixModal from './AiFixModal';

interface AnalysisDetailsProps {
    report: SeoReport;
}

const AnalysisDetails: React.FC<AnalysisDetailsProps> = ({ report }) => {
    const [fixModal, setFixModal] = useState<{
        open: boolean;
        type: string;
        title: string;
        suggestion: string;
        loading: boolean
    }>({
        open: false, type: '', title: '', suggestion: '', loading: false
    });

    const handleFixRequest = async (type: 'title' | 'description' | 'h1' | 'alt', contextData: any) => {
        let title = '';
        if (type === 'title') title = 'Optimizing Title Tag';
        else if (type === 'description') title = 'Optimizing Meta Description';
        else if (type === 'h1') title = 'Optimizing Heading';
        else if (type === 'alt') title = 'Generating Alt Text';

        setFixModal({ open: true, type, title, suggestion: '', loading: true });

        try {
            const keywords = report.keywords.map(k => k.word).slice(0, 5);
            const pageContext = report.meta.title || report.url;

            // Use server-side AI endpoint
            const result = await apiService.getSpecificFix(type, {
                ...contextData,
                keywords,
                pageContext
            });

            const suggestion = result.explanation + (result.code_example ? `\n\nExample:\n${result.code_example}` : '');
            setFixModal(prev => ({ ...prev, loading: false, suggestion }));
        } catch (e) {
            setFixModal(prev => ({ ...prev, loading: false, suggestion: "Failed to generate fix. Please try again." }));
        }
    };

    const closeFixModal = () => setFixModal(prev => ({ ...prev, open: false }));

    const StatusIcon = ({ condition }: { condition: boolean }) => {
        return condition
            ? <CheckCircle className="text-green-500 w-4 h-4 md:w-5 md:h-5" />
            : <XCircle className="text-red-500 w-4 h-4 md:w-5 md:h-5" />;
    };

    const BoolCheck = ({ val }: { val: boolean }) => (
        val ? <span className="text-green-400">Yes</span> : <span className="text-gray-600">No</span>
    );

    return (
        <div className="space-y-4 md:space-y-6 mt-6">
            {/* AI Fix Modal */}
            <AiFixModal
                isOpen={fixModal.open}
                onClose={closeFixModal}
                title={fixModal.title}
                suggestion={fixModal.suggestion}
                isLoading={fixModal.loading}
                type={fixModal.type}
            />

            {/* Meta Tags Section */}
            <div className="bg-[#121212] rounded-xl border border-[#222] overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#222] flex items-center gap-3 bg-[#0a0a0a]">
                    <Search className="text-red-500" size={18} />
                    <h3 className="font-semibold text-white text-sm md:text-base">Meta Data</h3>
                </div>
                <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-xs md:text-sm font-medium">Page Title</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleFixRequest('title', { currentValue: report.meta.title })}
                                    className="text-[10px] flex items-center gap-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 px-2 py-1 rounded transition-colors border border-red-900/30"
                                >
                                    <Sparkles size={10} /> Fix with AI
                                </button>
                                <span className={`text-[10px] md:text-xs px-2 py-1 rounded ${report.meta.title && report.meta.title.length <= 60 && report.meta.title.length >= 10
                                        ? 'bg-green-900/20 text-green-400'
                                        : 'bg-red-900/20 text-red-400'
                                    }`}>
                                    {report.meta.title?.length || 0} / 60 chars
                                </span>
                            </div>
                        </div>
                        <div className="bg-[#000] p-3 rounded border border-[#222] text-white text-xs md:text-sm font-medium">
                            {report.meta.title || <span className="text-red-400 italic">Missing Title Tag</span>}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-xs md:text-sm font-medium">Meta Description</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleFixRequest('description', { currentValue: report.meta.description })}
                                    className="text-[10px] flex items-center gap-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 px-2 py-1 rounded transition-colors border border-red-900/30"
                                >
                                    <Sparkles size={10} /> Fix with AI
                                </button>
                                <span className={`text-[10px] md:text-xs px-2 py-1 rounded ${report.meta.description && report.meta.description.length <= 160 && report.meta.description.length >= 50
                                        ? 'bg-green-900/20 text-green-400'
                                        : 'bg-red-900/20 text-red-400'
                                    }`}>
                                    {report.meta.description?.length || 0} / 160 chars
                                </span>
                            </div>
                        </div>
                        <div className="bg-[#000] p-3 rounded border border-[#222] text-gray-300 text-xs md:text-sm">
                            {report.meta.description || <span className="text-red-400 italic">Missing Meta Description</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Keyword Consistency */}
            <div className="bg-[#121212] rounded-xl border border-[#222] overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#222] flex items-center gap-3 bg-[#0a0a0a]">
                    <Hash className="text-red-500" size={18} />
                    <h3 className="font-semibold text-white text-sm md:text-base">Keyword Consistency</h3>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-xs md:text-sm text-left text-gray-400">
                        <thead className="text-[10px] md:text-xs text-gray-500 uppercase bg-[#0a0a0a]">
                            <tr>
                                <th className="px-4 md:px-6 py-3">Keyword</th>
                                <th className="px-4 md:px-6 py-3">Freq</th>
                                <th className="px-4 md:px-6 py-3">Title</th>
                                <th className="px-4 md:px-6 py-3">Desc</th>
                                <th className="px-4 md:px-6 py-3">H1</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.keywords.slice(0, 5).map((k, i) => (
                                <tr key={i} className="border-b border-[#222] hover:bg-[#000]">
                                    <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-white">{k.word}</td>
                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                        {k.count} <span className="text-[10px] text-gray-600">({k.density.toFixed(1)}%)</span>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4"><BoolCheck val={k.inTitle} /></td>
                                    <td className="px-4 md:px-6 py-3 md:py-4"><BoolCheck val={k.inDescription} /></td>
                                    <td className="px-4 md:px-6 py-3 md:py-4"><BoolCheck val={k.inH1} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Social Previews */}
            <div className="bg-[#121212] rounded-xl border border-[#222] overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#222] flex items-center gap-3 bg-[#0a0a0a]">
                    <Share2 className="text-red-500" size={18} />
                    <h3 className="font-semibold text-white text-sm md:text-base">Social Media Preview</h3>
                </div>
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Facebook / OG */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Facebook / Open Graph</span>
                        <div className="border border-gray-700 rounded overflow-hidden bg-[#000] max-w-sm mx-auto md:mx-0 w-full shadow-lg">
                            <div className="h-32 md:h-40 bg-[#222] relative flex items-center justify-center overflow-hidden group">
                                {report.social.ogImage ? (
                                    <img src={report.social.ogImage} alt="OG Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <span className="text-gray-600 text-xs">No OG Image</span>
                                )}
                            </div>
                            <div className="p-3 bg-[#18191a]">
                                <p className="text-[#b0b3b8] text-[10px] uppercase mb-1 truncate">{new URL(report.url).hostname}</p>
                                <p className="text-[#e4e6eb] font-bold text-xs md:text-sm truncate leading-tight mb-1">
                                    {report.social.ogTitle || report.meta.title || 'Missing Title'}
                                </p>
                                <p className="text-[#b0b3b8] text-[10px] md:text-xs line-clamp-2">
                                    {report.social.ogDescription || report.meta.description || 'Missing Description'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Twitter / X */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Twitter / X Card</span>
                        <div className="border border-gray-700 rounded-xl overflow-hidden bg-black max-w-sm mx-auto md:mx-0 w-full shadow-lg">
                            <div className="h-32 md:h-40 bg-[#222] relative flex items-center justify-center overflow-hidden group">
                                {(report.social.twitterImage || report.social.ogImage) ? (
                                    <img
                                        src={report.social.twitterImage || report.social.ogImage || ''}
                                        alt="Twitter Preview"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <span className="text-gray-600 text-xs">No Image</span>
                                )}
                            </div>
                            <div className="p-3">
                                <p className="text-white font-bold text-xs md:text-sm truncate mb-1">
                                    {report.social.twitterTitle || report.social.ogTitle || report.meta.title || 'Missing Title'}
                                </p>
                                <p className="text-gray-500 text-[10px] md:text-xs line-clamp-2">
                                    {report.social.twitterDescription || report.social.ogDescription || report.meta.description || 'Missing Description'}
                                </p>
                                <p className="text-gray-500 text-[10px] mt-2 flex items-center gap-1">
                                    <span className="w-3 h-3 bg-[#333] rounded-full inline-block"></span>
                                    {new URL(report.url).hostname}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Structure & Assets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-[#121212] rounded-xl border border-[#222] overflow-hidden">
                    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#222] flex items-center gap-3 bg-[#0a0a0a]">
                        <Type className="text-red-500" size={18} />
                        <h3 className="font-semibold text-white text-sm md:text-base">Headings</h3>
                    </div>
                    <div className="p-4 md:p-6">
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-gray-400 text-sm">H1 Tags</span>
                            <div className="flex items-center gap-2">
                                {(report.headings.h1.length === 0 || report.headings.h1.length > 1) && (
                                    <button
                                        onClick={() => handleFixRequest('h1', { currentValue: report.headings.h1.join(' ') })}
                                        className="text-[10px] flex items-center gap-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 px-2 py-1 rounded transition-colors border border-red-900/30"
                                    >
                                        <Sparkles size={10} /> Fix with AI
                                    </button>
                                )}
                                <span className="text-white font-bold text-sm">{report.headings.h1.length}</span>
                                <StatusIcon condition={report.headings.h1.length === 1} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-gray-400 text-sm">H2 Tags</span>
                            <span className="text-white font-bold text-sm">{report.headings.h2.length}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-gray-400 text-sm">H3 Tags</span>
                            <span className="text-white font-bold text-sm">{report.headings.h3.length}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">H1 Content</p>
                            {report.headings.h1.length > 0 ? (
                                report.headings.h1.map((h, i) => (
                                    <p key={i} className="text-xs md:text-sm text-white mb-1 truncate">• {h}</p>
                                ))
                            ) : (
                                <p className="text-xs md:text-sm text-red-400">Missing H1 tag</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-[#121212] rounded-xl border border-[#222] overflow-hidden">
                    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#222] flex items-center gap-3 bg-[#0a0a0a]">
                        <Image className="text-red-500" size={18} />
                        <h3 className="font-semibold text-white text-sm md:text-base">Assets</h3>
                    </div>
                    <div className="p-4 md:p-6">
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-gray-400 text-sm">Total Images</span>
                            <span className="text-white font-bold text-sm">{report.images.total}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#222]">
                            <span className="text-gray-400 text-sm">Missing Alt Text</span>
                            <div className="flex items-center gap-2">
                                <span className={`${report.images.withoutAlt > 0 ? 'text-red-400' : 'text-white'} font-bold text-sm`}>
                                    {report.images.withoutAlt}
                                </span>
                                <StatusIcon condition={report.images.withoutAlt === 0} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Examples (Missing Alt)</p>
                            {report.images.details.filter(i => !i.alt).length > 0 ? (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {report.images.details.filter(i => !i.alt).slice(0, 5).map((img, i) => (
                                        <div key={i} className="text-[10px] text-red-300 bg-red-900/10 p-2 rounded flex justify-between items-center gap-2 group">
                                            <span className="truncate flex-1">{img.src}</span>
                                            <button
                                                onClick={() => handleFixRequest('alt', { url: img.src })}
                                                className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-all"
                                                title="Generate Alt Text"
                                            >
                                                <Sparkles size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400">All sampled images have alt text.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisDetails;
