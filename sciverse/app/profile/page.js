'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PersonalizedDashboard from '../components/PersonalizedDashboard';
import { lessonData } from '../data/lessonData';
import { getAllProgress, resetProgress } from '../utils/storageUtils';
import { announceToScreenReader } from '../utils/screenReaderAnnouncer';
import { useAuth } from '../utils/AuthContext';

export default function ProfilePage() {
  const [lessons, setLessons] = useState([]);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [progressData, setProgressData] = useState({});
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    // Only load data if authenticated
    if (isAuthenticated) {
      // Get lessons data
      setLessons(lessonData || []);
      
      // Get progress data
      const allProgress = getAllProgress();
      setProgressData(allProgress);
      
      // Announce page loaded to screen readers
      announceToScreenReader("Profile page loaded with your learning progress");
    }
  }, [isAuthenticated, isLoading, router]);
  
  const handleResetProgress = () => {
    if (resetConfirm) {
      resetProgress();
      setProgressData({});
      setResetConfirm(false);
      announceToScreenReader("All progress has been reset");
      
      // Force reload to update all components
      window.location.reload();
    } else {
      setResetConfirm(true);
      announceToScreenReader("Warning: You are about to reset all your progress. Press the button again to confirm.");
    }
  };
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated after loading, don't render the component
  // (the redirect will happen via the useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">My Learning Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 p-6">
          <div className="flex items-center mb-8">
            <div className="flex-shrink-0 mr-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold">
                {user?.email ? `${user.email}'s Journey` : 'Your Learning Journey'}
              </h2>
              <p className="text-gray-600 mt-1">
                Track your progress and get personalized recommendations
              </p>
            </div>
            
            <div className="ml-auto">
              <button 
                onClick={handleResetProgress}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  resetConfirm 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 text-gray-800'
                }`}
                aria-label={resetConfirm ? "Confirm reset all progress" : "Reset all progress"}
              >
                {resetConfirm ? 'Confirm Reset' : 'Reset Progress'}
              </button>
            </div>
          </div>
          
          {Object.keys(progressData).length > 0 ? (
            <PersonalizedDashboard lessons={lessons} />
          ) : (
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <h3 className="text-lg font-medium text-blue-700 mb-2">No Progress Yet</h3>
              <p className="text-blue-600 mb-4">
                Start your learning journey by completing lessons and quizzes.
              </p>
              <Link 
                href="/lessons"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Browse Lessons
              </Link>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Accessibility Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="font-size" className="block text-gray-700">Font Size</label>
                <select 
                  id="font-size" 
                  className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  aria-label="Select font size"
                >
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                  <option value="x-large">Extra Large</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="contrast" className="block text-gray-700">High Contrast</label>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input 
                    type="checkbox" 
                    name="contrast" 
                    id="contrast" 
                    className="sr-only"
                    aria-label="Toggle high contrast mode" 
                  />
                  <div className="block bg-gray-300 w-12 h-6 rounded-full"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="animations" className="block text-gray-700">Reduce Animations</label>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input 
                    type="checkbox" 
                    name="animations" 
                    id="animations" 
                    className="sr-only"
                    aria-label="Toggle reduced animations" 
                  />
                  <div className="block bg-gray-300 w-12 h-6 rounded-full"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Link 
                href="/accessibility"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                More accessibility settings
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Quick Actions
            </h3>
            <div className="space-y-4">
              <Link 
                href="/lessons"
                className="block p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="font-medium">Browse All Lessons</div>
                <div className="text-sm text-gray-600 mt-1">Explore our curriculum</div>
              </Link>
              
              <Link 
                href="/"
                className="block p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="font-medium">Learning Dashboard</div>
                <div className="text-sm text-gray-600 mt-1">View your learning statistics</div>
              </Link>
              
              <Link 
                href="/accessibility"
                className="block p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="font-medium">Accessibility Features</div>
                <div className="text-sm text-gray-600 mt-1">Customize your learning experience</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
