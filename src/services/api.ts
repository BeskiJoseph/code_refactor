import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface RefactorRequest {
  code: string;
  language: string;
  settings?: {
    useAirbnbStyle?: boolean;
    convertCallbacks?: boolean;
    addComments?: boolean;
    removeDeadCode?: boolean;
    improveNaming?: boolean;
  };
}

export interface RefactorResponse {
  success: boolean;
  data: {
    refactoredCode: string;
    metrics: {
      originalLines: number;
      refactoredLines: number;
      linesReduced: number;
      qualityScore: number;
    };
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
}

export const apiService = {
  // Refactor endpoints
  async refactorCode(request: RefactorRequest): Promise<RefactorResponse> {
    const response = await api.post('/refactor', request);
    return response.data;
  },

  async uploadAndRefactor(file: File, settings?: any) {
    const formData = new FormData();
    formData.append('file', file);
    if (settings) {
      formData.append('settings', JSON.stringify(settings));
    }

    const response = await api.post('/refactor/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadZipFile(formData: FormData) {
    const response = await api.post('/refactor/upload-zip', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getRefactorStats() {
    const response = await api.get('/refactor/stats');
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },

  async refactorZipAnimated(files: { name: string; content: string }[]) {
    const response = await fetch(`${API_BASE_URL}/refactor/refactor-zip-animated`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files }),
    });
    return response.json();
  },
};

export default apiService;
