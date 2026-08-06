import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { integrationStorage } from '@/lib/integration-storage';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'testing';

export interface IntegrationState {
  id: string;
  status: IntegrationStatus;
  settings: Record<string, any>;
  secretRefs: Record<string, string>;
  publicMetadata: Record<string, string>;
  lastTestedAt?: string;
}

interface IntegrationStore {
  integrations: Record<string, IntegrationState>;
  loadIntegrations: () => void;
  updateIntegrationStatus: (id: string, status: IntegrationStatus) => void;
  testConnection: (id: string) => Promise<boolean>;
}

export const useIntegrationStore = create<IntegrationStore>()((set, get) => ({
  integrations: {},
  
  loadIntegrations: () => {
    const ids = ['github', 'drive', 'company'];
    const loaded: Record<string, IntegrationState> = {};
    
    ids.forEach(id => {
      const saved = integrationStorage.load(id);
      if (saved) {
        loaded[id] = {
          id,
          status: saved.status as IntegrationStatus,
          settings: saved.settings || {},
          secretRefs: saved.secretRefs || {},
          publicMetadata: saved.publicMetadata || {},
        };
      } else {
        loaded[id] = {
          id,
          status: 'disconnected',
          settings: {},
          secretRefs: {},
          publicMetadata: {},
        };
      }
    });
    
    set({ integrations: loaded });
  },

  updateIntegrationStatus: (id, status) => {
    set((state) => ({
      integrations: {
        ...state.integrations,
        [id]: {
          ...state.integrations[id],
          status,
        }
      }
    }));
  },

  testConnection: async (id: string) => {
    // Set to testing state
    get().updateIntegrationStatus(id, 'testing');
    
    // Simulate network delay for ping
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if the integration actually has some secretRefs configured
    const integration = get().integrations[id];
    const hasSecrets = integration && Object.keys(integration.secretRefs).length > 0;
    
    const newStatus = hasSecrets ? 'connected' : 'error';
    get().updateIntegrationStatus(id, newStatus);
    
    return hasSecrets;
  }
}));
