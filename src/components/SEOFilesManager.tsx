/**
 * SEO Files Manager Component
 * Check and generate essential SEO files (robots.txt, sitemap.xml, llms.txt).
 * Uses server-side API to keep secrets secure.
 */
import React, { useState } from 'react';
import { FileText, Download, Sparkles, CheckCircle, AlertCircle, Loader2, Globe } from 'lucide-react';
import { apiService } from '../services/apiService';
import { SeoReport } from '../types';

interface SEOFilesManagerProps {
    report: SeoReport;
}

interface FileStatus {
    exists: boolean;
    content?: string;
    loading: boolean;
    error?: string;
}

interface FileStatuses {
    robots: FileStatus;
    sitemap: FileStatus;
    llms: FileStatus;
}

const SEOFilesManager: React.FC<SEOFilesManagerProps> = ({ report }) => {
    const [fileStatuses, setFileStatuses] = useState<FileStatuses>({
        robots: { exists: false, loading: false },
        sitemap: { exists: false, loading: false },
        llms: { exists: false, loading: false },
    });

    const [analyzing, setAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);

    // Check if files exist on the website using server-side fetch
    const analyzeWebsite = async () => {
        setAnalyzing(true);
        const baseUrl = new URL(report.url).origin;

        const checkFile = async (fileName: string): Promise<FileStatus> => {
            try {
                // Use server-side fetch to avoid CORS issues
                const result = await apiService.fetchUrl(`${baseUrl}/${fileName}`);
                const content = result.content.trim();

                // If the response is HTML, the file doesn't exist
                if (
                    content.toLowerCase().startsWith('<!doctype html') ||
                    content.toLowerCase().startsWith('<html') ||
                    content.includes('<head>') ||
                    content.includes('<!DOCTYPE')
                ) {
                    return { exists: false, loading: false };
                }

                // Validate file type specific content
                if (fileName === 'robots.txt' && !content.toLowerCase().includes('user-agent')) {
                    return { exists: false, loading: false };
                }

                if (fileName === 'sitemap.xml' && !content.toLowerCase().includes('<?xml') && !content.includes('urlset')) {
                    return { exists: false, loading: false };
                }

                if (content.length > 0) {
                    return { exists: true, content: result.content, loading: false };
                }

                return { exists: false, loading: false };
            } catch {
                return { exists: false, loading: false };
            }
        };

        const [robots, sitemap, llms] = await Promise.all([
            checkFile('robots.txt'),
            checkFile('sitemap.xml'),
            checkFile('llms.txt'),
        ]);

        setFileStatuses({ robots, sitemap, llms });
        setAnalyzed(true);
        setAnalyzing(false);
    };

    // Generate a specific file with AI via server
    const generateFile = async (fileType: 'robots' | 'sitemap' | 'llms') => {
        setFileStatuses(prev => ({
            ...prev,
            [fileType]: { ...prev[fileType], loading: true, error: undefined }
        }));

        try {
            // Use server-side AI generation
            const result = await apiService.generateSEOFiles(report.url, {
                meta: report.meta,
                links: report.links,
                crawledPages: report.crawledPages
            });

            // Get the appropriate file content
            let content = '';
            switch (fileType) {
                case 'robots':
                    content = result.robots_txt;
                    break;
                case 'sitemap':
                    content = result.sitemap_xml;
                    break;
                case 'llms':
                    content = result.llms_txt;
                    break;
            }

            // Clean markdown artifacts
            content = content.replace(/^```[a-z]*\n?/gm, '').replace(/\n?```$/gm, '').trim();

            setFileStatuses(prev => ({
                ...prev,
                [fileType]: {
                    exists: true,
                    content,
                    loading: false
                }
            }));
        } catch (error: any) {
            setFileStatuses(prev => ({
                ...prev,
                [fileType]: {
                    ...prev[fileType],
                    loading: false,
                    error: error.message || 'Failed to generate file'
                }
            }));
        }
    };

    // Download generated file
    const downloadFile = (fileType: 'robots' | 'sitemap' | 'llms') => {
        const status = fileStatuses[fileType];
        if (!status.content) return;

        const fileName = fileType === 'robots' ? 'robots.txt'
            : fileType === 'sitemap' ? 'sitemap.xml'
                : 'llms.txt';

        const blob = new Blob([status.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const FileCard: React.FC<{
        title: string;
        description: string;
        fileType: 'robots' | 'sitemap' | 'llms';
        status: FileStatus;
    }> = ({ title, description, fileType, status }) => {
        const getStatusIcon = () => {
            if (status.loading) return <Loader2 className="text-blue-500 animate-spin" size={20} />;
            if (status.error) return <AlertCircle className="text-red-500" size={20} />;
            if (status.exists) return <CheckCircle className="text-green-500" size={20} />;
            return <AlertCircle className="text-yellow-500" size={20} />;
        };

        const getStatusText = () => {
            if (status.loading) return 'Generating...';
            if (status.error) return status.error;
            if (status.exists && analyzed) return 'File Found';
            if (status.exists && !analyzed) return 'Generated';
            return 'Not Found';
        };

        return (
            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333] hover:border-[#555] transition-all group">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#2a2a2a] rounded-lg group-hover:bg-[#333] transition-colors">
                            <FileText className="text-red-500" size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm">{title}</h4>
                            <p className="text-gray-500 text-xs mt-0.5">{description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2a2a2a]">
                    <span className="text-xs text-gray-400">{getStatusText()}</span>
                    <div className="flex gap-2">
                        {!status.exists && !status.loading && (
                            <button
                                onClick={() => generateFile(fileType)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-all"
                            >
                                <Sparkles size={14} />
                                Generate with AI
                            </button>
                        )}
                        {status.exists && status.content && (
                            <button
                                onClick={() => downloadFile(fileType)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] text-white text-xs rounded transition-all"
                            >
                                <Download size={14} />
                                Download
                            </button>
                        )}
                    </div>
                </div>

                {status.content && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                        <pre className="bg-[#0a0a0a] p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-40 overflow-y-auto border border-[#2a2a2a]">
                            {status.content.substring(0, 500)}{status.content.length > 500 ? '...' : ''}
                        </pre>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-[#111] rounded-xl border border-[#333] p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/10 rounded-lg">
                        <Globe className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">SEO Files Manager</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Check and generate essential SEO files for your website
                        </p>
                    </div>
                </div>

                {!analyzed && (
                    <button
                        onClick={analyzeWebsite}
                        disabled={analyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Analyze Website
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FileCard
                    title="robots.txt"
                    description="Controls search engine crawling"
                    fileType="robots"
                    status={fileStatuses.robots}
                />
                <FileCard
                    title="sitemap.xml"
                    description="Helps search engines index your site"
                    fileType="sitemap"
                    status={fileStatuses.sitemap}
                />
                <FileCard
                    title="llms.txt"
                    description="Optimizes for AI search engines"
                    fileType="llms"
                    status={fileStatuses.llms}
                />
            </div>

            {!analyzed && (
                <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
                    <p className="text-sm text-gray-400 text-center">
                        Click "Analyze Website" to check if these files exist on your website.
                        If they don't exist, you can generate them with AI.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SEOFilesManager;
