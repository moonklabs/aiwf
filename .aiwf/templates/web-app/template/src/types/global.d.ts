interface Window {
  aiwf: {
    trackPage: (path: string) => void
    trackEvent: (event: string, data?: any) => void
    getFeatures: () => Promise<any[]>
    getTokenUsage: () => Promise<any>
    getContextStatus: () => Promise<any>
  }
}