import { API_CONFIG } from '../config/api';

class ApiService {
    private async fetchWithError(url: string, options: RequestInit = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return response.json();
    }

    // Métodos para la API Interna
    async getInternalData(endpoint: string) {
        return this.fetchWithError(`${API_CONFIG.INTERNAL_API_URL}${endpoint}`);
    }

    async postInternalData(endpoint: string, data: any) {
        return this.fetchWithError(`${API_CONFIG.INTERNAL_API_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Métodos para la API Externa
    async getExternalData(endpoint: string) {
        return this.fetchWithError(`${API_CONFIG.EXTERNAL_API_URL}${endpoint}`);
    }

    async postExternalData(endpoint: string, data: any) {
        return this.fetchWithError(`${API_CONFIG.EXTERNAL_API_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const apiService = new ApiService(); 