'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LessonsProgress({ lessons, completedLessons }) {
  const [sortedLessons, setSortedLessons] = useState([]);

  useEffect(() => {
    if (completedLessons && completedLessons.length > 0) {
      // Sort by most recently started/completed
      const sorted = [...completedLessons].sort((a, b) => {
        const dateA = a.dateCompleted || a.dateStarted || new Date(0);
        const dateB = b.dateCompleted || b.dateStarted || new Date(0);
        return new Date(dateB) - new Date(dateA);
      });
      setSortedLessons(sorted);
    }
  }, [completedLessons]);

  if (!completedLessons || completedLessons.length === 0) {
    return (
      <div className="bg-blue-50 p-6 rounded-lg text-center">
        <h3 className="text-lg font-medium text-blue-700 mb-2">No Lessons Started Yet</h3>
        <p className="text-blue-600 mb-4">
          Start your learning journey by exploring our lessons.
        </p>
        <Link 
          href="/lessons"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Browse Lessons
        </Link>
      </div>
    );
  }

  // Function to find lesson title by ID
  const findLessonTitle = (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);
    return lesson ? lesson.title : 'Unknown Lesson';
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not yet';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to format time spent
  const formatTimeSpent = (seconds) => {
    if (!seconds || seconds === 0) return 'Not tracked';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return 'Less than a minute';
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Learning Progress</h2>
        
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lesson
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Started
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLessons.map((lessonProgress) => (
                <tr key={lessonProgress.lessonId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/lessons/${lessonProgress.lessonId}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {findLessonTitle(lessonProgress.lessonId)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lessonProgress.dateStarted)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lessonProgress.dateCompleted)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimeSpent(lessonProgress.timeSpentSec)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lessonProgress.completed ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        In Progress
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}