export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {{projectName}}에 오신 것을 환영합니다
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          AIWF가 통합된 React + TypeScript 웹 애플리케이션입니다.
        </p>
      </div>

      <div className="mt-10">
        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
          <div className="relative">
            <dt>
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                빠른 개발
              </p>
            </dt>
            <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
              Vite를 사용한 빠른 HMR과 빌드 속도
            </dd>
          </div>

          <div className="relative">
            <dt>
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                타입 안정성
              </p>
            </dt>
            <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
              TypeScript로 견고한 타입 시스템 구축
            </dd>
          </div>

          <div className="relative">
            <dt>
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                AIWF 통합
              </p>
            </dt>
            <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
              AI 지원 개발 워크플로우 내장
            </dd>
          </div>

          <div className="relative">
            <dt>
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">
                모던 스타일링
              </p>
            </dt>
            <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
              Tailwind CSS로 빠른 UI 개발
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">시작하기</h3>
        <div className="mt-3 text-base text-gray-500 dark:text-gray-400">
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run dev</code>로 개발 서버를 시작하세요.
        </div>
      </div>
    </div>
  )
}