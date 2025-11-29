

import React, { useState } from 'react';
import { analyzeHtml, generateSimulatedReport } from './services/seoAnalyzer';
import { generateSeoRecommendations, generatePerformanceGuide } from './services/geminiService';
import { fetchUrlContent } from './services/proxyService';
import { runPageSpeedAnalysis } from './services/psiService';
import { apiService } from './services/apiService';
import { SeoReport, AiAnalysisResult, AnalysisStatus, PageSpeedResult, PerformanceAiAnalysis, CrawledPage } from './types';

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
  const [psiResults, setPsiResults] = useState<{ mobile: PageSpeedResult | null, desktop: PageSpeedResult | null }>({ mobile: null, desktop: null });
  const [perfAiResult, setPerfAiResult] = useState<PerformanceAiAnalysis | null>(null);
  const [showPerfModal, setShowPerfModal] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map PageType to path for URL updates
  const pageToPath = (p: PageType, section?: string) => {
    switch (p) {
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

  const handleNavigate = (newPage: PageType, section?: string, replace: boolean = false, resetReport: boolean = false) => {
    const path = pageToPath(newPage, section);
    try {
      if (replace) {
        window.history.replaceState({}, '', path);
      } else {
        window.history.pushState({}, '', path);
      }
    } catch (e) {
      // If push/replace fails (e.g., in some environments), we still set page state
    }
    setPage(newPage);
    // If caller requested reset, clear any loaded report so DashboardHome shows
    if (resetReport) {
      setReport(null);
      setAiResult(null);
      setStatus(AnalysisStatus.IDLE);
      setErrorMsg(null);
      setIsSimulated(false);
      setUrl('');
    }
    // If navigating to a landing section, scroll to the anchor after a small delay
    if (newPage === 'LANDING' && section) {
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleHistorySelect = (savedReportPayload: any) => {
    // Parse if it's a string, otherwise use as is
    let parsedReport = savedReportPayload;
    if (typeof savedReportPayload === 'string') {
      try {
        parsedReport = JSON.parse(savedReportPayload);
      } catch (e) {
        console.error("Failed to parse report payload", e);
        return;
      }
    }
    setReport(parsedReport);
    handleNavigate('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Normalize URL: add https:// if missing, handle various formats
  const normalizeUrl = (inputUrl: string): string => {
    let normalized = inputUrl.trim();
    if (!normalized) return '';
    
    // Remove any whitespace
    normalized = normalized.replace(/\s+/g, '');
    
    // If it doesn't start with http:// or https://, add https://
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    
    return normalized;
  };

  const handleAnalyze = async (overrideUrl?: string) => {
    const rawTarget = overrideUrl || url;
    if (!rawTarget) return;
    
    // Normalize the URL to handle example.com, www.example.com, etc.
    const target = normalizeUrl(rawTarget);
    if (!target) return;

    // Enforce Login
    if (!apiService.isAuthenticated()) {
      handleNavigate('LOGIN');
      return;
    }

    setStatus(AnalysisStatus.LOADING);
    setReport(null);
    setAiResult(null);
    setAiStatus(AnalysisStatus.IDLE);
    setIsSimulated(false);

    // Reset Perf
    setPerfStatus(AnalysisStatus.IDLE);
    setPsiResults({ mobile: null, desktop: null });
    setPerfAiResult(null);

    setErrorMsg(null);

    // Initial UX Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      let htmlContent = '';
      let targetUrl = target;

      try {
        // 1. Fetch Main Page
        const result = await fetchUrlContent(targetUrl);
        htmlContent = result.content;
        targetUrl = result.finalUrl;

        const seoData = analyzeHtml(htmlContent, targetUrl);

        // 2. Deep Scan: Fetch internal pages found on the main page
        if (seoData.links.internalUrls && seoData.links.internalUrls.length > 0) {
          // Take top 5 unique internal URLs to analyze directly
          const pagesToScan = seoData.links.internalUrls.slice(0, 5);

          const scannedPagesPromise = pagesToScan.map(async (pageUrl) => {
            try {
              // Small random delay to avoid rate limits
              await new Promise(r => setTimeout(r, Math.random() * 500));
              const pageRes = await fetchUrlContent(pageUrl);
              const pageSeo = analyzeHtml(pageRes.content, pageRes.finalUrl);

              // Calculate simple issue count for summary
              const issueCount =
                (pageSeo.meta.description ? 0 : 1) +
                (pageSeo.meta.title && pageSeo.meta.title.length < 10 ? 1 : 0) +
                (pageSeo.headings.h1.length === 0 ? 1 : 0) +
                pageSeo.images.withoutAlt;

              return {
                url: pageUrl,
                status: '200' as const,
                score: pageSeo.score,
                issues: issueCount,
                title: pageSeo.meta.title || 'Untitled Page'
              } as CrawledPage;
            } catch (e) {
              return null;
            }
          });

          const scannedPages = await Promise.all(scannedPagesPromise);
          const validScannedPages = scannedPages.filter((p): p is CrawledPage => p !== null);

          if (validScannedPages.length > 0) {
            // Replace simulated pages with real scanned ones
            const mainPage = seoData.crawledPages[0]; // Preserve main page
            const simulatedRest = seoData.crawledPages.slice(1).filter(p => !validScannedPages.find(vp => vp.url === p.url));

            // Construct new list: Main + Real Scans + Remaining Simulated (up to 25 total)
            seoData.crawledPages = [mainPage, ...validScannedPages, ...simulatedRest].slice(0, 25);
          }
        }


        setReport(seoData);
        setStatus(AnalysisStatus.SUCCESS);
        handleNavigate('DASHBOARD');

        // Save report to backend (already authenticated check passed)
        try {
          await apiService.createReport({
            title: seoData.meta.title || `SEO Report for ${targetUrl}`,
            url: targetUrl,
            payload: JSON.stringify(seoData)
          });
        } catch (err) {
          console.warn('Failed to save report to backend:', err);
        }

      } catch (fetchError) {
        console.warn("Fetch failed, falling back to simulation", fetchError);
        // Fallback to Simulation for demo purposes
        const simulatedReport = generateSimulatedReport(targetUrl);
        setReport(simulatedReport);
        setIsSimulated(true);
        setStatus(AnalysisStatus.SUCCESS);
        handleNavigate('DASHBOARD');
      }

    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to analyze content.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleAiRequest = async () => {
    if (!report) return;
    setAiStatus(AnalysisStatus.LOADING);
    try {
      const recommendations = await generateSeoRecommendations(report);
      setAiResult(recommendations);
      setAiStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setAiStatus(AnalysisStatus.ERROR);
    }
  };

  const handlePerformanceRequest = async (targetUrl?: string) => {
    const target = targetUrl || url || (report ? report.url : '');
    if (!target) return;
    // Ensure the URL state is set so subsequent requests and UI elements behave consistently
    if (!url) setUrl(target);
    setShowPerfModal(true);

    // If we already have data, don't re-fetch
    if (psiResults.mobile && psiResults.desktop && perfAiResult) return;

    setPerfStatus(AnalysisStatus.LOADING);
    try {
      // 1. Run PSI for both Mobile and Desktop
      const [mobileData, desktopData] = await Promise.all([
        runPageSpeedAnalysis(target, process.env.API_KEY, 'mobile'),
        runPageSpeedAnalysis(target, process.env.API_KEY, 'desktop')
      ]);

      setPsiResults({ mobile: mobileData, desktop: desktopData });

      // 2. Run Gemini Analysis on PSI Data
      const aiData = await generatePerformanceGuide(mobileData);
      setPerfAiResult(aiData);

      setPerfStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error("Performance Analysis failed", error);
      setPerfStatus(AnalysisStatus.ERROR);
    }
  }

  const handleReset = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setReport(null);
    setAiResult(null);
    setStatus(AnalysisStatus.IDLE);
    setErrorMsg(null);
    setIsSimulated(false);
    setUrl('');
    // Stay on Dashboard to show DashboardHome with analysis form
    handleNavigate('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Parse initial path and mount popstate handler to support URL navigation
  React.useEffect(() => {
    const path = window.location.pathname;
    const pathToPage = (p: string): { page: PageType, section?: string } => {
      switch (p) {
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
    const result = pathToPage(path);
    // Replace state instead of push to avoid altering history on initial load
    handleNavigate(result.page, result.section, true);

    const onPop = () => {
      const r = pathToPage(window.location.pathname);
      setPage(r.page);
      if (r.page === 'LANDING' && r.section) {
        setTimeout(() => {
          const el = document.getElementById(r.section);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Render Content based on current Page state
  const renderContent = () => {
    if (status === AnalysisStatus.LOADING) return <LoadingScreen />;

    switch (page) {
      case 'DASHBOARD':
        if (!report) {
          // Show a start screen where users can enter a URL and begin analysis after login
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
      case 'HISTORY': return <History onSelectReport={handleHistorySelect} />;
      case 'PRICING': return <Pricing />;
      case 'CONTACT': return <Contact />;
      case 'LOGIN': return <Auth mode="login" onToggleMode={(mode) => handleNavigate(mode === 'login' ? 'LOGIN' : 'SIGNUP')} onSuccess={() => handleNavigate('DASHBOARD')} />;
      case 'SIGNUP': return <Auth mode="signup" onToggleMode={(mode) => handleNavigate(mode === 'login' ? 'LOGIN' : 'SIGNUP')} onSuccess={() => handleNavigate('DASHBOARD')} />;
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