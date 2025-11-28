// API Service for Backend Communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserData {
  id: number;
  email: string;
  full_name: string;
}

export interface ReportPayload {
  title: string;
  url: string;
  payload: any;
}

export interface ReportResponse {
  id: number;
  title: string;
  url: string;
  payload: any;
  owner_id: number;
  created_at: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // FastAPI OAuth2 expects form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', credentials.email); // FastAPI uses 'username' field
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Invalid credentials');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async signup(data: SignupData): Promise<UserData> {
    const userData = await this.request('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return userData;
  }

  async logout() {
    this.clearToken();
  }

  // Reports endpoints
  async createReport(data: ReportPayload): Promise<ReportResponse> {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReports(): Promise<ReportResponse[]> {
    return this.request('/reports', {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
