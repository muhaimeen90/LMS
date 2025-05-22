"use client";

import { useState, useEffect } from 'react';

export default function FAQ({ lessonId }) {
  const [topQuestions, setTopQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchTopQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lesson-questions/top/${lessonId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch FAQ data: ${response.status}`);
        }
        
        const data = await response.json();
        setTopQuestions(data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching top questions:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTopQuestions();
  }, [lessonId]);

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>Could not load frequently asked questions: {error}</p>
      </div>
    );
  }

  // Empty state
  if (topQuestions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
        <p className="text-gray-600">No frequently asked questions yet. Be the first to ask something in the "Ask Anything" tab!</p>
      </div>
    );
  }

  // Display questions
  return (
    <div className="space-y-6">
      {topQuestions.map((question, idx) => (
        <div key={question._id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <p className="font-medium text-lg text-blue-700">Q: {question.questionText}</p>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Asked {question.count} time{question.count !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-4 pl-5 border-l-2 border-blue-200">
            <p className="font-semibold text-sm text-gray-500">{question.responseLabel}</p>
            <p className="mt-1 text-gray-700">{question.responseExplanation}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
