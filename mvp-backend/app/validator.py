from urllib.parse import urlparse

def validate_url(url: str):
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        raise ValueError("Invalid URL format")
    return url
