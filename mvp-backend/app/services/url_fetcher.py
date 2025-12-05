"""
URL Fetcher Service
Server-side URL fetching to avoid CORS issues and public proxy reliance.
"""
import httpx
from typing import Dict
from urllib.parse import urlparse


async def fetch_url_content(url: str, timeout: float = 30.0) -> Dict:
    """
    Fetch content from a URL server-side.
    
    Args:
        url: The URL to fetch
        timeout: Request timeout in seconds
        
    Returns:
        Dict with content, final_url, and status_code
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }
    
    async with httpx.AsyncClient(
        timeout=timeout,
        follow_redirects=True,
        verify=True
    ) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        
        return {
            "content": response.text,
            "final_url": str(response.url),
            "status_code": response.status_code
        }


def normalize_url(url: str) -> str:
    """
    Normalize a URL by ensuring it has a scheme.
    
    Args:
        url: The URL to normalize
        
    Returns:
        Normalized URL with https:// prefix if no scheme present
    """
    url = url.strip()
    if not url:
        return ""
    
    # Remove whitespace
    url = "".join(url.split())
    
    # Add https:// if no scheme
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    
    return url


def get_base_url(url: str) -> str:
    """
    Extract the base URL (scheme + netloc) from a URL.
    
    Args:
        url: The full URL
        
    Returns:
        Base URL (e.g., https://example.com)
    """
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}"
