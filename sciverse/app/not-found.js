import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8 text-blue-600">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Page Not Found</h1>
        
        <p className="text-xl text-gray-600 mb-8 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return Home
          </Link>
          
          <Link 
            href="/lessons"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Browse Lessons
          </Link>
        </div>
      </div>
    </div>
  );
}
