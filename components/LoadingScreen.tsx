import React, { useEffect, useState } from 'react';
import { Brain, Search, Database, Activity, Globe, CheckCircle2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Globe, text: "Connecting to target URL..." },
    { icon: Database, text: "Fetching HTML content & Resources..." },
    { icon: Search, text: "Analyzing Semantic Structure..." },
    { icon: Brain, text: "Generating AI Insights..." },
    { icon: Activity, text: "Calculating Final Score..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800); // Change step every 800ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-scan"></div>

      <div className="relative z-10 max-w-md w-full px-6 flex flex-col items-center">
        
        {/* Main Pulse Animation */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse rounded-full"></div>
          <div className="relative bg-[#2a2a2a] w-32 h-32 rounded-2xl border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(220,38,38,0.3)]">
             <img 
                src="CodimAi logo.webp" 
                alt="CodimAi" 
                className="w-24 h-auto animate-pulse" 
             />
          </div>
        </div>

        {/* Text & Steps */}
        <div className="w-full space-y-6">
          <h2 className="text-2xl font-bold text-white text-center tracking-tight">
            Analyzing Web Presence
          </h2>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-[#333] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Steps List */}
          <div className="space-y-3 mt-8">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isPending = index > currentStep;

              return (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    isActive ? 'opacity-100 scale-105 translate-x-2' : 
                    isCompleted ? 'opacity-50' : 'opacity-30'
                  }`}
                >
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center border
                    ${isActive ? 'border-red-500 bg-red-500/20 text-red-500' : 
                      isCompleted ? 'border-green-500 bg-green-500/10 text-green-500' : 
                      'border-gray-600 bg-transparent text-gray-600'}
                  `}>
                    {isCompleted ? <CheckCircle2 size={14} /> : <step.icon size={12} />}
                  </div>
                  <span className={`text-sm ${isActive ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;