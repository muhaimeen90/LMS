'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { lessonData } from '../data/lessonData';
import PersonalizedDashboard from '../components/PersonalizedDashboard';
import { getAllProgress, resetProgress } from '../utils/storageUtils';
import { announceToScreenReader } from '../utils/screenReaderAnnouncer';
import { useAuth } from '../utils/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const [lessons, setLessons] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
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
      setLessons(lessonData || []);
      const allProg = getAllProgress();
      setProgressData(allProg);
      announceToScreenReader('Dashboard loaded with your learning progress');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleReset = () => {
    if (confirmReset) {
      resetProgress();
      setProgressData({});
      setConfirmReset(false);
      announceToScreenReader('All progress has been reset');
      window.location.reload();
    } else {
      setConfirmReset(true);
      announceToScreenReader('Press again to confirm resetting all progress');
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Loading your dashboard...</p>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {user?.email ? `${user.email}'s Dashboard` : 'Learning Dashboard'}
        </h1>
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            confirmReset
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 text-gray-800'
          }`}
          aria-label={confirmReset ? 'Confirm reset all progress' : 'Reset all progress'}
        >
          {confirmReset ? 'Confirm Reset' : 'Clear Progress'}
        </button>
      </div>

      {Object.keys(progressData).length > 0 ? (
        <PersonalizedDashboard lessons={lessons} />
      ) : (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-medium text-blue-700 mb-2">No progress yet</h3>
          <p className="text-blue-600 mb-4">Start by completing lessons and quizzes.</p>
          <Link
            href="/lessons"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Browse Lessons
          </Link>
        </div>
      )}
    </div>
  );
}
