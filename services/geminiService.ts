

import { GoogleGenAI, Type } from "@google/genai";
import { SeoReport, AiAnalysisResult, PageSpeedResult, PerformanceAiAnalysis } from '../types';

const API_KEY = process.env.API_KEY || '';

const getAiClient = () => {
  if (!API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateSeoRecommendations = async (report: SeoReport): Promise<AiAnalysisResult> => {
  const ai = getAiClient();

  // Create a richer summary of the scanned internal pages for the context
  const crawledSummary = report.crawledPages && report.crawledPages.length > 0
    ? report.crawledPages.slice(0, 10).map(p => 
        `- Page: ${p.url}
         Title: ${p.title}
         Score: ${p.score}/100
         Issues Found: ${p.issues}`
      ).join('\n')
    : 'No internal pages scanned.';

  // Construct a comprehensive audit prompt
  const promptContext = `
    # Role and Objective
    You are a World-Class Enterprise SEO Auditor.
    Analyze the ENTIRE website: ${report.url}.
    
    We have performed a deep crawl of the site. Use the "Site-Wide Crawl Data" below to analyze the overall health, structure, and internal linking of the website, not just the homepage.

    # Data Context (Main Page)
    Title: ${report.meta.title || 'N/A'}
    Description: ${report.meta.description || 'N/A'}
    H1 Tags: ${JSON.stringify(report.headings.h1)}
    Word Count: ${report.wordCount}
    Keywords: ${report.keywords.slice(0, 5).map(k => k.word).join(', ')}

    # Site-Wide Crawl Data (Internal Pages)
    Total Internal Links Found: ${report.links.internal}
    
    Sample of Scanned Pages:
    ${crawledSummary}

    # Instructions
    1. **Analyze the Whole Website**: Look at the pattern of scores and issues across the scanned pages. Are many pages missing titles? Is there a structural issue?
    2. **Identify High-Impact Issues**: Focus on issues that affect the whole domain (e.g., "Lack of geo-targeting across service pages", "Missing structured data on key landing pages").
    3. **Geo-Targeting**: specifically check if the site (based on the main page and scanned page titles/URLs) targets specific regions or if it lacks local SEO signals.
    4. **Generative Search**: Evaluate if the content depth and structure are suitable for AI answers (ChatGPT, Gemini).

    ## For each issue identified, provide:
    - **Issue**: A clear, professional title (e.g., "Missing Geo-Targeting Signals Site-Wide").
    - **Category**: (On-page, Technical, Geo-targeting, Content, Authority).
    - **Impact**: High, Medium, or Low.
    - **Location**: The specific URL(s) affected, or "Site-wide" if it applies generally.
    - **Recommendation**: Concrete actionable advice for a developer or content strategist.
    - **Note**: Any specific error detail or observation.

    # Output Format
    Return a JSON object containing:
    1. "checklist": An array of 5-7 key assessment steps you performed (e.g., "Analyzed internal link structure", "Checked service pages for local schema").
    2. "issues": An array of issue objects, sorted by impact (High first).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptContext,
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                checklist: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                issues: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            issue_description: { type: Type.STRING },
                            category: { type: Type.STRING },
                            impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                            page_or_section: { type: Type.STRING },
                            recommendation: { type: Type.STRING },
                            error_or_notes: { type: Type.STRING }
                        }
                    }
                }
            }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    try {
        return JSON.parse(text) as AiAnalysisResult;
    } catch (parseError) {
        console.warn("JSON Parse Failed for SEO Analysis", parseError);
        return {
            checklist: ["Analysis incomplete due to parsing error."],
            issues: []
        };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generatePerformanceGuide = async (psiResult: PageSpeedResult): Promise<PerformanceAiAnalysis> => {
    const ai = getAiClient();

    // Simplify audit data to reduce token usage
    // Limit to top 5 failed audits to prevent context overflow
    const auditSummary = psiResult.failedAudits.slice(0, 5).map(a => `${a.title} (Score: ${a.score}): ${a.displayValue}`).join('\n');

    const promptContext = `
      You are a Senior Frontend Performance Engineer and SEO Technical Expert.
      Analyze these failed PageSpeed Insights audits and provide a repair guide.

      Current Performance Score: ${psiResult.performanceScore}/100
      Core Web Vitals: LCP=${psiResult.coreWebVitals.lcp.value}, CLS=${psiResult.coreWebVitals.cls.value}, INP=${psiResult.coreWebVitals.inp.value}

      Failed Audits:
      ${auditSummary}

      Provide a JSON response with:
      1. A brief executive summary of the performance health (max 50 words).
      2. A list of exactly 3 high-priority fixes. For each fix, provide:
         - A technical explanation (max 2 sentences).
         - A concrete code snippet or configuration example (max 10 lines).
         - Why this specific fix improves SEO/GEO.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptContext,
            config: {
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for structure task to save tokens
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        fixes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                                    technical_explanation: { type: Type.STRING },
                                    code_suggestion: { type: Type.STRING },
                                    impact_on_seo: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");
        
        try {
             const result = JSON.parse(text) as PerformanceAiAnalysis;
             
             // Strict validation to ensure fixes array exists
             if (!result || typeof result !== 'object') {
                 throw new Error("Invalid JSON structure");
             }

             if (!result.fixes || !Array.isArray(result.fixes)) {
                 result.fixes = [];
             }
             if (!result.summary) {
                 result.summary = "Analysis details are currently unavailable.";
             }
             return result;
        } catch (parseError) {
             console.warn("JSON Parse Failed for Performance Analysis", parseError);
             // Return a safe fallback instead of crashing
             return {
                summary: "Analysis generated partial results due to response length limits. Please refer to the raw failed audits.",
                fixes: [
                    {
                        title: "Review Failed Audits Manually",
                        severity: "High",
                        technical_explanation: "The AI response was truncated. Check the audit list above for specific metrics.",
                        code_suggestion: "// Code suggestion unavailable",
                        impact_on_seo: "Improving these metrics will help SEO."
                    }
                ]
             };
        }

    } catch (error) {
        console.error("Gemini Performance Analysis Error", error);
        // Return safe fallback on API error
        return {
            summary: "AI Analysis unavailable at this time.",
            fixes: []
        };
    }
}

export const generateSpecificFix = async (
  type: 'title' | 'description' | 'h1' | 'alt' | 'general' | 'viewport' | 'content_ideas' | 'link_strategy' | 'keyword_optimization',
  context: {
      url?: string;
      currentValue?: string | null;
      keywords?: string[];
      pageContext?: string; // Title or summary of page
  }
): Promise<string> => {
    const ai = getAiClient();
    let prompt = "";

    // Sanitize inputs to prevent token overflow from base64 images or massive text blocks
    const sanitize = (str: string | null | undefined) => str ? str.substring(0, 500) : '';
    const keywordsStr = context.keywords && context.keywords.length > 0 ? context.keywords.slice(0, 10).join(', ') : 'general SEO topics';
    const pageContextStr = context.pageContext ? `Page Context: ${sanitize(context.pageContext)}` : '';
    const currVal = sanitize(context.currentValue) || 'Missing';
    const safeUrl = sanitize(context.url);

    switch(type) {
        case 'title':
            prompt = `Generate a high-ranking, click-worthy SEO Title Tag.
            ${pageContextStr}
            Target Keywords: ${keywordsStr}
            Current Title: ${currVal}
            Requirements: Under 60 characters, compelling, includes main keyword. Output ONLY the title text.`;
            break;
        case 'description':
            prompt = `Generate a persuasive Meta Description for search results.
            ${pageContextStr}
            Target Keywords: ${keywordsStr}
            Current Description: ${currVal}
            Requirements: Between 150-160 characters, summarizes content, includes call to action. Output ONLY the description text.`;
            break;
        case 'h1':
            prompt = `Generate a clear, descriptive H1 Heading.
            ${pageContextStr}
            Target Keywords: ${keywordsStr}
            Current H1: ${currVal}
            Requirements: Engaging, relevant to the topic, single sentence. Output ONLY the heading text.`;
            break;
        case 'alt':
            prompt = `Generate a descriptive Alt Text for this image.
            Image Source/Context: ${safeUrl}
            ${pageContextStr}
            Requirements: Concise (under 125 chars), describes content for accessibility. Output ONLY the alt text.`;
            break;
        case 'viewport':
            prompt = `Generate a standard mobile-responsive Viewport Meta Tag.
            Requirements: Standard "width=device-width, initial-scale=1" configuration. Output ONLY the full meta tag HTML string.`;
            break;
        case 'content_ideas':
             prompt = `Generate 3 specific content expansion ideas to increase word count and depth.
             ${pageContextStr}
             Target Keywords: ${keywordsStr}
             Requirements: Bullet points, actionable, relevant to the topic. Output ONLY the bullet points.`;
             break;
        case 'link_strategy':
             prompt = `Suggest an internal linking strategy for this page.
             ${pageContextStr}
             Requirements: Suggest 2-3 types of related internal pages to link to. Output concise advice.`;
             break;
        case 'keyword_optimization':
            prompt = `Rewrite the following text to include the target keyword naturally.
            Target Keyword: ${keywordsStr}
            Current Text: "${currVal}"
            Requirements: Natural flow, maintain meaning, include keyword. Output ONLY the rewritten text.`;
            break;
        case 'general':
        default:
            prompt = `Provide a specific SEO fix for: ${currVal} on page ${safeUrl}.
            ${pageContextStr}
            Requirements: Actionable advice or code snippet. Keep it concise.`;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                maxOutputTokens: 1024, // Increased to prevent cutoff
                temperature: 0.7,
                thinkingConfig: { thinkingBudget: 0 } // Disable thinking for short tasks to prevent MAX_TOKENS errors
            }
        });
        
        if (response.text) {
            return response.text.trim();
        }
        
        return "AI response was empty. Please try again.";
        
    } catch (error) {
        console.error("Gemini Specific Fix Error:", error);
        return "Unable to generate a fix at this time. Please check your API limits or try again later.";
    }
};