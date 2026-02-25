import axios from 'axios';

// API Base Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Configure axios defaults (shared with auth store)
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface Position {
  id: string;
  stockSymbol: string;
  stockName?: string;
  direction: 'long' | 'short';
  status: 'active' | 'closed';
  currentQuantity: number;
  totalQuantityBought: number;
  totalQuantitySold: number;
  averageBuyPrice: number;
  averageSellPrice?: number;
  totalInvested: number;
  totalReceived: number;
  totalCommission: number;
  unrealizedPnL?: number;
  realizedPnL?: number;
  openDate: string;
  closeDate?: string;
  tags: string[];
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  positionId: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  commission: number;
  date: string;
  notes?: string;
}

export interface Trade {
  id: string;
  stockSymbol: string;
  stockName?: string;
  tradeType: 'buy' | 'sell';
  price: number;
  quantity: number;
  totalAmount: number;
  currency: string;
  commission: number;
  tradeDate: string;
  notes?: string;
  tags: string[];
}

export interface ReviewNote {
  id: string;
  title: string;
  content: string;
  tradeId?: string;
  rating: number;
  tags: string[];
  date: string;
  stockSymbol?: string;
  reviewDate?: string;
  mood?: 'positive' | 'neutral' | 'negative';
  attachments?: string[];
  marketCondition?: string;
  lessonsLearned?: string;
  actionItems?: string[];
  isPublic?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class ApiService {
  private client = axios; // Use the shared axios instance

  private async request<T>(
    endpoint: string,
    options: any = {}
  ): Promise<T> {
    console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);
    console.log('Authorization header:', this.client.defaults.headers.common['Authorization']);

    try {
      const response = await this.client({
        url: endpoint,
        method: options.method || 'GET',
        data: options.data,
        params: options.params,
        ...options
      });
      
      return response.data;
    } catch (error: any) {
      console.error(`API request failed: ${endpoint}`, error);
      
      if (error.response) {
        const errorData = error.response.data;
        throw new Error(errorData.message || `HTTP ${error.response.status}: ${error.response.statusText}`);
      }
      
      throw error;
    }
  }

  // Auth API
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    return this.request('/auth/login', {
      method: 'POST',
      data: { email, password }
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    language?: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    return this.request('/auth/register', {
      method: 'POST',
      data: userData
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return this.request('/auth/refresh', {
      method: 'POST',
      data: { refreshToken }
    });
  }

  // Positions API
  async getPositions(): Promise<{ positions: Position[] }> {
    return this.request('/positions');
  }

  async createPosition(data: {
    stockSymbol: string;
    stockName?: string;
    direction: 'long' | 'short';
    price: number;
    quantity: number;
    date: string;
    notes?: string;
    commission?: number;
    tags?: string[];
  }): Promise<{ position: Position }> {
    return this.request('/positions', {
      method: 'POST',
      data
    });
  }

  async addTransaction(positionId: string, data: {
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
    date: string;
    notes?: string;
    commission?: number;
  }): Promise<{ position: Position }> {
    return this.request(`/positions/${positionId}/transactions`, {
      method: 'POST',
      data
    });
  }

  async closePosition(positionId: string, data: {
    price: number;
    date: string;
    notes?: string;
    commission?: number;
  }): Promise<{ position: Position }> {
    return this.request(`/positions/${positionId}/close`, {
      method: 'POST',
      data
    });
  }

  async getPositionStatistics(): Promise<{
    totalInvestment: number;
    totalRealizedPnL: number;
    totalPositions: number;
    activePositions: number;
    closedPositions: number;
  }> {
    return this.request('/positions/statistics');
  }

  // Trades API (Legacy)
  async getTrades(params?: {
    page?: number;
    limit?: number;
    stockSymbol?: string;
    tradeType?: 'buy' | 'sell';
    startDate?: string;
    endDate?: string;
  }): Promise<{ trades: Trade[]; pagination: any }> {
    return this.request('/trades', {
      method: 'GET',
      params
    });
  }

  async createTrade(data: {
    stockSymbol: string;
    stockName?: string;
    tradeType: 'buy' | 'sell';
    price: number;
    quantity: number;
    tradeDate: string;
    notes?: string;
    commission?: number;
  }): Promise<{ trade: Trade }> {
    return this.request('/trades', {
      method: 'POST',
      data
    });
  }

  async updateTrade(id: string, data: Partial<Trade>): Promise<{ trade: Trade }> {
    return this.request(`/trades/${id}`, {
      method: 'PUT',
      data
    });
  }

  async deleteTrade(id: string): Promise<{ message: string }> {
    return this.request(`/trades/${id}`, {
      method: 'DELETE'
    });
  }

  // Review Notes API
  async getReviewNotes(): Promise<{ notes: ReviewNote[] }> {
    return this.request('/notes');
  }

  async createReviewNote(data: {
    title: string;
    content: string;
    tradeId?: string;
    rating: number;
    tags: string[];
    date: string;
  }): Promise<{ note: ReviewNote }> {
    return this.request('/notes', {
      method: 'POST',
      data
    });
  }

  async updateReviewNote(id: string, data: Partial<ReviewNote>): Promise<{ note: ReviewNote }> {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      data
    });
  }

  async deleteReviewNote(id: string): Promise<{ message: string }> {
    return this.request(`/notes/${id}`, {
      method: 'DELETE'
    });
  }

  // Analytics API
  async getOverviewAnalytics(): Promise<{
    totalTrades: number;
    totalPositions: number;
    activePositions: number;
    totalInvestment: number;
    totalProfitLoss: number;
    winRate: number;
    winningTrades: number;
    losingTrades: number;
    monthlyProfit: any[];
    stockPerformance: any[];
  }> {
    return this.request('/analytics/overview');
  }

  async getPerformanceAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    return this.request(`/analytics/performance?period=${period}`);
  }

  // I18n API
  async getTranslations(language: string): Promise<any> {
    return this.request(`/i18n/${language}`);
  }
}

export const apiService = new ApiService();
export default apiService;