
import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Loader2 } from 'lucide-react';

interface AiFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  suggestion: string;
  isLoading: boolean;
  type: string;
}

const AiFixModal: React.FC<AiFixModalProps> = ({ isOpen, onClose, title, suggestion, isLoading, type }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121212] w-full max-w-2xl rounded-xl border border-red-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#0a0a0a] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-900/20 rounded-md border border-red-500/20">
              <Sparkles className="text-red-500" size={16} />
            </div>
            <h3 className="font-bold text-white text-sm md:text-base">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[200px] gap-4">
              <div className="relative">
                 <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
                 <Loader2 className="animate-spin text-red-500 relative z-10" size={32} />
              </div>
              <p className="text-gray-400 text-sm animate-pulse">Generating optimization...</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              <p className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-wider">Suggested Fix</p>
              <div className="bg-[#000] border border-[#333] rounded-lg p-4 relative group flex-1 overflow-hidden flex flex-col">
                <div className="text-gray-200 text-sm md:text-base leading-relaxed pr-8 font-mono whitespace-pre-wrap break-words overflow-y-auto custom-scrollbar max-h-[60vh]">
                  {suggestion}
                </div>
                <button 
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 rounded-md hover:bg-[#222] text-gray-400 hover:text-white transition-colors bg-[#000]/50 backdrop-blur-sm border border-[#333]"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="mt-4 text-[10px] text-gray-600 text-center">
                AI generated suggestions may vary. Review before implementing.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && (
            <div className="p-4 border-t border-[#222] bg-[#0a0a0a] flex justify-end flex-shrink-0">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-[#222] hover:bg-[#333] text-white text-sm font-medium rounded-lg transition-colors border border-[#333]"
            >
                Done
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AiFixModal;
