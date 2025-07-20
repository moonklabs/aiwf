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

interface FeatureLedgerProps {
  features: Feature[]
}

export default function FeatureLedger({ features }: FeatureLedgerProps) {
  const getStatusBadge = (status: Feature['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      planned: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }

    const labels = {
      completed: '완료',
      in_progress: '진행중',
      planned: '계획됨',
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Feature Ledger
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          프로젝트에서 개발된 모든 기능을 추적합니다.
        </p>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {features.map((feature) => (
            <li key={feature.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {feature.name}
                    </p>
                    {getStatusBadge(feature.status)}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{feature.id}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(feature.created_at).toLocaleDateString('ko-KR')}</span>
                    {feature.completed_at && (
                      <>
                        <span className="mx-2">→</span>
                        <span>{new Date(feature.completed_at).toLocaleDateString('ko-KR')}</span>
                      </>
                    )}
                  </div>
                  {feature.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {feature.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}