'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';
import { XPRing } from './XPRing';

export default function QuizResultModal({ isOpen, onClose, quizResult, previousXP, previousLevel }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [currentXP, setCurrentXP] = useState(previousXP || 0);
  const [targetXP, setTargetXP] = useState(previousXP || 0);
  const [currentLevel, setCurrentLevel] = useState(previousLevel || 1);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset animation state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Start with previous XP
      setCurrentXP(previousXP || 0);
      setCurrentLevel(previousLevel || 1);
      setAnimationComplete(false);
      
      // Calculate target XP (previous XP + gained XP)
      if (quizResult?.xpGained) {
        setTargetXP((previousXP || 0) + quizResult.xpGained);
      }
      
      // Start confetti for level up or passing the quiz
      if (quizResult?.levelUp || quizResult?.passed) {
        setTimeout(() => {
          setShowConfetti(true);
        }, 500);
      }

      // Start XP animation after a short delay
      const animationTimer = setTimeout(() => {
        animateXP();
      }, 800);

      return () => {
        clearTimeout(animationTimer);
      };
    } else {
      setShowConfetti(false);
    }
  }, [isOpen, quizResult, previousXP, previousLevel]);

  // Animates XP from previous to new value
  const animateXP = () => {
    const xpGained = quizResult?.xpGained || 0;
    if (xpGained <= 0) {
      setAnimationComplete(true);
      return;
    }

    const duration = 2000; // 2 seconds
    const frames = 60; // 60 frames per second
    const increment = xpGained / (duration / 1000 * frames);
    let currentVal = previousXP;
    let frame = 0;
    let levelIncreased = false;

    const animate = () => {
      frame++;
      currentVal += increment;
      setCurrentXP(Math.min(currentVal, previousXP + xpGained));
      
      // Check for level up
      if (quizResult?.levelUp && !levelIncreased && currentVal >= previousXP + (xpGained * 0.9)) {
        setCurrentLevel(previousLevel + 1);
        levelIncreased = true;
      }
      
      if (currentVal < previousXP + xpGained && frame < (duration / 1000 * frames)) {
        requestAnimationFrame(animate);
      } else {
        setCurrentXP(previousXP + xpGained);
        setAnimationComplete(true);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Continue to dashboard
  const handleContinue = () => {
    onClose();
    router.push('/dashboard');
  };

  // Try again
  const handleTryAgain = () => {
    onClose();
    // The parent component handles the restart logic
  };

  // Helper function to format time
  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={quizResult?.levelUp ? 500 : 200}
          gravity={0.1}
          colors={quizResult?.levelUp ? ['#FFD700', '#FFA500', '#FF8C00', '#FF4500'] : ['#00BFFF', '#1E90FF', '#0000FF', '#4169E1']}
          onConfettiComplete={() => setTimeout(() => setShowConfetti(false), 3000)}
        />
      )}
      
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition-all">
        {/* Header with result status */}
        <div className={`px-6 py-4 text-center ${quizResult?.passed ? 'bg-green-500' : 'bg-amber-500'} text-white`}>
          <h3 className="text-2xl font-bold">
            {quizResult?.passed ? 'Quiz Completed!' : 'Quiz Results'}
          </h3>
        </div>
        
        <div className="p-6">
          {/* Quiz Score */}
          <div className="text-center mb-6">
            <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <div className="text-3xl font-bold">
                {quizResult?.score}/{quizResult?.totalQuestions} 
                <span className="text-lg ml-2">({quizResult?.percentage}%)</span>
              </div>
            </div>
            <p className={`text-lg font-medium ${quizResult?.passed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {quizResult?.passed 
                ? 'Great job! You passed the quiz.' 
                : 'Keep practicing! You didn\'t pass this time.'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Time taken: {formatTime(quizResult?.timeTaken)}
            </p>
          </div>
          
          {/* XP and Level Animation */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Experience Points</h4>
              <div className="flex items-center justify-center">
                <XPRing 
                  xp={currentXP} 
                  level={currentLevel} 
                  size="lg" 
                  showAnimation={true}
                  previousXP={previousXP}
                />
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">XP Gained</h4>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
                </svg>
                +{quizResult?.xpGained || 0}
              </div>
              
              {quizResult?.xpBreakdown && Object.keys(quizResult.xpBreakdown).length > 0 && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-1">XP Breakdown:</p>
                  <ul className="list-disc pl-5">
                    {Object.entries(quizResult.xpBreakdown).map(([key, value]) => (
                      <li key={key}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: +{value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {quizResult?.levelUp && (
                <div className="mt-4 py-2 px-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 rounded-md animate-pulse">
                  <p className="font-bold text-center">LEVEL UP! → Level {currentLevel}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* New Badges (if any) */}
          {quizResult?.newBadges && quizResult.newBadges.length > 0 && (
            <div className="mt-6 mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 text-center">New Badges Earned!</h4>
              <div className="flex flex-wrap justify-center gap-4">
                {quizResult.newBadges.map((badge, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                      {badge.icon ? (
                        <img src={badge.icon} alt={badge.name} className="w-10 h-10" />
                      ) : (
                        <svg className="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button
              onClick={handleContinue}
              className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              View Dashboard
            </button>
            
            {!quizResult?.passed && (
              <button
                onClick={handleTryAgain}
                className="px-6 py-2 rounded-md bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}