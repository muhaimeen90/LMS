import Link from 'next/link';
import { lessonData } from '../data/lessonData';

export const metadata = {
  title: 'Lessons - SciVerse',
  description: 'Explore interactive science lessons with SciVerse',
};

export default function LessonsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Science Lessons</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">{lessonData.title}</h2>
            <p className="text-gray-700 mb-6">{lessonData.description}</p>
            
            <Link 
              href={`/lessons/${lessonData.id}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Start lesson: ${lessonData.title}`}
            >
              Start Lesson
            </Link>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">More Lessons Coming Soon!</h2>
          <p className="text-gray-700 mb-2">
            We're working on adding more interactive science lessons in various subjects.
          </p>
          <p className="text-gray-700">
            Check back soon for lessons on Chemistry, Biology, Astronomy, and more!
          </p>
        </div>
      </div>
    </div>
  );
}
