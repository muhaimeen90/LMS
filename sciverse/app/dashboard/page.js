'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { lessonData } from '../data/lessonData';
import useUserProgress from '../hooks/useUserProgress';
import XPRing from '../components/XPRing';
import LevelBar from '../components/LevelBar';
import BadgesGrid from '../components/BadgesGrid';
import { announceToScreenReader } from '../utils/screenReaderAnnouncer';
import { useAuth } from '../utils/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const [lessons, setLessons] = useState([]);
  const { data, loading, error } = useUserProgress();
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
      announceToScreenReader('Dashboard loaded with your learning progress');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth or fetching progress
  if (isLoading || loading) {
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
          onClick={() => setConfirmReset(!confirmReset)}
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

      {/* Gamified Summary */}
      {data && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <XPRing xp={data.totalXP} level={data.level} />
            <LevelBar xp={data.totalXP} level={data.level} />
            <BadgesGrid badges={data.badges} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">Login Streak: {data.loginStreak} days</p>
          </div>
        </div>
      )}

      {/* Lesson Progress List */}
      <div className="space-y-4">
        {lessons.map(lesson => {
          const prog = data?.completedLessons.find(c => c.lessonId === lesson.id);
          return (
            <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800 dark:text-white">{lesson.title}</h4>
                <span className={`px-2 py-1 rounded-full text-sm ${prog ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}> 
                  {prog ? 'Completed' : 'Not Started'}
                </span>
              </div>
              {prog && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Completed on: {new Date(prog.dateCompleted).toLocaleDateString()} | Time Spent: {prog.timeSpentSec}s
                </p>
              )}
              <Link
                href={`/lessons/${lesson.id}`}
                className="mt-3 inline-block text-blue-600 hover:underline text-sm"
              >Go to Lesson</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
