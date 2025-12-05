/**
 * CodimAI - SEO & Performance Analysis Tool
 * Main Application Component
 */
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from './services/apiService';
import { SeoReport, AiAnalysisResult, AnalysisStatus, PageSpeedResult, PerformanceAiAnalysis } from './types';

import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DashboardHome from './components/DashboardHome';
import LoadingScreen from './components/LoadingScreen';
import PerformanceAnalysis from './components/PerformanceAnalysis';

// Page Components
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Auth from './components/Auth';
import History from './components/History';

type PageType = 'LANDING' | 'DASHBOARD' | 'PRICING' | 'LOGIN' | 'SIGNUP' | 'CONTACT' | 'HISTORY';

// URL Utilities
const normalizeUrl = (inputUrl: string): string => {
  let normalized = inputUrl.trim();
  if (!normalized) return '';
  normalized = normalized.replace(/\s+/g, '');
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }
  return normalized;
};

const pageToPath = (page: PageType, section?: string): string => {
  switch (page) {
    case 'DASHBOARD': return '/dashboard';
    case 'PRICING': return '/pricing';
    case 'CONTACT': return '/contact';
    case 'LOGIN': return '/login';
    case 'SIGNUP': return '/signup';
    case 'HISTORY': return '/history';
    case 'LANDING':
    default:
      if (section === 'products') return '/products';
      if (section === 'features') return '/features';
      if (section === 'services') return '/services';
      return '/';
  }
};

const pathToPage = (path: string): { page: PageType; section?: string } => {
  switch (path) {
    case '/dashboard': return { page: 'DASHBOARD' };
    case '/pricing': return { page: 'PRICING' };
    case '/contact': return { page: 'CONTACT' };
    case '/login': return { page: 'LOGIN' };
    case '/signup': return { page: 'SIGNUP' };
    case '/history': return { page: 'HISTORY' };
    case '/products': return { page: 'LANDING', section: 'products' };
    case '/features': return { page: 'LANDING', section: 'features' };
    case '/services': return { page: 'LANDING', section: 'services' };
    default: return { page: 'LANDING' };
  }
};

const App: React.FC = () => {
  // Navigation State
  const [page, setPage] = useState<PageType>('LANDING');

  // Analysis State
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [report, setReport] = useState<SeoReport | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  // SEO AI State
  const [aiStatus, setAiStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);

  // Performance State
  const [perfStatus, setPerfStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [psiResults, setPsiResults] = useState<{ mobile: PageSpeedResult | null; desktop: PageSpeedResult | null }>({ mobile: null, desktop: null });
  const [perfAiResult, setPerfAiResult] = useState<PerformanceAiAnalysis | null>(null);
  const [showPerfModal, setShowPerfModal] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Navigation Handler
  const handleNavigate = useCallback((
    newPage: PageType,
    section?: string,
    replace = false,
    resetReport = false
  ) => {
    const path = pageToPath(newPage, section);
    try {
      if (replace) {
        window.history.replaceState({}, '', path);
      } else {
        window.history.pushState({}, '', path);
      }
    } catch {
      // Fallback for environments where history API fails
    }
    setPage(newPage);

    if (resetReport) {
      setReport(null);
      setAiResult(null);
      setStatus(AnalysisStatus.IDLE);
      setErrorMsg(null);
      setIsSimulated(false);
      setUrl('');
    }

    if (newPage === 'LANDING' && section) {
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Handle selecting a report from history
  const handleHistorySelect = useCallback((savedReportPayload: any) => {
    let parsedReport = savedReportPayload;
    if (typeof savedReportPayload === 'string') {
      try {
        parsedReport = JSON.parse(savedReportPayload);
      } catch (e) {
        console.error('Failed to parse report payload', e);
        return;
      }
    }
    setReport(parsedReport);
    handleNavigate('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [handleNavigate]);

  // Main Analysis Handler - Now uses server-side API
  const handleAnalyze = async (overrideUrl?: string) => {
    const rawTarget = overrideUrl || url;
    if (!rawTarget) return;

    const target = normalizeUrl(rawTarget);
    if (!target) return;

    // Require authentication
    if (!apiService.isAuthenticated()) {
      handleNavigate('LOGIN');
      return;
    }

    setStatus(AnalysisStatus.LOADING);
    setReport(null);
    setAiResult(null);
    setAiStatus(AnalysisStatus.IDLE);
    setIsSimulated(false);
    setPerfStatus(AnalysisStatus.IDLE);
    setPsiResults({ mobile: null, desktop: null });
    setPerfAiResult(null);
    setErrorMsg(null);

    try {
      // Use server-side SEO analysis
      const seoData = await apiService.analyzeSEO(target, true, 50);

      setReport(seoData);
      setStatus(AnalysisStatus.SUCCESS);
      handleNavigate('DASHBOARD');

      // Save report to backend
      try {
        await apiService.createReport({
          title: seoData.meta?.title || `SEO Report for ${target}`,
          url: target,
          payload: JSON.stringify(seoData)
        });
      } catch (err) {
        console.warn('Failed to save report:', err);
      }

    } catch (error: any) {
      console.error('Analysis failed:', error);
      setErrorMsg(error.message || 'Failed to analyze the URL. Please try again.');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  // AI SEO Recommendations - Now uses server-side API
  const handleAiRequest = async () => {
    if (!report) return;
    setAiStatus(AnalysisStatus.LOADING);
    try {
      const recommendations = await apiService.getSEOAudit(report.url, report);
      setAiResult(recommendations);
      setAiStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiStatus(AnalysisStatus.ERROR);
    }
  };

  // Performance Analysis - Now uses server-side API
  const handlePerformanceRequest = async (targetUrl?: string) => {
    const target = targetUrl || url || (report ? report.url : '');
    if (!target) return;

    if (!url) setUrl(target);
    setShowPerfModal(true);

    // Skip if already have data
    if (psiResults.mobile && psiResults.desktop && perfAiResult) return;

    setPerfStatus(AnalysisStatus.LOADING);
    try {
      // Run PSI for both strategies via server-side API
      const [mobileData, desktopData] = await Promise.all([
        apiService.runPageSpeed(target, 'mobile'),
        apiService.runPageSpeed(target, 'desktop')
      ]);

      // Transform server response to match frontend types
      const transformPSI = (data: any): PageSpeedResult => ({
        performanceScore: data.performance_score,
        coreWebVitals: data.core_web_vitals,
        failedAudits: data.failed_audits,
        screenshot: data.screenshot
      });

      setPsiResults({
        mobile: transformPSI(mobileData),
        desktop: transformPSI(desktopData)
      });

      // Get AI analysis via server
      const aiData = await apiService.getPerformanceGuide({
        performanceScore: mobileData.performance_score,
        coreWebVitals: mobileData.core_web_vitals,
        failedAudits: mobileData.failed_audits
      });

      setPerfAiResult(aiData);
      setPerfStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error('Performance analysis failed:', error);
      setPerfStatus(AnalysisStatus.ERROR);
    }
  };

  // Reset Handler
  const handleReset = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setReport(null);
    setAiResult(null);
    setStatus(AnalysisStatus.IDLE);
    setErrorMsg(null);
    setIsSimulated(false);
    setUrl('');
    handleNavigate('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // URL-based routing on mount and popstate
  useEffect(() => {
    const result = pathToPage(window.location.pathname);
    handleNavigate(result.page, result.section, true);

    const onPop = () => {
      const r = pathToPage(window.location.pathname);
      setPage(r.page);
      if (r.page === 'LANDING' && r.section) {
        setTimeout(() => {
          const el = document.getElementById(r.section!);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [handleNavigate]);

  // Render Content
  const renderContent = () => {
    if (status === AnalysisStatus.LOADING) return <LoadingScreen />;

    switch (page) {
      case 'DASHBOARD':
        if (!report) {
          return <DashboardHome onStart={(u: string) => handleAnalyze(u)} onSelectReport={handleHistorySelect} />;
        }
        return (
          <>
            {isSimulated && (
              <div className="bg-orange-900/80 text-orange-100 text-center px-4 py-2 text-sm font-medium border-b border-orange-700/50 backdrop-blur-sm fixed top-[65px] md:top-[73px] z-50 w-full animate-fade-in">
                Analysis simulated due to site access restrictions. Metrics are approximate.
              </div>
            )}
            <Dashboard
              report={report}
              loading={false}
              onReset={handleReset}
              aiStatus={aiStatus}
              aiResult={aiResult}
              onRequestAi={handleAiRequest}
              onOpenPerformance={handlePerformanceRequest}
              onSelectReport={handleHistorySelect}
            />
          </>
        );

      case 'HISTORY':
        return <History onSelectReport={handleHistorySelect} />;

      case 'PRICING':
        return <Pricing />;

      case 'CONTACT':
        return <Contact />;

      case 'LOGIN':
        return (
          <Auth
            mode="login"
            onToggleMode={(mode) => handleNavigate(mode === 'login' ? 'LOGIN' : 'SIGNUP')}
            onSuccess={() => handleNavigate('DASHBOARD')}
          />
        );

      case 'SIGNUP':
        return (
          <Auth
            mode="signup"
            onToggleMode={(mode) => handleNavigate(mode === 'login' ? 'LOGIN' : 'SIGNUP')}
            onSuccess={() => handleNavigate('DASHBOARD')}
          />
        );

      case 'LANDING':
      default:
        return (
          <LandingPage
            url={url}
            setUrl={setUrl}
            onAnalyze={handleAnalyze}
            status={status}
            errorMsg={errorMsg}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="bg-[#000] min-h-screen text-white">
      <NavBar onNavigate={handleNavigate} />

      {renderContent()}

      {showPerfModal && (
        <PerformanceAnalysis
          mobileResult={psiResults.mobile}
          desktopResult={psiResults.desktop}
          aiAnalysis={perfAiResult}
          status={perfStatus}
          onClose={() => setShowPerfModal(false)}
        />
      )}

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;