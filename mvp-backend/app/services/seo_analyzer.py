"""
SEO Analyzer Service
Server-side HTML parsing and SEO data extraction.
"""
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional
import re


# Common stop words to filter from keyword analysis
STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cannot", "could",
    "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has",
    "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if",
    "in", "into", "is", "it", "its", "itself", "me", "more", "most", "my", "myself", "no", "nor", "not",
    "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over",
    "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
    "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
    "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
    "why", "with", "would", "you", "your", "yours", "yourself", "yourselves",
    # Common web terms
    "site", "website", "page", "copyright", "rights", "reserved", "loading", "menu", "home", "contact",
    "login", "sign", "up", "click", "here", "read", "more", "view", "details",
    # Technical terms to filter
    "const", "var", "let", "function", "class", "import", "export", "return", "true", "false", "null",
    "undefined", "async", "await", "console", "log", "window", "document",
}


def analyze_html(html: str, url: str) -> Dict:
    """
    Analyze HTML content for SEO factors.
    
    Args:
        html: Raw HTML content
        url: The URL being analyzed
        
    Returns:
        Dict containing comprehensive SEO analysis data
    """
    soup = BeautifulSoup(html, "lxml")
    
    # Extract meta tags
    meta = extract_meta_tags(soup)
    
    # Extract social tags
    social = extract_social_tags(soup)
    
    # Extract headings
    headings = extract_headings(soup)
    
    # Extract images
    images = extract_images(soup)
    
    # Extract links
    links = extract_links(soup, url)
    
    # Extract keywords
    keywords, word_count = extract_keywords(soup)
    
    # Calculate score
    score, issues = calculate_seo_score(meta, headings, images, links, word_count)
    
    # Generate crawled pages list (legacy support, will be overwritten by real crawl)
    crawled_pages = []
    
    return {
        "url": url,
        "meta": meta,
        "social": social,
        "headings": headings,
        "images": images,
        "links": links,
        "keywords": keywords,
        "wordCount": word_count,
        "score": score,
        "issues": issues,
        "crawledPages": crawled_pages
    }


def extract_seo_data(html: str, url: str) -> Dict:
    """
    Extract basic SEO data for quick analysis.
    """
    soup = BeautifulSoup(html, "lxml")
    
    title = soup.title.string.strip() if soup.title and soup.title.string else None
    description = None
    desc_tag = soup.find("meta", attrs={"name": "description"})
    if desc_tag:
        description = desc_tag.get("content")
    
    h1_tags = [h1.get_text(strip=True) for h1 in soup.find_all("h1")]
    
    images = soup.find_all("img")
    images_without_alt = sum(1 for img in images if not img.get("alt"))
    
    # Calculate basic score and identify issues
    score = 100
    issues_list = []
    
    if not title:
        score -= 20
        issues_list.append({
            "type": "title",
            "label": "Missing Title Tag",
            "description": "The page title is missing, which is critical for SEO.",
            "severity": "High"
        })
    elif len(title) > 60:
        score -= 5
        issues_list.append({
            "type": "title",
            "label": "Title Too Long",
            "description": f"Title is {len(title)} chars (recommended: < 60).",
            "severity": "Medium"
        })
    elif len(title) < 10:
        score -= 5
        issues_list.append({
            "type": "title",
            "label": "Title Too Short",
            "description": "Title is too short to be descriptive.",
            "severity": "Medium"
        })

    if not description:
        score -= 20
        issues_list.append({
            "type": "description",
            "label": "Missing Meta Description",
            "description": "Meta description is missing, impacting click-through rates.",
            "severity": "High"
        })
    elif len(description) > 160:
        score -= 3
        issues_list.append({
            "type": "description",
            "label": "Description Too Long",
            "description": "Meta description exceeds 160 characters.",
            "severity": "Low"
        })

    if not h1_tags:
        score -= 15
        issues_list.append({
            "type": "h1",
            "label": "Missing H1 Heading",
            "description": "No H1 tag found. Use one H1 for the main title.",
            "severity": "High"
        })
    elif len(h1_tags) > 1:
        score -= 5
        issues_list.append({
            "type": "h1",
            "label": "Multiple H1 Tags",
            "description": f"Found {len(h1_tags)} H1 tags. Use only one per page.",
            "severity": "Medium"
        })

    if images_without_alt > 0:
        penalty = min(10, images_without_alt * 2)
        score -= penalty
        issues_list.append({
            "type": "images",
            "label": "Missing Alt Text",
            "description": f"{images_without_alt} images are missing alt text.",
            "severity": "Medium"
        })
    
    return {
        "title": title,
        "description": description,
        "h1_tags": h1_tags,
        "score": max(0, score),
        "issue_count": len(issues_list),
        "issue_details": issues_list
    }


def extract_meta_tags(soup: BeautifulSoup) -> Dict:
    """Extract meta tags from HTML."""
    def get_meta(name: str) -> Optional[str]:
        tag = soup.find("meta", attrs={"name": name}) or soup.find("meta", attrs={"property": name})
        return tag.get("content") if tag else None
    
    canonical = None
    canonical_tag = soup.find("link", attrs={"rel": "canonical"})
    if canonical_tag:
        canonical = canonical_tag.get("href")
    
    charset = None
    charset_tag = soup.find("meta", attrs={"charset": True})
    if charset_tag:
        charset = charset_tag.get("charset")
    
    return {
        "title": soup.title.string.strip() if soup.title and soup.title.string else None,
        "description": get_meta("description"),
        "keywords": get_meta("keywords"),
        "robots": get_meta("robots"),
        "canonical": canonical,
        "charset": charset or "UTF-8",
        "viewport": get_meta("viewport"),
    }


def extract_social_tags(soup: BeautifulSoup) -> Dict:
    """Extract Open Graph and Twitter Card tags."""
    def get_meta(name: str) -> Optional[str]:
        tag = soup.find("meta", attrs={"property": name}) or soup.find("meta", attrs={"name": name})
        return tag.get("content") if tag else None
    
    return {
        "ogTitle": get_meta("og:title"),
        "ogDescription": get_meta("og:description"),
        "ogImage": get_meta("og:image"),
        "twitterCard": get_meta("twitter:card"),
        "twitterTitle": get_meta("twitter:title"),
        "twitterDescription": get_meta("twitter:description"),
        "twitterImage": get_meta("twitter:image"),
    }


def extract_headings(soup: BeautifulSoup) -> Dict:
    """Extract all heading tags."""
    headings = {}
    for level in range(1, 7):
        tag = f"h{level}"
        headings[tag] = [h.get_text(strip=True) for h in soup.find_all(tag)]
    return headings


def extract_images(soup: BeautifulSoup) -> Dict:
    """Extract image information."""
    images = soup.find_all("img")
    
    with_alt = [img for img in images if img.get("alt")]
    without_alt = [img for img in images if not img.get("alt")]
    
    details = []
    for img in images[:10]:  # Limit to first 10
        details.append({
            "src": img.get("src", "unknown"),
            "alt": img.get("alt", "")
        })
    
    return {
        "total": len(images),
        "withAlt": len(with_alt),
        "withoutAlt": len(without_alt),
        "details": details
    }


def extract_links(soup: BeautifulSoup, base_url: str) -> Dict:
    """Extract link information."""
    links = soup.find_all("a", href=True)
    
    parsed_base = urlparse(base_url)
    base_domain = parsed_base.netloc
    
    internal = 0
    external = 0
    internal_urls = set()
    
    for link in links:
        href = link.get("href", "")
        
        # Skip empty, anchor, or javascript links
        if not href or href.startswith("#") or href.startswith("javascript:"):
            continue
        
        try:
            # Resolve relative URLs
            full_url = urljoin(base_url, href)
            parsed = urlparse(full_url)
            
            if parsed.netloc == base_domain:
                internal += 1
                # Skip asset links
                if not re.search(r"\.(jpg|jpeg|png|gif|css|js|pdf|svg|ico|xml)$", parsed.path, re.I):
                    internal_urls.add(full_url)
            elif href.startswith("http"):
                external += 1
        except Exception:
            pass
    
    return {
        "total": len(links),
        "internal": internal,
        "external": external,
        "internalUrls": list(internal_urls)[:25]  # Limit for deep scan
    }


def extract_keywords(soup: BeautifulSoup) -> tuple:
    """Extract and analyze keywords from content."""
    # Remove script, style, and other non-content tags
    for tag in soup(["script", "style", "noscript", "iframe", "code", "pre", "svg", "link", "meta"]):
        tag.decompose()
    
    text = soup.get_text(separator=" ")
    
    # Clean and tokenize
    words = re.findall(r"\b[a-z]{3,}\b", text.lower())
    words = [w for w in words if w not in STOP_WORDS and not w.isdigit()]
    
    word_count = len(words)
    
    # Calculate frequency
    frequency = {}
    for word in words:
        frequency[word] = frequency.get(word, 0) + 1
    
    # Get top keywords
    sorted_keywords = sorted(frequency.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Get meta info for context
    title = soup.title.string.lower() if soup.title and soup.title.string else ""
    description = ""
    desc_tag = soup.find("meta", attrs={"name": "description"})
    if desc_tag and desc_tag.get("content"):
        description = desc_tag.get("content").lower()
    
    h1_tags = [h1.get_text().lower() for h1 in soup.find_all("h1")]
    h1_text = " ".join(h1_tags)
    
    keywords = []
    for word, count in sorted_keywords:
        keywords.append({
            "word": word,
            "count": count,
            "density": round((count / word_count) * 100, 2) if word_count > 0 else 0,
            "inTitle": word in title,
            "inDescription": word in description,
            "inH1": word in h1_text
        })
    
    return keywords, word_count


def calculate_seo_score(meta: Dict, headings: Dict, images: Dict, links: Dict, word_count: int) -> tuple:
    """Calculate overall SEO score and identify issues."""
    score = 100
    issues = []
    
    # Title checks
    if not meta.get("title"):
        score -= 20
        issues.append({
            "type": "title",
            "label": "Missing Title Tag",
            "description": "The page title is missing.",
            "severity": "High"
        })
    elif len(meta.get("title", "")) > 60:
        score -= 5
        issues.append({
            "type": "title",
            "label": "Title Too Long",
            "description": f"Title is {len(meta.get('title', ''))} chars (recommended: < 60).",
            "severity": "Medium"
        })
    elif len(meta.get("title", "")) < 10:
        score -= 5
        issues.append({
            "type": "title",
            "label": "Title Too Short",
            "description": "Title is too short to be descriptive.",
            "severity": "Medium"
        })
    
    # Description checks
    if not meta.get("description"):
        score -= 20
        issues.append({
            "type": "description",
            "label": "Missing Meta Description",
            "description": "Meta description is missing.",
            "severity": "High"
        })
    elif len(meta.get("description", "")) > 160:
        score -= 3
        issues.append({
            "type": "description",
            "label": "Description Too Long",
            "description": "Meta description exceeds 160 characters.",
            "severity": "Low"
        })
    elif len(meta.get("description", "")) < 50:
        score -= 5
        issues.append({
            "type": "description",
            "label": "Description Too Short",
            "description": "Meta description is too short.",
            "severity": "Medium"
        })
    
    # H1 checks
    if not headings.get("h1"):
        score -= 15
        issues.append({
            "type": "h1",
            "label": "Missing H1 Heading",
            "description": "No H1 tag found.",
            "severity": "High"
        })
    elif len(headings.get("h1", [])) > 1:
        score -= 5
        issues.append({
            "type": "h1",
            "label": "Multiple H1 Tags",
            "description": "Multiple H1 tags found.",
            "severity": "Medium"
        })
    
    # Image alt checks
    if images.get("withoutAlt", 0) > 0:
        penalty = min(10, images["withoutAlt"] * 2)
        score -= penalty
        issues.append({
            "type": "images",
            "label": "Missing Alt Text",
            "description": f"{images['withoutAlt']} images are missing alt text.",
            "severity": "Medium"
        })
    
    # Content length check
    if word_count < 300:
        score -= 10
        issues.append({
            "type": "content",
            "label": "Thin Content",
            "description": f"Word count is {word_count} (recommended: > 300).",
            "severity": "Medium"
        })
    
    # Canonical check
    if not meta.get("canonical"):
        score -= 5
        issues.append({
            "type": "canonical",
            "label": "Missing Canonical Tag",
            "description": "Canonical tag is missing.",
            "severity": "Low"
        })
    
    return max(0, min(100, score)), issues


def generate_crawled_pages(url: str, internal_urls: List[str], meta: Dict, score: int) -> List[Dict]:
    """Generate crawled pages list for site-wide analysis."""
    crawled_pages = []
    
    # Add main page
    crawled_pages.append({
        "url": url,
        "status": "200",
        "score": score,
        "issues": max(0, (100 - score) // 5),
        "title": meta.get("title") or "Current Page"
    })
    
    # Add internal pages (simulated until deep scan)
    for page_url in internal_urls[:24]:  # Leave room for main page
        try:
            parsed = urlparse(page_url)
            path = parsed.path or "/"
            title = path.split("/")[-1].replace("-", " ").title() or "Internal Page"
            
            # Simulate variance
            import random
            variance = random.randint(-10, 10)
            page_score = max(0, min(100, score + variance))
            
            crawled_pages.append({
                "url": page_url,
                "status": "200",
                "score": page_score,
                "issues": random.randint(0, 5),
                "title": title if len(title) > 2 else "Internal Page"
            })
        except Exception:
            pass
    
    return crawled_pages
