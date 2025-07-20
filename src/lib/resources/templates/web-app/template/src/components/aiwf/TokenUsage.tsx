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

interface TokenUsageProps {
  usage: TokenUsageData
}

export default function TokenUsage({ usage }: TokenUsageProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            토큰 사용 현황
          </h3>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>사용량</span>
              <span>{usage.used.toLocaleString()} / {usage.total.toLocaleString()}</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${usage.percentage}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{usage.percentage}% 사용</span>
              <span>{usage.remaining.toLocaleString()} 토큰 남음</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            최근 사용 내역
          </h4>
          <div className="space-y-3">
            {usage.history.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.date).toLocaleString('ko-KR')}
                  </p>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {item.tokens.toLocaleString()} 토큰
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}