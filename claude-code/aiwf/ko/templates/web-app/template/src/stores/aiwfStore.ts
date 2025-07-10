import { create } from 'zustand'

interface Feature {
  id: string
  name: string
  description: string
  status: 'completed' | 'in_progress' | 'planned'
  type: string
  created_at: string
  completed_at?: string
  tags: string[]
}

interface TokenUsageData {
  total: number
  used: number
  remaining: number
  percentage: number
  history: Array<{
    date: string
    tokens: number
    action: string
  }>
}

interface ContextStatusData {
  compressionLevel: 'none' | 'balanced' | 'aggressive'
  cacheEnabled: boolean
  cacheSize: number
  maxCacheSize: number
  lastCompression: string
  savedTokens: number
  activePersona: string
}

interface AiwfStore {
  features: Feature[]
  tokenUsage: TokenUsageData
  contextStatus: ContextStatusData
  loadDashboardData: () => Promise<void>
  updateFeature: (featureId: string, updates: Partial<Feature>) => void
  addFeature: (feature: Feature) => void
}

export const useAiwfStore = create<AiwfStore>((set) => ({
  features: [],
  tokenUsage: {
    total: 100000,
    used: 45000,
    remaining: 55000,
    percentage: 45,
    history: []
  },
  contextStatus: {
    compressionLevel: 'balanced',
    cacheEnabled: true,
    cacheSize: 5242880, // 5MB
    maxCacheSize: 52428800, // 50MB
    lastCompression: new Date().toISOString(),
    savedTokens: 15000,
    activePersona: 'fullstack-developer'
  },

  loadDashboardData: async () => {
    try {
      // 실제 구현에서는 API를 호출하거나 로컬 파일을 읽습니다
      const mockFeatures: Feature[] = [
        {
          id: 'F001',
          name: '프로젝트 초기 설정',
          description: 'React + TypeScript + Vite 기반 웹 애플리케이션 초기 설정',
          type: 'setup',
          status: 'completed',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          tags: ['초기설정', '인프라', '설정']
        }
      ]

      const mockHistory = [
        {
          date: new Date().toISOString(),
          tokens: 1500,
          action: '컴포넌트 생성'
        },
        {
          date: new Date(Date.now() - 3600000).toISOString(),
          tokens: 2300,
          action: 'API 통합'
        },
        {
          date: new Date(Date.now() - 7200000).toISOString(),
          tokens: 800,
          action: '코드 리뷰'
        }
      ]

      set({
        features: mockFeatures,
        tokenUsage: {
          total: 100000,
          used: 45000,
          remaining: 55000,
          percentage: 45,
          history: mockHistory
        }
      })
    } catch (error) {
      console.error('Failed to load AIWF dashboard data:', error)
    }
  },

  updateFeature: (featureId, updates) => {
    set((state) => ({
      features: state.features.map((feature) =>
        feature.id === featureId ? { ...feature, ...updates } : feature
      )
    }))
  },

  addFeature: (feature) => {
    set((state) => ({
      features: [...state.features, feature]
    }))
  }
}))