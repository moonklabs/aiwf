import { useState, useEffect } from 'react'
import { useAiwfStore } from '@/stores/aiwfStore'
import FeatureLedger from '@/components/aiwf/FeatureLedger'
import TokenUsage from '@/components/aiwf/TokenUsage'
import ContextStatus from '@/components/aiwf/ContextStatus'

export default function AiwfDashboard() {
  const { features, tokenUsage, contextStatus, loadDashboardData } = useAiwfStore()
  const [activeTab, setActiveTab] = useState('features')

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const tabs = [
    { id: 'features', name: 'Feature Ledger', icon: '📋' },
    { id: 'tokens', name: '토큰 사용량', icon: '🪙' },
    { id: 'context', name: 'Context 상태', icon: '📊' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          AIWF 대시보드
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          프로젝트의 AI 지원 개발 현황을 한눈에 확인하세요.
        </p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'features' && <FeatureLedger features={features} />}
        {activeTab === 'tokens' && <TokenUsage usage={tokenUsage} />}
        {activeTab === 'context' && <ContextStatus status={contextStatus} />}
      </div>
    </div>
  )
}