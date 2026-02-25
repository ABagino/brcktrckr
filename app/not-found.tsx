import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold mb-3">404</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-block px-5 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
