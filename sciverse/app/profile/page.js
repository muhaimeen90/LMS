import Link from 'next/link';

export const metadata = {
  title: 'Profile - SciVerse',
  description: 'Your SciVerse learning profile',
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">My Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold mb-2">Profile Placeholder</h2>
            <p className="text-gray-600 mb-6">
              This is a placeholder for the future profile page.
            </p>
            
            <div className="bg-gray-100 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-4">Planned Features</h3>
              
              <ul className="text-left space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Learning progress tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Achievement badges
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Completed lessons history
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Quiz performance statistics
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Learning path recommendations
                </li>
              </ul>
            </div>
            
            <Link 
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Return to home page"
            >
              Back to Home
            </Link>
          </div>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
          <p className="font-medium">Feature in Development</p>
          <p className="mt-1">User profiles and progress tracking will be implemented in a future update.</p>
        </div>
      </div>
    </div>
  );
}
