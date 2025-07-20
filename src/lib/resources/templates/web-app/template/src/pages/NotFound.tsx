import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-primary">404</p>
        <h1 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          요청하신 페이지가 존재하지 않습니다.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="text-base font-medium text-primary hover:text-primary/80"
          >
            홈으로 돌아가기<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  )
}