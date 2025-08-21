export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Patient {
  mrn?: string;
  dob?: string;
}

export interface Vitals {
  hr?: number;
  bp?: string;
  rr?: number;
  spo2?: number;
  tempC?: number;
}

export interface IntakeData {
  patient?: Patient;
  narrative: string;
  painScore: number;
  vitals: Vitals;
  language?: string;
  specialNeeds?: string[];
}

export interface RiskAssessment {
  score: number;
  band: RiskBand;
  modelVersion: string;
  explanation: {
    topFactors: Array<{
      factor: string;
      weight: number;
    }>;
    llmRedFlags?: string[];
  };
}

export interface QueueEntry {
  queueId: string;
  encounterId: string;
  band: RiskBand;
  priorityScore: number;
  waitMinutes: number;
  ageFactor: number;
  specialNeeds: boolean;
  providerMatchScore: number;
  status: 'waiting' | 'assigned' | 'in_room' | 'complete';
  assignedProviderId?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Provider {
  provider_id: string;
  name: string;
  specialty: string;
  status: string;
}

export interface QueueSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}
