/**
 * History Component
 * Displays user's analysis history with pagination support.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { apiService, ReportResponse, PaginatedReports } from '../services/apiService';
import { Calendar, Link as LinkIcon, ArrowRight, Loader, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface HistoryProps {
    onSelectReport: (report: any) => void;
}

const History: React.FC<HistoryProps> = ({ onSelectReport }) => {
    const [reports, setReports] = useState<ReportResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(apiService.isAuthenticated());

    const fetchReports = useCallback(async () => {
        // Skip if not authenticated
        if (!apiService.isAuthenticated()) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data: PaginatedReports = await apiService.getReports(page, 10);
            setReports(data.items);
            setTotalPages(data.pages);
        } catch (err: any) {
            // If authentication failed, show login prompt instead of error
            if (err.message?.includes('credentials') || err.message?.includes('401')) {
                apiService.logout(); // Clear invalid token
                setIsAuthenticated(false);
            } else {
                setError(err.message || 'Failed to load history. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDelete = async (e: React.MouseEvent, reportId: number) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this report?')) return;

        setDeletingId(reportId);
        try {
            await apiService.deleteReport(reportId);
            setReports(reports.filter(r => r.id !== reportId));
        } catch (err: any) {
            setError(err.message || 'Failed to delete report.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        // Ensure the date is treated as UTC if no timezone offset is present
        const normalizedDateString = dateString.endsWith('Z') || dateString.includes('+')
            ? dateString
            : `${dateString}Z`;

        const date = new Date(normalizedDateString);
        return {
            date: date.toLocaleDateString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="pt-24 px-4 min-h-[60vh]">
                <div className="max-w-md mx-auto text-center py-12 bg-[#1a1a1a] rounded-xl border border-[#333]">
                    <Calendar className="mx-auto mb-4 text-gray-600" size={48} />
                    <h3 className="text-xl font-semibold text-white mb-2">Sign in to view history</h3>
                    <p className="text-gray-400 text-sm mb-4">Log in to access your saved analysis reports.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="pt-24 px-4 flex justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-red-400">
                    <Loader className="animate-spin" />
                    Loading history...
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 px-4 md:px-8 min-h-[80vh]">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    <Calendar className="text-red-500" />
                    Analysis History
                </h2>

                {error && (
                    <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {reports.length === 0 ? (
                    <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-[#333]">
                        <Calendar className="mx-auto mb-4 text-gray-600" size={48} />
                        <p className="text-gray-400 mb-2">No analysis history found.</p>
                        <p className="text-sm text-gray-500">Run your first SEO analysis to see it here.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4">
                            {reports.map((report) => {
                                const { date, time } = formatDate(report.created_at);
                                return (
                                    <div
                                        key={report.id}
                                        onClick={() => onSelectReport(report.payload)}
                                        className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333] hover:border-red-500/50 hover:bg-[#222] transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors truncate">
                                                    {report.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1 truncate max-w-[200px] md:max-w-none">
                                                        <LinkIcon size={14} className="flex-shrink-0" />
                                                        <span className="truncate">{report.url}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {date} {time}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={(e) => handleDelete(e, report.id)}
                                                    disabled={deletingId === report.id}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-full transition-all"
                                                    title="Delete report"
                                                >
                                                    {deletingId === report.id ? (
                                                        <Loader size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                                <div className="p-2 bg-[#000] rounded-full text-gray-400 group-hover:text-red-400 group-hover:bg-red-900/20 transition-all">
                                                    <ArrowRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-gray-400">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default History;
