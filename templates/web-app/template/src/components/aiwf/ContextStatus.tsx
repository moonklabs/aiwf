interface ContextStatusData {
  compressionLevel: 'none' | 'balanced' | 'aggressive'
  cacheEnabled: boolean
  cacheSize: number
  maxCacheSize: number
  lastCompression: string
  savedTokens: number
  activePersona: string
}

interface ContextStatusProps {
  status: ContextStatusData
}

export default function ContextStatus({ status }: ContextStatusProps) {
  const compressionLevels = {
    none: { label: '없음', color: 'gray' },
    balanced: { label: '균형', color: 'blue' },
    aggressive: { label: '공격적', color: 'orange' },
  }

  const level = compressionLevels[status.compressionLevel]

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Context 압축 설정
          </h3>
          
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                압축 레벨
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${level.color}-100 text-${level.color}-800 dark:bg-${level.color}-900 dark:text-${level.color}-200`}>
                  {level.label}
                </span>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                캐시 상태
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {status.cacheEnabled ? '활성화' : '비활성화'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                캐시 사용량
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {(status.cacheSize / 1024 / 1024).toFixed(2)} MB / {(status.maxCacheSize / 1024 / 1024).toFixed(0)} MB
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                절약된 토큰
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {status.savedTokens.toLocaleString()} 토큰
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            AI 페르소나
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                현재 활성 페르소나
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                프로젝트 유형에 최적화된 AI 어시스턴트
              </p>
            </div>
            <span className="text-sm font-medium text-primary">
              {status.activePersona}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            마지막 압축
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(status.lastCompression).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>
    </div>
  )
}