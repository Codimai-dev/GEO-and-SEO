"""
Analysis API endpoints.
Server-side URL fetching, SEO analysis, and PageSpeed Insights.
"""
import httpx
import asyncio
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, HttpUrl
from sqlmodel import Session, select

from app.models import User
from app.database import get_session
from app.core.config import settings
from app.core.security import decode_token, security
from app.services.seo_analyzer import analyze_html, extract_seo_data
from app.services.url_fetcher import fetch_url_content

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


class FetchUrlRequest(BaseModel):
    url: HttpUrl


class FetchUrlResponse(BaseModel):
    content: str
    final_url: str
    status_code: int


class PSIRequest(BaseModel):
    url: HttpUrl
    strategy: str = "mobile"


class PSIResponse(BaseModel):
    performance_score: int
    core_web_vitals: dict
    failed_audits: list
    screenshot: Optional[str] = None


class SEOAnalyzeRequest(BaseModel):
    url: HttpUrl
    deep_scan: bool = False
    max_pages: int = 50  # Maximum pages to crawl during deep scan


@router.post("/fetch-url", response_model=FetchUrlResponse)
async def fetch_url(
    request: FetchUrlRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Fetch URL content server-side.
    """
    try:
        result = await fetch_url_content(str(request.url))
        return FetchUrlResponse(
            content=result["content"],
            final_url=result["final_url"],
            status_code=result["status_code"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch URL: {str(e)}"
        )


@router.post("/seo/analyze")
async def seo_analyze(
    request: SEOAnalyzeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Perform SEO analysis on the given URL.
    When deep_scan is True, crawls all discoverable pages on the site.
    """
    try:
        fetch_result = await fetch_url_content(str(request.url))
        html_content = fetch_result["content"]
        final_url = fetch_result["final_url"]
        
        seo_data = analyze_html(html_content, final_url)
        
        if request.deep_scan:
            # Get initial internal URLs from the main page
            initial_urls = set(seo_data.get("links", {}).get("internalUrls", []))
            
            # Track all discovered and crawled URLs
            crawled_urls = {final_url}  # Already crawled the main page
            pages_to_crawl = list(initial_urls - crawled_urls)
            crawled_pages = []
            
            # Add main page to crawled pages list
            main_page = {
                "url": final_url,
                "status": "200",
                "score": seo_data.get("score", 0),
                "issues": len(seo_data.get("issues", [])),
                "title": seo_data.get("meta", {}).get("title") or "Main Page",
                "issueDetails": seo_data.get("issues", [])
            }
            crawled_pages.append(main_page)
            
            async def analyze_page(page_url: str):
                """Analyze a single page and return discovered internal URLs."""
                try:
                    page_result = await fetch_url_content(page_url)
                    page_html = page_result["content"]
                    page_seo = extract_seo_data(page_html, page_url)
                    
                    # Also extract links from this page to discover more URLs
                    from bs4 import BeautifulSoup
                    from urllib.parse import urljoin, urlparse
                    
                    soup = BeautifulSoup(page_html, "lxml")
                    links = soup.find_all("a", href=True)
                    parsed_base = urlparse(page_url)
                    base_domain = parsed_base.netloc
                    
                    discovered_urls = set()
                    for link in links:
                        href = link.get("href", "")
                        if not href or href.startswith("#") or href.startswith("javascript:"):
                            continue
                        try:
                            full_url = urljoin(page_url, href)
                            parsed = urlparse(full_url)
                            if parsed.netloc == base_domain:
                                # Skip asset links
                                import re
                                if not re.search(r"\.(jpg|jpeg|png|gif|css|js|pdf|svg|ico|xml|woff|woff2|ttf|eot)$", parsed.path, re.I):
                                    # Normalize URL (remove fragment)
                                    clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                                    if parsed.query:
                                        clean_url += f"?{parsed.query}"
                                    discovered_urls.add(clean_url)
                        except Exception:
                            pass
                    
                    return {
                        "page_data": {
                            "url": page_url,
                            "status": "200",
                            "score": page_seo.get("score", 0),
                            "issues": page_seo.get("issue_count", 0),
                            "title": page_seo.get("title") or "Untitled Page",
                            "issueDetails": page_seo.get("issue_details", [])
                        },
                        "discovered_urls": discovered_urls
                    }
                except Exception as e:
                    return {
                        "page_data": {
                            "url": page_url,
                            "status": "error",
                            "score": 0,
                            "issues": 1,
                            "title": "Failed to load"
                        },
                        "discovered_urls": set()
                    }
            
            # Crawl pages in batches until we reach max_pages or run out of URLs
            max_pages = request.max_pages
            batch_size = 10  # Concurrent requests per batch
            
            while pages_to_crawl and len(crawled_pages) < max_pages:
                # Get batch of pages to crawl
                batch = pages_to_crawl[:batch_size]
                pages_to_crawl = pages_to_crawl[batch_size:]
                
                # Crawl batch concurrently
                tasks = [analyze_page(url) for url in batch if url not in crawled_urls]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for result in results:
                    if isinstance(result, Exception) or result is None:
                        continue
                    
                    # Add to crawled pages
                    crawled_pages.append(result["page_data"])
                    crawled_urls.add(result["page_data"]["url"])
                    
                    # Add newly discovered URLs to the queue
                    for new_url in result["discovered_urls"]:
                        if new_url not in crawled_urls and new_url not in pages_to_crawl:
                            pages_to_crawl.append(new_url)
                    
                    # Stop if we've reached max pages
                    if len(crawled_pages) >= max_pages:
                        break
            
            seo_data["crawledPages"] = crawled_pages
        
        return seo_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SEO analysis failed: {str(e)}"
        )


@router.post("/psi/run", response_model=PSIResponse)
async def run_pagespeed(
    request: PSIRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Run PageSpeed Insights analysis.
    """
    psi_key = settings.PSI_API_KEY
    
    if not psi_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PageSpeed Insights API key not configured"
        )
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            psi_url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
            params = {
                "url": str(request.url),
                "key": psi_key,
                "strategy": request.strategy,
                "category": ["performance", "accessibility", "best-practices", "seo"]
            }
            
            response = await client.get(psi_url, params=params)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"PageSpeed API error: {response.text}"
                )
            
            data = response.json()
            lighthouse = data.get("lighthouseResult", {})
            categories = lighthouse.get("categories", {})
            audits = lighthouse.get("audits", {})
            
            def get_metric(audit_id: str):
                audit = audits.get(audit_id, {})
                return {
                    "value": audit.get("displayValue", "N/A"),
                    "score": "good" if (audit.get("score") or 0) >= 0.9 else 
                            "needs-improvement" if (audit.get("score") or 0) >= 0.5 else "poor"
                }
            
            core_web_vitals = {
                "lcp": get_metric("largest-contentful-paint"),
                "fcp": get_metric("first-contentful-paint"),
                "cls": get_metric("cumulative-layout-shift"),
                "inp": get_metric("interaction-to-next-paint") if "interaction-to-next-paint" in audits else get_metric("total-blocking-time")
            }
            
            performance_score = int((categories.get("performance", {}).get("score") or 0) * 100)
            
            failed_audits = []
            for audit_id, audit in audits.items():
                score = audit.get("score")
                if score is not None and score < 1 and audit.get("details"):
                    failed_audits.append({
                        "id": audit_id,
                        "title": audit.get("title", ""),
                        "description": audit.get("description", ""),
                        "score": score,
                        "displayValue": audit.get("displayValue", "")
                    })
            
            failed_audits.sort(key=lambda x: x.get("score", 1))
            
            screenshot = None
            if "final-screenshot" in audits:
                screenshot = audits["final-screenshot"].get("details", {}).get("data")
            
            return PSIResponse(
                performance_score=performance_score,
                core_web_vitals=core_web_vitals,
                failed_audits=failed_audits[:20],
                screenshot=screenshot
            )
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="PageSpeed analysis timed out"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PageSpeed analysis failed: {str(e)}"
        )
