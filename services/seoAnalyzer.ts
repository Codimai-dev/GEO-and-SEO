

import { SeoReport, HeadingStructure, MetaTags, SocialTags, KeywordData, CrawledPage } from '../types';

// Common English stop words & Tech/Code noise
const STOP_WORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cannot", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves", 
    "site", "website", "page", "copyright", "rights", "reserved", "loading", "menu", "home", "contact", "login", "sign", "up",
    // Programming & CSS Keywords to filter out code leaks
    "const", "var", "let", "function", "class", "import", "export", "return", "true", "false", "null", "undefined", 
    "async", "await", "component", "render", "prop", "state", "effect", "mount", "console", "log", "window", "document",
    "div", "span", "class", "id", "style", "src", "href", "width", "height", "alt", "title", "meta", "link", "svg", "path",
    "slug", "json", "api", "http", "https", "www", "com", "org", "net", "html", "body", "head", "display", "block", "none",
    "margin", "padding", "border", "font", "color", "background", "flex", "grid", "gap", "px", "rem", "em", "vh", "vw"
]);

export const analyzeHtml = (html: string, url: string): SeoReport => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Helper to get meta content
  const getMeta = (name: string) => {
    return doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || 
           doc.querySelector(`meta[property="${name}"]`)?.getAttribute('content') || null;
  };

  // Meta Tags
  const meta: MetaTags = {
    title: doc.title || null,
    description: getMeta('description'),
    keywords: getMeta('keywords'),
    robots: getMeta('robots'),
    canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
    charset: doc.characterSet || doc.querySelector('meta[charset]')?.getAttribute('charset') || null,
    viewport: getMeta('viewport'),
  };

  // Social Tags
  const social: SocialTags = {
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    twitterCard: getMeta('twitter:card'),
    twitterTitle: getMeta('twitter:title'),
    twitterDescription: getMeta('twitter:description'),
    twitterImage: getMeta('twitter:image'),
  };

  // Headings
  const getHeadings = (tag: string) => Array.from(doc.querySelectorAll(tag)).map(el => (el as HTMLElement).innerText.trim()).filter(Boolean);
  const headings: HeadingStructure = {
    h1: getHeadings('h1'),
    h2: getHeadings('h2'),
    h3: getHeadings('h3'),
    h4: getHeadings('h4'),
    h5: getHeadings('h5'),
    h6: getHeadings('h6'),
  };

  // Content Analysis (Text & Keywords)
  const tagsToRemove = ['script', 'style', 'noscript', 'iframe', 'code', 'pre', 'svg', 'link', 'meta', 'template'];
  tagsToRemove.forEach(tag => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach(el => el.remove());
  });

  const bodyText = doc.body.textContent || "";
  
  const words = bodyText
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w)); 
  
  const wordCount = words.length;
  
  const frequency: Record<string, number> = {};
  words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
  });

  const sortedKeywords: KeywordData[] = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
        word,
        count,
        density: (count / (words.length || 1)) * 100,
        inTitle: meta.title ? meta.title.toLowerCase().includes(word) : false,
        inDescription: meta.description ? meta.description.toLowerCase().includes(word) : false,
        inH1: headings.h1.some(h => h.toLowerCase().includes(word))
    }));

  // Images
  const imgElements = Array.from(doc.querySelectorAll('img'));
  const images = {
    total: imgElements.length,
    withAlt: imgElements.filter(img => img.getAttribute('alt')).length,
    withoutAlt: imgElements.filter(img => !img.getAttribute('alt')).length,
    details: imgElements.slice(0, 10).map(img => ({
        src: img.getAttribute('src') || 'unknown',
        alt: img.getAttribute('alt') || ''
    }))
  };

  // Links & Crawl Simulation
  const linkElements = Array.from(doc.querySelectorAll('a'));
  let internal = 0;
  let external = 0;
  const foundPages = new Set<string>();
  const baseUrlObj = new URL(url);

  linkElements.forEach(link => {
    let href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    
    // Resolve relative URLs
    try {
        const linkUrl = new URL(href, url);
        
        if (linkUrl.hostname === baseUrlObj.hostname) {
            internal++;
            // Exclude assets like images/pdfs for crawl list
            if (!linkUrl.pathname.match(/\.(jpg|jpeg|png|gif|css|js|pdf|svg|ico|xml)$/i)) {
                foundPages.add(linkUrl.href);
            }
        } else if (href.startsWith('http')) {
            external++;
        }
    } catch (e) {
        // invalid url, ignore
    }
  });

  // Generate Crawled Pages Data
  // Since we can't actually crawl all of them in browser instantly without rate limits, we create placeholders.
  // The App.tsx will eventually replace these with real scans if "Deep Scan" is enabled.
  let currentScore = 100;
  if (!meta.title) currentScore -= 20;
  else if (meta.title.length > 60) currentScore -= 5;
  else if (meta.title.length < 10) currentScore -= 5;
  if (!meta.description) currentScore -= 20;
  if (headings.h1.length === 0) currentScore -= 15;
  if (images.withoutAlt > 0) currentScore -= Math.min(10, images.withoutAlt * 2);
  currentScore = Math.max(0, currentScore);

  const crawledPages: CrawledPage[] = Array.from(foundPages).slice(0, 25).map(pageUrl => {
      // Simulate variance for pages not yet scanned
      const variance = Math.floor(Math.random() * 20) - 10; // -10 to +10
      const pageScore = Math.min(100, Math.max(0, currentScore + variance));
      
      // Guess title from URL if possible
      let pageTitle = "";
      try {
        const pUrl = new URL(pageUrl);
        pageTitle = pUrl.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Untitled Page';
      } catch {
        pageTitle = 'Internal Page';
      }
      
      pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
      if (pageTitle.length < 3 || pageTitle === 'Untitled Page') pageTitle = "Internal Page";

      return {
          url: pageUrl,
          status: '200',
          score: pageScore,
          issues: Math.floor(Math.random() * 5), // Simulated issue count until deep scan
          title: pageTitle
      };
  });
  
  // Add the current page to the crawl list at the top
  crawledPages.unshift({
      url: url,
      status: '200',
      score: currentScore,
      issues: (100 - currentScore) > 0 ? Math.ceil((100 - currentScore) / 5) : 0,
      title: meta.title || 'Current Page'
  });

  return {
    url,
    meta,
    social,
    headings,
    images,
    links: { 
        total: linkElements.length, 
        internal, 
        external,
        internalUrls: Array.from(foundPages) // Capture actual URLs for deep scan usage
    },
    keywords: sortedKeywords,
    wordCount,
    score: currentScore,
    rawHtml: html,
    crawledPages: crawledPages
  };
};

export const generateSimulatedReport = (url: string): SeoReport => {
  let hostname = "example.com";
  try {
     hostname = new URL(url).hostname;
  } catch (e) {
     hostname = url;
  }
  
  return {
    url,
    meta: {
      title: `${hostname} - Leading Digital Experience Platform`,
      description: `Welcome to ${hostname}. We provide top-tier solutions for digital growth. Optimize your presence with our comprehensive tools and services.`,
      keywords: "seo, digital, growth, platform, optimization",
      robots: "index, follow",
      canonical: url,
      charset: "UTF-8",
      viewport: "width=device-width, initial-scale=1",
    },
    social: {
        ogTitle: `${hostname} - Official Site`,
        ogDescription: `Discover the future of digital with ${hostname}.`,
        ogImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        twitterCard: "summary_large_image",
        twitterTitle: `${hostname}`,
        twitterDescription: `Official Twitter account for ${hostname}`,
        twitterImage: null
    },
    headings: {
        h1: [`Welcome to ${hostname}`],
        h2: ["Our Features", "Pricing Plans", "About Our Company", "Customer Success"],
        h3: ["Latest Analytics", "Integration Tools", "Community Support"],
        h4: ["Getting Started", "API Documentation"],
        h5: [],
        h6: []
    },
    images: {
        total: 24,
        withAlt: 18,
        withoutAlt: 6,
        details: [
            { src: "/assets/logo.png", alt: `${hostname} Logo` },
            { src: "/assets/hero-banner.jpg", alt: "Hero Banner" },
            { src: "/assets/icon-1.svg", alt: "" },
            { src: "/assets/team.jpg", alt: "Our Team" }
        ]
    },
    links: {
        total: 65,
        internal: 45,
        external: 20,
        internalUrls: [`${url}/about`, `${url}/services`, `${url}/contact`, `${url}/blog`, `${url}/pricing`]
    },
    keywords: [
        { word: "platform", count: 18, density: 2.1, inTitle: true, inDescription: true, inH1: false },
        { word: "solutions", count: 14, density: 1.8, inTitle: false, inDescription: true, inH1: false },
        { word: "optimization", count: 10, density: 1.2, inTitle: false, inDescription: true, inH1: false },
        { word: "digital", count: 9, density: 1.1, inTitle: true, inDescription: true, inH1: false },
        { word: "growth", count: 8, density: 0.9, inTitle: false, inDescription: false, inH1: false }
    ],
    wordCount: 850,
    score: 78,
    rawHtml: "<!-- Simulated Content -->",
    crawledPages: [
        { url: url, status: '200', score: 78, issues: 5, title: `${hostname} - Leading Digital Experience Platform` },
        { url: `${url}/about`, status: '200', score: 85, issues: 2, title: 'About Us' },
        { url: `${url}/services`, status: '200', score: 72, issues: 5, title: 'Services' },
        { url: `${url}/contact`, status: '200', score: 90, issues: 1, title: 'Contact' },
        { url: `${url}/blog`, status: '200', score: 65, issues: 8, title: 'Blog' },
        { url: `${url}/pricing`, status: '200', score: 88, issues: 2, title: 'Pricing' },
    ]
  };
};