import { create } from 'zustand';
import { QueueEntry, Provider, RiskBand, QueueSummary } from '../types';

interface AppState {
  // Queue state
  queueEntries: QueueEntry[];
  providers: Provider[];
  queueSummary: QueueSummary;
  
  // UI state
  loading: boolean;
  error: string | null;
  selectedEncounter: string | null;
  
  // Actions
  setQueueEntries: (entries: QueueEntry[]) => void;
  setProviders: (providers: Provider[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedEncounter: (encounterId: string | null) => void;
  updateQueueEntry: (encounterId: string, updates: Partial<QueueEntry>) => void;
  addQueueEntry: (entry: QueueEntry) => void;
  removeQueueEntry: (encounterId: string) => void;
  
  // Computed values
  getQueueSummary: () => QueueSummary;
  getEntriesByBand: (band: RiskBand) => QueueEntry[];
  getWaitingEntries: () => QueueEntry[];
  getAssignedEntries: () => QueueEntry[];
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  queueEntries: [],
  providers: [],
  queueSummary: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
  loading: false,
  error: null,
  selectedEncounter: null,

  // Actions
  setQueueEntries: (entries) => {
    set({ queueEntries: entries });
    const summary = get().getQueueSummary();
    set({ queueSummary: summary });
  },

  setProviders: (providers) => set({ providers }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setSelectedEncounter: (encounterId) => set({ selectedEncounter: encounterId }),

  updateQueueEntry: (encounterId, updates) => {
    set((state) => ({
      queueEntries: state.queueEntries.map(entry =>
        entry.encounterId === encounterId ? { ...entry, ...updates } : entry
      )
    }));
    const summary = get().getQueueSummary();
    set({ queueSummary: summary });
  },

  addQueueEntry: (entry) => {
    set((state) => ({
      queueEntries: [...state.queueEntries, entry]
    }));
    const summary = get().getQueueSummary();
    set({ queueSummary: summary });
  },

  removeQueueEntry: (encounterId) => {
    set((state) => ({
      queueEntries: state.queueEntries.filter(entry => entry.encounterId !== encounterId)
    }));
    const summary = get().getQueueSummary();
    set({ queueSummary: summary });
  },

  // Computed values
  getQueueSummary: () => {
    const { queueEntries } = get();
    return queueEntries.reduce(
      (summary, entry) => {
        summary[entry.band.toLowerCase() as keyof QueueSummary]++;
        summary.total++;
        return summary;
      },
      { critical: 0, high: 0, medium: 0, low: 0, total: 0 }
    );
  },

  getEntriesByBand: (band) => {
    const { queueEntries } = get();
    return queueEntries.filter(entry => entry.band === band);
  },

  getWaitingEntries: () => {
    const { queueEntries } = get();
    return queueEntries.filter(entry => entry.status === 'waiting');
  },

  getAssignedEntries: () => {
    const { queueEntries } = get();
    return queueEntries.filter(entry => entry.status === 'assigned');
  },
}));
