

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
import LoadingScreen from './components/LoadingScreen';
import PerformanceAnalysis from './components/PerformanceAnalysis';

// Page Components
import Pricing from './components/Pricing';
import Products from './components/Products';
import Features from './components/Features';
import Contact from './components/Contact';
import Blog from './components/Blog';
import Services from './components/Services';
import Auth from './components/Auth';

import History from './components/History';

type PageType = 'LANDING' | 'DASHBOARD' | 'PRODUCTS' | 'FEATURES' | 'PRICING' | 'LOGIN' | 'SIGNUP' | 'CONTACT' | 'SERVICES' | 'BLOG' | 'HISTORY';

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

  const handleNavigate = (newPage: PageType) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setPage('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    if (!url) return;

    // Enforce Login
    if (!apiService.isAuthenticated()) {
      setPage('LOGIN');
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
      let targetUrl = url;

      try {
        // 1. Fetch Main Page
        const result = await fetchUrlContent(url);
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
        setPage('DASHBOARD');

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
        const simulatedReport = generateSimulatedReport(url);
        setReport(simulatedReport);
        setIsSimulated(true);
        setStatus(AnalysisStatus.SUCCESS);
        setPage('DASHBOARD');
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

  const handlePerformanceRequest = async () => {
    if (!url) return;
    setShowPerfModal(true);

    // If we already have data, don't re-fetch
    if (psiResults.mobile && psiResults.desktop && perfAiResult) return;

    setPerfStatus(AnalysisStatus.LOADING);
    try {
      // 1. Run PSI for both Mobile and Desktop
      const [mobileData, desktopData] = await Promise.all([
        runPageSpeedAnalysis(url, process.env.API_KEY, 'mobile'),
        runPageSpeedAnalysis(url, process.env.API_KEY, 'desktop')
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
    setPage('LANDING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Content based on current Page state
  const renderContent = () => {
    if (status === AnalysisStatus.LOADING) return <LoadingScreen />;

    switch (page) {
      case 'DASHBOARD':
        if (!report) {
          setPage('LANDING');
          return null;
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
            />
          </>
        );
      case 'HISTORY': return <History onSelectReport={handleHistorySelect} />;
      case 'PRICING': return <Pricing />;
      case 'PRODUCTS': return <Products />;
      case 'FEATURES': return <Features />;
      case 'CONTACT': return <Contact />;
      case 'BLOG': return <Blog />;
      case 'SERVICES': return <Services />;
      case 'LOGIN': return <Auth mode="login" onToggleMode={(mode) => setPage(mode === 'login' ? 'LOGIN' : 'SIGNUP')} onSuccess={() => handleNavigate('LANDING')} />;
      case 'SIGNUP': return <Auth mode="signup" onToggleMode={(mode) => setPage(mode === 'login' ? 'LOGIN' : 'SIGNUP')} onSuccess={() => handleNavigate('LANDING')} />;
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
    <div className="bg-[#1a1a1a] min-h-screen text-white">
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