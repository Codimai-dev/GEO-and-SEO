/**
 * API Service
 * Centralized API client for backend communication.
 * All API keys are kept server-side - this client only talks to our backend.
 */

// Always use /api prefix - Vite proxy handles forwarding in development
// The VITE_API_URL is used by Vite's proxy configuration, not directly by the client
// This ensures CORS is handled by the proxy
const API_BASE_URL = '/api';
const TOKEN_KEY = 'codimai_token';

// Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    full_name?: string;
}

export interface UserResponse {
    id: number;
    email: string;
    full_name: string | null;
    is_active: boolean;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface ReportCreate {
    title: string;
    url: string;
    payload: string;
}

export interface ReportResponse {
    id: number;
    title: string;
    url: string;
    payload: string | null;
    created_at: string;
}

export interface PaginatedReports {
    items: ReportResponse[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface FetchUrlResponse {
    content: string;
    final_url: string;
    status_code: number;
}

export interface PSIResponse {
    performance_score: number;
    core_web_vitals: {
        lcp: { value: string; score: string };
        fcp: { value: string; score: string };
        cls: { value: string; score: string };
        inp: { value: string; score: string };
    };
    failed_audits: Array<{
        id: string;
        title: string;
        description: string;
        score: number;
        displayValue: string;
    }>;
    screenshot?: string;
}

export interface SEOAuditResponse {
    checklist: string[];
    issues: Array<{
        issue_description: string;
        category: string;
        impact: 'High' | 'Medium' | 'Low';
        page_or_section: string;
        recommendation: string;
        error_or_notes?: string;
    }>;
}

export interface PerformanceGuideResponse {
    summary: string;
    fixes: Array<{
        title: string;
        severity: 'High' | 'Medium' | 'Low';
        technical_explanation: string;
        code_suggestion: string;
        impact_on_seo: string;
    }>;
}

export interface SEOFilesResponse {
    robots_txt: string;
    sitemap_xml: string;
    llms_txt: string;
}

class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Dispatch auth state change event
    private notifyAuthChange(isAuthenticated: boolean): void {
        window.dispatchEvent(new CustomEvent('auth-change', { detail: { isAuthenticated } }));
    }

    // Token Management
    private getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    private setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
        this.notifyAuthChange(true);
    }

    private clearToken(): void {
        localStorage.removeItem(TOKEN_KEY);
        this.notifyAuthChange(false);
    }

    // Request Helper
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = this.getToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Request failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    }

    // Auth State
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Auth Endpoints
    async signup(data: SignupRequest): Promise<UserResponse> {
        return this.request<UserResponse>('/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async login(data: LoginRequest): Promise<TokenResponse> {
        const response = await this.request<TokenResponse>('/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setToken(response.access_token);
        return response;
    }

    logout(): void {
        this.clearToken();
    }

    async getCurrentUser(): Promise<UserResponse> {
        return this.request<UserResponse>('/me');
    }

    // Reports Endpoints
    async getReports(page = 1, limit = 20): Promise<PaginatedReports> {
        return this.request<PaginatedReports>(`/reports?page=${page}&limit=${limit}`);
    }

    async getReport(id: number): Promise<ReportResponse> {
        return this.request<ReportResponse>(`/reports/${id}`);
    }

    async createReport(data: ReportCreate): Promise<ReportResponse> {
        return this.request<ReportResponse>('/reports', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateReport(id: number, title: string): Promise<ReportResponse> {
        return this.request<ReportResponse>(`/reports/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ title }),
        });
    }

    async deleteReport(id: number): Promise<void> {
        return this.request<void>(`/reports/${id}`, {
            method: 'DELETE',
        });
    }

    // Analysis Endpoints (Server-side - keeps secrets secure)
    async fetchUrl(url: string): Promise<FetchUrlResponse> {
        return this.request<FetchUrlResponse>('/fetch-url', {
            method: 'POST',
            body: JSON.stringify({ url }),
        });
    }

    async analyzeSEO(url: string, deepScan = true, maxPages = 50): Promise<any> {
        return this.request<any>('/seo/analyze', {
            method: 'POST',
            body: JSON.stringify({ url, deep_scan: deepScan, max_pages: maxPages }),
        });
    }

    async runPageSpeed(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PSIResponse> {
        return this.request<PSIResponse>('/psi/run', {
            method: 'POST',
            body: JSON.stringify({ url, strategy }),
        });
    }

    // AI Endpoints (Server-side - keeps Gemini API key secure)
    async getSEOAudit(url: string, seoData: any): Promise<SEOAuditResponse> {
        return this.request<SEOAuditResponse>('/ai/seo-audit', {
            method: 'POST',
            body: JSON.stringify({ url, seo_data: seoData }),
        });
    }

    async getPerformanceGuide(psiData: any): Promise<PerformanceGuideResponse> {
        return this.request<PerformanceGuideResponse>('/ai/performance-guide', {
            method: 'POST',
            body: JSON.stringify({ psi_data: psiData }),
        });
    }

    async getSpecificFix(issueType: string, context: any): Promise<any> {
        return this.request<any>('/ai/specific-fix', {
            method: 'POST',
            body: JSON.stringify({ issue_type: issueType, context }),
        });
    }

    async generateSEOFiles(url: string, siteData: any): Promise<SEOFilesResponse> {
        return this.request<SEOFilesResponse>('/ai/generate-seo-files', {
            method: 'POST',
            body: JSON.stringify({ url, site_data: siteData }),
        });
    }
}

// Export singleton instance
export const apiService = new ApiService();
