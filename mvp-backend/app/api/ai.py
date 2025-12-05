"""
AI API endpoints.
Server-side AI analysis using Gemini API.
"""
import json
import httpx
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlmodel import Session, select

from app.models import User
from app.database import get_session
from app.core.config import settings
from app.core.security import decode_token, security

router = APIRouter()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Get the current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Handle missing credentials
    if credentials is None:
        raise credentials_exception
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if user is None:
        raise credentials_exception
    
    return user


class SEOAuditRequest(BaseModel):
    url: str
    seo_data: dict


class SEOAuditResponse(BaseModel):
    checklist: List[str]
    issues: List[dict]


class PerformanceGuideRequest(BaseModel):
    psi_data: dict


class PerformanceGuideResponse(BaseModel):
    summary: str
    fixes: List[dict]


class SpecificFixRequest(BaseModel):
    issue_type: str
    context: dict


class SpecificFixResponse(BaseModel):
    explanation: str
    code_example: Optional[str] = None
    steps: List[str]


class SEOFilesRequest(BaseModel):
    url: str
    site_data: dict


class SEOFilesResponse(BaseModel):
    robots_txt: str
    sitemap_xml: str
    llms_txt: str


async def call_gemini_api(prompt: str, json_response: bool = True) -> dict:
    """
    Call the Gemini API with the given prompt.
    """
    api_key = settings.GEMINI_API_KEY
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key not configured"
        )
    
    text = None  # Initialize text for error handling
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 4096,
                }
            }
            
            if json_response:
                payload["generationConfig"]["responseMimeType"] = "application/json"
            
            response = await client.post(url, json=payload)
            
            if response.status_code != 200:
                print(f"--- GEMINI API ERROR ---\nStatus: {response.status_code}\nBody: {response.text}\n--- END ERROR ---")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Gemini API error: {response.text}"
                )
            
            data = response.json()
            
            # Safely extract text from response
            try:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError) as e:
                print(f"--- GEMINI RESPONSE STRUCTURE ERROR ---\nData: {json.dumps(data, indent=2)}\n--- END ERROR ---")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Unexpected Gemini response structure: {str(e)}"
                )
            
            if json_response:
                text = text.strip()
                # Try to find JSON block
                start_idx = text.find('{')
                end_idx = text.rfind('}')
                
                if start_idx != -1 and end_idx != -1:
                    text = text[start_idx:end_idx+1]
                
                return json.loads(text)
            
            return {"text": text}
            
    except json.JSONDecodeError as e:
        print(f"--- RAW AI RESPONSE ---\n{text}\n--- END RAW AI RESPONSE ---")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse AI response: {str(e)}"
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="AI analysis timed out"
        )
    except HTTPException:
        raise  # Re-raise HTTPException as-is
    except Exception as e:
        print(f"--- UNEXPECTED ERROR ---\nType: {type(e).__name__}\nMessage: {str(e)}\n--- END ERROR ---")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )


@router.post("/ai/seo-audit", response_model=SEOAuditResponse)
async def ai_seo_audit(
    request: SEOAuditRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-powered SEO recommendations.
    """
    seo_data = request.seo_data
    
    prompt = f"""You are an expert SEO consultant. Analyze the following SEO data for the website {request.url} and provide actionable recommendations.

SEO Data:
- Title: {seo_data.get('meta', {}).get('title', 'Missing')}
- Description: {seo_data.get('meta', {}).get('description', 'Missing')}
- H1 Tags: {seo_data.get('headings', {}).get('h1', [])}
- Images without alt: {seo_data.get('images', {}).get('withoutAlt', 0)}
- Word count: {seo_data.get('wordCount', 0)}
- Internal links: {seo_data.get('links', {}).get('internal', 0)}
- External links: {seo_data.get('links', {}).get('external', 0)}
- Keywords: {json.dumps(seo_data.get('keywords', [])[:5])}
- Current Score: {seo_data.get('score', 0)}/100

Provide your response as JSON with this exact structure:
{{
    "checklist": ["list of 5-8 key SEO items to check"],
    "issues": [
        {{
            "issue_description": "Description of the issue",
            "category": "Technical SEO|Content|On-Page|Links",
            "impact": "High|Medium|Low",
            "page_or_section": "Where this applies",
            "recommendation": "How to fix it",
            "error_or_notes": "Additional context if any"
        }}
    ]
}}

Focus on the most impactful issues first. Limit to 5-10 issues."""

    result = await call_gemini_api(prompt)
    
    return SEOAuditResponse(
        checklist=result.get("checklist", []),
        issues=result.get("issues", [])
    )


@router.post("/ai/performance-guide", response_model=PerformanceGuideResponse)
async def ai_performance_guide(
    request: PerformanceGuideRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-powered performance optimization guide.
    """
    psi_data = request.psi_data
    
    prompt = f"""You are a web performance expert. Analyze the following PageSpeed Insights data and provide a comprehensive optimization guide.

Performance Score: {psi_data.get('performanceScore', 0)}/100

Core Web Vitals:
- LCP: {psi_data.get('coreWebVitals', {}).get('lcp', {}).get('value', 'N/A')}
- FCP: {psi_data.get('coreWebVitals', {}).get('fcp', {}).get('value', 'N/A')}
- CLS: {psi_data.get('coreWebVitals', {}).get('cls', {}).get('value', 'N/A')}

Failed Audits: {json.dumps(psi_data.get('failedAudits', [])[:10])}

Provide your response as JSON with this exact structure:
{{
    "summary": "Brief overview of the performance state (2-3 sentences)",
    "fixes": [
        {{
            "title": "Fix title",
            "severity": "High|Medium|Low",
            "technical_explanation": "Detailed technical explanation",
            "code_suggestion": "Example code if applicable",
            "impact_on_seo": "How this affects SEO rankings"
        }}
    ]
}}

Prioritize fixes by impact. Include 5-8 actionable fixes."""

    result = await call_gemini_api(prompt)
    
    return PerformanceGuideResponse(
        summary=result.get("summary", ""),
        fixes=result.get("fixes", [])
    )


@router.post("/ai/specific-fix", response_model=SpecificFixResponse)
async def ai_specific_fix(
    request: SpecificFixRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a specific fix for an identified issue.
    """
    prompt = f"""You are a web development expert. Provide a detailed fix for the following issue:

Issue Type: {request.issue_type}
Context: {json.dumps(request.context)}

Provide your response as JSON with this exact structure:
{{
    "explanation": "Detailed explanation of the issue and why it matters",
    "code_example": "Code example showing the fix (if applicable)",
    "steps": ["Step 1", "Step 2", "Step 3"]
}}

Be specific and actionable."""

    result = await call_gemini_api(prompt)
    
    return SpecificFixResponse(
        explanation=result.get("explanation", ""),
        code_example=result.get("code_example"),
        steps=result.get("steps", [])
    )


@router.post("/ai/generate-seo-files", response_model=SEOFilesResponse)
async def ai_generate_seo_files(
    request: SEOFilesRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate SEO files for a website.
    """
    prompt = f"""You are an SEO expert. Generate the following files for the website: {request.url}

Site Data:
{json.dumps(request.site_data)}

Generate these files:
1. robots.txt - Standard robots.txt with appropriate rules
2. sitemap.xml - Valid XML sitemap with the provided URLs
3. llms.txt - A file describing the site for LLM crawlers

Provide your response as JSON with this exact structure:
{{
    "robots_txt": "Complete robots.txt content",
    "sitemap_xml": "Complete valid XML sitemap",
    "llms_txt": "Complete llms.txt content"
}}

Make sure all files are properly formatted and valid."""

    result = await call_gemini_api(prompt)
    
    return SEOFilesResponse(
        robots_txt=result.get("robots_txt", ""),
        sitemap_xml=result.get("sitemap_xml", ""),
        llms_txt=result.get("llms_txt", "")
    )
