import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    // AIWF 페이지 추적
    if (window.aiwf) {
      window.aiwf.trackPage(location.pathname)
    }
  }, [location])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {{projectName}}
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === '/'
                      ? 'border-primary text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  홈
                </Link>
                <Link
                  to="/aiwf"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === '/aiwf'
                      ? 'border-primary text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  AIWF 대시보드
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <Outlet />
      </main>
    </div>
  )
}