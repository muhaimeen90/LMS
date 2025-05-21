import Link from 'next/link';
import { lessonData } from '../data/lessonData';

export default function LessonNotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-blue-600">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Lesson Not Found</h1>
        
        <p className="text-xl text-gray-600 mb-8 dark:text-gray-400">
          Sorry, we couldn't find the lesson you're looking for. It may have been moved or removed.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Available Lessons</h2>
          
          <div className="space-y-4">
            {lessonData.map(lesson => (
              <Link 
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-white">{lesson.title}</div>
                {lesson.description && (
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {lesson.description.substring(0, 120)}...
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4">
          <Link 
            href="/"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return Home
          </Link>
          
          <Link 
            href="/profile"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-3 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
