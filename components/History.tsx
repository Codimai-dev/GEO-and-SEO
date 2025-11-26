import React, { useEffect, useState } from 'react';
import { apiService, Report } from '../services/apiService';
import { Calendar, Link as LinkIcon, ArrowRight, Loader } from 'lucide-react';

interface HistoryProps {
    onSelectReport: (report: any) => void;
}

const History: React.FC<HistoryProps> = ({ onSelectReport }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await apiService.getReports();
                // Sort by newest first
                setReports(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            } catch (err) {
                setError('Failed to load history. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] pt-32 px-4 flex justify-center">
                <div className="flex items-center gap-3 text-brand-400">
                    <Loader className="animate-spin" /> Loading history...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    <Calendar className="text-brand-500" /> Analysis History
                </h2>

                {error && (
                    <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {reports.length === 0 ? (
                    <div className="text-center py-12 bg-[#2a2a2a] rounded-xl border border-[#333]">
                        <p className="text-gray-400 mb-4">No analysis history found.</p>
                        <p className="text-sm text-gray-500">Run your first SEO analysis to see it here.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                onClick={() => onSelectReport(report.payload)}
                                className="bg-[#2a2a2a] p-6 rounded-xl border border-[#333] hover:border-brand-500/50 hover:bg-[#333] transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors">
                                            {report.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <LinkIcon size={14} /> {report.url}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> {new Date(report.created_at).toLocaleDateString()} {new Date(report.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-[#1a1a1a] rounded-full text-gray-400 group-hover:text-brand-400 group-hover:bg-brand-900/20 transition-all">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
