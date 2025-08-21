import axios from 'axios';
import { IntakeData, RiskAssessment, QueueEntry, Provider, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const QUEUE_BASE_URL = process.env.REACT_APP_QUEUE_BASE_URL || 'http://localhost:8082';

// Intake API
export const intakeApi = {
  submitIntake: async (data: IntakeData): Promise<ApiResponse<{
    encounterId: string;
    initialRisk: RiskAssessment;
    queue: any;
  }>> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/intake/encounters`, data);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || 'Failed to submit intake',
        details: error.response?.data?.details || error.message
      };
    }
  },

  updateIntake: async (encounterId: string, updates: Partial<IntakeData>): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/intake/encounters/${encounterId}`, updates);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || 'Failed to update intake',
        details: error.response?.data?.details || error.message
      };
    }
  }
};

// Queue API
export const queueApi = {
  getQueue: async (): Promise<ApiResponse<QueueEntry[]>> => {
    try {
      const response = await axios.get(`${QUEUE_BASE_URL}/queue`);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || 'Failed to fetch queue',
        details: error.response?.data?.details || error.message
      };
    }
  },

  getProviders: async (): Promise<ApiResponse<Provider[]>> => {
    try {
      const response = await axios.get(`${QUEUE_BASE_URL}/providers`);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || 'Failed to fetch providers',
        details: error.response?.data?.details || error.message
      };
    }
  },

  assignProvider: async (encounterId: string, providerId: string): Promise<ApiResponse<QueueEntry>> => {
    try {
      const response = await axios.post(`${QUEUE_BASE_URL}/queue/assign`, {
        encounterId,
        providerId
      });
      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || 'Failed to assign provider',
        details: error.response?.data?.details || error.message
      };
    }
  }
};

// WebSocket connection for real-time updates
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private url: string, private onMessage: (data: any) => void) {}

  connect() {
    try {
      this.ws = new WebSocket(`${this.url}/queue/stream`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
