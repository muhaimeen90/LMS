"use client"; // Ensure this is a client component

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { lessonData } from '../data/lessonData';
import useDashboardData from '../hooks/useDashboardData';
import XPRing from '../components/XPRing';
import LevelBar from '../components/LevelBar';
import BadgesGrid from '../components/BadgesGrid';
import { announceToScreenReader } from '../utils/screenReaderAnnouncer';
import { useAuth } from '../utils/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refreshData } = useDashboardData();
  
  const [lessons, setLessons] = useState([]); // For static lesson data fallback
  const [confirmReset, setConfirmReset] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
      return;
    }
    if (isAuthenticated) {
      setLessons(lessonData || []); 
      announceToScreenReader('Dashboard loaded with your learning progress');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (dashboardData) {
      console.log("Dashboard data loaded:", dashboardData);
      if (dashboardData.ongoingLessons) {
        console.log("Ongoing lessons data:", dashboardData.ongoingLessons);
      }
      if (dashboardData.completedLessons) {
        console.log("Completed lessons data:", dashboardData.completedLessons);
      }
    }
  }, [dashboardData]);

  if (isLoading || dashboardLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }

  const handleResetProgress = async () => {
    if (!confirmReset || !user || !user.id) return;

    if (window.confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to reset progress');
        }

        announceToScreenReader('All progress has been reset.');
        await refreshData(); // Refresh the dashboard data after reset

      } catch (error) {
        console.error('Error resetting progress:', error);
        alert('There was an error resetting your progress. Please try again later.');
      } finally {
        setConfirmReset(false);
      }
    }
  };

  // Helper function to format time
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {user?.fullname || user?.email ? `${user.fullname || user.email}'s Dashboard` : 'Learning Dashboard'}
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
        {confirmReset && (
            <button
                onClick={handleResetProgress}
                className="ml-4 px-4 py-2 rounded-md bg-red-700 hover:bg-red-800 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
            >
                Yes, Reset All Progress
            </button>
        )}
      </div>

      {dashboardData?.user && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <XPRing xp={dashboardData.user.totalXP} level={dashboardData.user.level} />
            <LevelBar xp={dashboardData.user.totalXP} level={dashboardData.user.level} />
            <BadgesGrid badges={dashboardData.user.badges} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">Login Streak: {dashboardData.user.loginStreak} days</p>
          </div>
        </div>
      )}

      {dashboardError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>Could not load dashboard data: {dashboardError.message}</p>
          <button 
            onClick={refreshData}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Learning Statistics - Moved above ongoing lessons */}
      {dashboardData?.statistics && (
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Learning Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dashboardData.statistics.completed_lessons}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lessons Completed</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{dashboardData.statistics.in_progress_lessons}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lessons In Progress</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboardData.statistics.completion_rate?.toFixed(1)}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatTime(dashboardData.statistics.total_time_spent)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Study Time</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ongoing Lessons</h2>
        {dashboardData?.ongoingLessons && dashboardData.ongoingLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.ongoingLessons.map(lesson => (
              <div key={lesson.lessonId} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-lg text-gray-800 dark:text-white truncate">
                    {lesson.title || "Untitled Lesson"}
                  </h4>
                  <span className="px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                    In Progress
                  </span>
                </div>
                {lesson.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {lesson.description}
                  </p>
                )}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Time Spent: {formatTime(lesson.timeSpent)}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Last Accessed: {new Date(lesson.lastAccessed).toLocaleDateString()}
                    </p>
                    {lesson.difficulty && (
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        Difficulty: <span className="capitalize">{lesson.difficulty}</span>
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/lessons/${lesson.lessonId}`}
                  className="mt-4 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 w-full justify-center"
                >
                  Continue Lesson
                  <svg className="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No lessons currently in progress. Start a new one!</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Completed Lessons</h2>
        {dashboardData?.completedLessons && dashboardData.completedLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.completedLessons.map(completedLesson => (
              <div key={completedLesson.lessonId} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-lg text-gray-800 dark:text-white truncate">
                    {completedLesson.title || "Untitled Lesson"}
                  </h4>
                  <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    Completed
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Completed on: {new Date(completedLesson.dateCompleted).toLocaleDateString()}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Time Spent: {formatTime(completedLesson.timeSpentSec)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/lessons/${completedLesson.lessonId}`}
                  className="mt-4 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-md hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800 w-full justify-center"
                >
                  Review Lesson
                  <svg className="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No lessons completed yet. Keep learning!</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Quiz Attempts</h2>
        {dashboardData?.quizAttempts && dashboardData.quizAttempts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.quizAttempts.map((attempt, index) => ( 
              <div key={`${attempt.quizId}-${index}`} className={`border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 ${attempt.passed ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-lg text-gray-800 dark:text-white truncate">
                    {attempt.quizTitle || `Quiz for ${attempt.lessonTitle || 'Unknown Lesson'}`}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-sm ${attempt.passed ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                    {attempt.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Lesson: {attempt.lessonTitle || 'Unknown Lesson'}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Date: {new Date(attempt.dateTaken).toLocaleDateString()}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                      Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                    </p>
                    {attempt.timeTaken > 0 && (
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Time Taken: {formatTime(attempt.timeTaken)}
                      </p>
                    )}
                  </div>
                </div>
                {attempt.lessonId && (
                  <Link
                    href={`/lessons/${attempt.lessonId}`}
                    className={`mt-4 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-md focus:ring-4 focus:outline-none w-full justify-center ${
                      attempt.passed 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800'
                    }`}
                  >
                    View Lesson
                    <svg className="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No quiz attempts recorded yet.</p>
        )}
        {dashboardData?.quizAttempts?.length === 10 && (
          <div className="mt-4 text-center">
            <Link 
              href="/profile/quiz-history" 
              className="inline-block px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all quiz attempts...
            </Link>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Explore All Lessons</h2>
        {lessons && lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map(lesson => {
              const progressEntry = dashboardData?.detailedProgress?.find(p => (p.lesson_id === lesson.id || p.lesson_id === lesson._id));
              const isCompleted = progressEntry?.completed;
              const isInProgress = progressEntry && !progressEntry.completed;

              let statusLabel = 'Start Lesson';
              let statusClass = 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800';
              let badgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
              
              if (isCompleted) {
                statusLabel = 'Review Lesson';
                statusClass = 'bg-green-600 hover:bg-green-700 focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800';
                badgeClass = 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
              } else if (isInProgress) {
                statusLabel = 'Continue Lesson';
                statusClass = 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-300 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:focus:ring-yellow-800';
                badgeClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
              }

              return (
                <div key={lesson.id || lesson._id} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-lg text-gray-800 dark:text-white truncate">{lesson.title}</h4>
                    {(isCompleted || isInProgress) && (
                      <span className={`px-2 py-1 rounded-full text-sm ${badgeClass}`}>
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {lesson.description}
                    </p>
                  )}
                  <Link
                    href={`/lessons/${lesson.id || lesson._id}`}
                    className={`mt-4 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-md focus:ring-4 focus:outline-none w-full justify-center ${statusClass}`}
                  >
                    {statusLabel}
                    <svg className="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No lessons available to explore at the moment.</p>
        )}
      </div>
    </div>
  );
}
