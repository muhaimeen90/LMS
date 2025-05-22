import React, { useMemo } from 'react';
import Link from 'next/link';

export default function QuizPerformanceInsights({ quizAttempts = [], completedLessons = [] }) {
  // Calculate insights based on quiz data
  const insights = useMemo(() => {
    if (!quizAttempts || quizAttempts.length === 0) {
      return {
        strengths: [],
        weakAreas: [],
        recommendations: [],
        streak: 0,
        improvement: 0,
        performanceTrend: 'stable',
        hasEnoughData: false
      };
    }

    // Track topics by success/failure
    const topicPerformance = {};
    const recentAttempts = [...quizAttempts].sort((a, b) => 
      new Date(b.attemptDate) - new Date(a.attemptDate)
    );
    
    // Calculate pass rate for recent quizzes
    const passRate = recentAttempts.filter(a => a.passed).length / recentAttempts.length;
    
    // Identify streak of consecutive passes
    let currentStreak = 0;
    for (const attempt of recentAttempts) {
      if (attempt.passed) currentStreak++;
      else break;
    }

    // Process attempts to identify strengths and weak areas
    recentAttempts.forEach(attempt => {
      // If the quiz has topics/categories
      if (attempt.topics && attempt.topics.length > 0) {
        attempt.topics.forEach(topic => {
          if (!topicPerformance[topic]) {
            topicPerformance[topic] = { correct: 0, total: 0 };
          }
          
          topicPerformance[topic].total++;
          if (attempt.passed) {
            topicPerformance[topic].correct++;
          }
        });
      }
      
      // Use the quiz title or lesson title as a fallback topic
      const topic = attempt.quizTitle || attempt.lessonTitle || 'General';
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0 };
      }
      
      topicPerformance[topic].total++;
      if (attempt.passed) {
        topicPerformance[topic].correct++;
      }
    });
    
    // Calculate improvement by comparing first half vs second half performance
    let improvement = 0;
    if (recentAttempts.length >= 4) {
      const midpoint = Math.floor(recentAttempts.length / 2);
      const recentHalf = recentAttempts.slice(0, midpoint);
      const earlierHalf = recentAttempts.slice(midpoint);
      
      const recentPassRate = recentHalf.filter(a => a.passed).length / recentHalf.length;
      const earlierPassRate = earlierHalf.filter(a => a.passed).length / earlierHalf.length;
      
      improvement = ((recentPassRate - earlierPassRate) * 100).toFixed(1);
    }
    
    // Identify performance trend
    let performanceTrend = 'stable';
    if (improvement > 5) performanceTrend = 'improving';
    else if (improvement < -5) performanceTrend = 'declining';
    
    // Extract strengths and weak areas
    const strengths = [];
    const weakAreas = [];
    
    Object.entries(topicPerformance).forEach(([topic, stats]) => {
      const successRate = stats.correct / stats.total;
      
      if (successRate >= 0.7 && stats.total >= 2) {
        strengths.push({ topic, successRate: (successRate * 100).toFixed(0) });
      } else if (successRate <= 0.5 && stats.total >= 2) {
        weakAreas.push({ topic, successRate: (successRate * 100).toFixed(0) });
      }
    });
    
    // Sort by performance
    strengths.sort((a, b) => b.successRate - a.successRate);
    weakAreas.sort((a, b) => a.successRate - b.successRate);
    
    // Generate personalized recommendations
    const recommendations = [];
    
    // Recommend reviewing weak areas
    if (weakAreas.length > 0) {
      weakAreas.slice(0, 2).forEach(area => {
        // Find lessons related to this weak area
        const relevantLessons = completedLessons.filter(lesson => 
          lesson.title && lesson.title.toLowerCase().includes(area.topic.toLowerCase())
        );
        
        if (relevantLessons.length > 0) {
          recommendations.push({
            type: 'review',
            text: `Review ${area.topic} lessons to improve your understanding`,
            lessonId: relevantLessons[0].lessonId,
            priority: 'high'
          });
        } else {
          recommendations.push({
            type: 'practice',
            text: `Practice more quizzes on ${area.topic} to build your skills`,
            priority: 'high'
          });
        }
      });
    }
    
    // Recommend advancing if they're doing well
    if (strengths.length > 2 && passRate > 0.7) {
      recommendations.push({
        type: 'advance',
        text: 'You\'re doing well! Try some advanced lessons to challenge yourself',
        priority: 'medium'
      });
    }
    
    // Recommend consistency if they've been inactive
    const lastAttemptDate = new Date(recentAttempts[0]?.attemptDate || Date.now());
    const daysSinceLastQuiz = Math.floor((Date.now() - lastAttemptDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastQuiz > 7) {
      recommendations.push({
        type: 'consistency',
        text: 'It\'s been a while since your last quiz. Regular practice helps retention!',
        priority: 'medium'
      });
    }
    
    // If there's not much data, recommend exploring more content
    if (recentAttempts.length < 3) {
      recommendations.push({
        type: 'explore',
        text: 'Try more quizzes to get personalized learning recommendations',
        priority: 'low'
      });
    }
    
    // Sort recommendations by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return {
      strengths: strengths.slice(0, 3),
      weakAreas: weakAreas.slice(0, 3),
      recommendations: recommendations.slice(0, 3),
      streak: currentStreak,
      improvement,
      performanceTrend,
      hasEnoughData: recentAttempts.length >= 2
    };
  }, [quizAttempts, completedLessons]);

  // If there's no quiz data, show minimal component
  if (!insights.hasEnoughData) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Performance Insights
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Complete more quizzes to receive personalized learning insights and recommendations.
        </p>
        <div className="mt-4">
          <Link href="/quizzes" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Find Quizzes
            <svg className="w-3.5 h-3.5 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Render insights for users with sufficient quiz history
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Performance Insights</h3>
        {insights.streak > 0 && (
          <div className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-sm font-medium">
            🔥 {insights.streak} Quiz Streak
          </div>
        )}
      </div>

      {insights.performanceTrend !== 'stable' && (
        <div className={`mb-4 p-3 rounded-md ${
          insights.performanceTrend === 'improving' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-100' 
            : 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-100'
        }`}>
          <div className="flex items-center">
            {insights.performanceTrend === 'improving' ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
                </svg>
                <span>Your performance has improved by {Math.abs(insights.improvement)}% recently!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd"></path>
                </svg>
                <span>Your performance has declined by {Math.abs(insights.improvement)}% recently. Let's work on improvement!</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Strengths Section */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4">
          <h4 className="font-medium text-green-800 dark:text-green-100 mb-2">Your Strengths</h4>
          {insights.strengths.length > 0 ? (
            <ul className="space-y-2">
              {insights.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-center text-sm text-green-700 dark:text-green-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  {strength.topic} ({strength.successRate}% success rate)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-green-700 dark:text-green-200 italic">
              Keep taking quizzes to identify your strengths!
            </p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-md p-4">
          <h4 className="font-medium text-amber-800 dark:text-amber-100 mb-2">Areas for Improvement</h4>
          {insights.weakAreas.length > 0 ? (
            <ul className="space-y-2">
              {insights.weakAreas.map((area, idx) => (
                <li key={idx} className="flex items-center text-sm text-amber-700 dark:text-amber-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
                  </svg>
                  {area.topic} ({area.successRate}% success rate)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-amber-700 dark:text-amber-200 italic">
              Great job! No specific weak areas identified.
            </p>
          )}
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <h4 className="font-medium text-gray-800 dark:text-white mb-3">Personalized Recommendations</h4>
        {insights.recommendations.map((rec, idx) => (
          <div key={idx} className="mb-3 flex items-start">
            {rec.type === 'review' && (
              <span className="shrink-0 w-6 h-6 mr-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 005.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                </svg>
              </span>
            )}
            {rec.type === 'practice' && (
              <span className="shrink-0 w-6 h-6 mr-2 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
              </span>
            )}
            {rec.type === 'advance' && (
              <span className="shrink-0 w-6 h-6 mr-2 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
                </svg>
              </span>
            )}
            {(rec.type === 'consistency' || rec.type === 'explore') && (
              <span className="shrink-0 w-6 h-6 mr-2 bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              </span>
            )}
            <div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{rec.text}</p>
              {rec.lessonId && (
                <Link href={`/lessons/${rec.lessonId}`} className="mt-1 text-xs inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                  Go to lesson
                  <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}