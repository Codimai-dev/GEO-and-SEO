export const fetchUrlContent = async (targetUrl: string): Promise<{ content: string, finalUrl: string }> => {
  let formattedUrl = targetUrl.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
  }

  try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(formattedUrl)}`);
      if (response.ok) {
          const data = await response.json();
          if (data.contents) {
              return { 
                  content: data.contents, 
                  finalUrl: data.status?.url || formattedUrl 
              };
          }
      }
  } catch (e) {
      console.warn("AllOrigins failed, trying next proxy...", e);
  }

  try {
      const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(formattedUrl)}`);
      if (response.ok) {
          const content = await response.text();
          if (content) return { content, finalUrl: formattedUrl };
      }
  } catch (e) {
      console.warn("CodeTabs failed, trying next proxy...", e);
  }

  try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(formattedUrl)}`);
      if (response.ok) {
          const content = await response.text();
          if (content) return { content, finalUrl: formattedUrl };
      }
  } catch (e) {
      console.warn("CorsProxy failed", e);
  }

  throw new Error("Failed to fetch URL content via all available proxies.");
};