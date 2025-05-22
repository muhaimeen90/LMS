// "use client";

// import { useState } from 'react';
// import { scienceFactsData } from '../data/scienceFactsData';
// import ChatBot from '../components/ChatBot';

// export default function FactCheckerPage() {
//   const [activeCard, setActiveCard] = useState(null); // State to track the active card ('quiz' or 'chatbot')
//   const [currentFactIndex, setCurrentFactIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState({});
//   const [showResults, setShowResults] = useState(false);
//   const [score, setScore] = useState(0);

//   const currentFact = scienceFactsData[currentFactIndex];
//   const totalFacts = scienceFactsData.length;

//   // Handle user's answer for quiz
//   const handleAnswer = (answer) => {
//     const newAnswers = {
//       ...userAnswers,
//       [currentFact.id]: answer,
//     };

//     setUserAnswers(newAnswers);

//     if (currentFactIndex < totalFacts - 1) {
//       setCurrentFactIndex(currentFactIndex + 1);
//     } else {
//       calculateScore(newAnswers);
//       setShowResults(true);
//     }
//   };

//   // Calculate the user's score for quiz
//   const calculateScore = (answers) => {
//     let correct = 0;

//     scienceFactsData.forEach((fact) => {
//       if (answers[fact.id] === fact.isTrue) {
//         correct++;
//       }
//     });

//     setScore(Math.round((correct / totalFacts) * 100));
//   };

//   // Reset the quiz
//   const resetQuiz = () => {
//     setCurrentFactIndex(0);
//     setUserAnswers({});
//     setShowResults(false);
//     setScore(0);
//   };

//   // Handle card click to set the active card
//   const handleCardClick = (card) => {
//     setActiveCard(card === activeCard ? null : card); // Toggle off if same card is clicked again
//     if (card === 'quiz') resetQuiz(); // Reset quiz state when activating quiz card
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Science Fact Checker</h1>

//         {/* Cards Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//           {/* Quiz Card */}
//           <div
//             className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 ${
//               activeCard === 'quiz'
//                 ? 'border-2 border-blue-600'
//                 : 'border border-gray-200 hover:border-blue-300'
//             }`}
//             onClick={() => handleCardClick('quiz')}
//           >
//             <h2 className="text-xl font-semibold mb-2 text-gray-800">Quiz</h2>
//             <p className="text-gray-600">Test your knowledge about science myths and facts.</p>
//           </div>

//           {/* Chatbot Card */}
//           <div
//             className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 ${
//               activeCard === 'chatbot'
//                 ? 'border-2 border-blue-600'
//                 : 'border border-gray-200 hover:border-blue-300'
//             }`}
//             onClick={() => handleCardClick('chatbot')}
//           >
//             <h2 className="text-xl font-semibold mb-2 text-gray-800">Chatbot</h2>
//             <p className="text-gray-600">Ask science-related questions and get AI-powered answers.</p>
//           </div>
//         </div>

//         {/* Content Area */}
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="p-6">
//             {activeCard === 'quiz' && (
//               <>
//                 <h2 className="text-2xl font-semibold mb-4">Myth or Fact?</h2>
//                 <p className="text-gray-700 mb-6">
//                   Test your knowledge about common science claims. Is each statement a myth or a fact?
//                 </p>

//                 {showResults ? (
//                   // Results view
//                   <div className="text-center py-4">
//                     <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
//                       <span className="text-3xl font-bold text-blue-600">{score}%</span>
//                     </div>

//                     <h3 className="text-xl font-semibold mb-4">Your Results</h3>

//                     <p className="mb-8">
//                       You correctly identified {score}% of the science facts and myths.
//                       {score >= 80
//                         ? ' Excellent! You have a great scientific knowledge.'
//                         : ' Keep learning to improve your scientific literacy!'}
//                     </p>

//                     <button
//                       onClick={resetQuiz}
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       aria-label="Start Over"
//                     >
//                       Try Again
//                     </button>

//                     {/* Review Answers */}
//                     <div className="mt-12 text-left">
//                       <h3 className="text-xl font-semibold mb-4">Review Facts & Explanations</h3>

//                       <div className="space-y-6">
//                         {scienceFactsData.map((fact, index) => {
//                           const userAnswer = userAnswers[fact.id];
//                           const isCorrect = userAnswer === fact.isTrue;

//                           return (
//                             <div
//                               key={fact.id}
//                               className={`p-4 rounded-lg border ${
//                                 isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
//                               }`}
//                             >
//                               <p className="font-medium">
//                                 {index + 1}. {fact.statement}
//                               </p>

//                               <div className="flex items-center text-sm mt-2">
//                                 <span className="font-medium mr-2">Status:</span>
//                                 <span className={fact.isTrue ? 'text-green-600' : 'text-red-600'}>
//                                   {fact.isTrue ? 'FACT' : 'MYTH'}
//                                 </span>
//                               </div>

//                               <div className="flex items-center text-sm mt-1">
//                                 <span className="font-medium mr-2">Your answer:</span>
//                                 <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
//                                   {userAnswer ? 'FACT' : 'MYTH'} {isCorrect ? '✓' : '✗'}
//                                 </span>
//                               </div>

//                               <p className="text-gray-700 mt-3">
//                                 <span className="font-medium">Explanation:</span> {fact.explanation}
//                               </p>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   // Quiz view
//                   <div>
//                     <div className="mb-6">
//                       <div className="flex justify-between mb-1">
//                         <span className="text-sm font-medium">Question {currentFactIndex + 1} of {totalFacts}</span>
//                         <span className="text-sm font-medium">
//                           {Math.round((currentFactIndex / totalFacts) * 100)}% Complete
//                         </span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2.5">
//                         <div
//                           className="bg-blue-600 h-2.5 rounded-full"
//                           style={{ width: `${(currentFactIndex / totalFacts) * 100}%` }}
//                           role="progressbar"
//                           aria-valuenow={Math.round((currentFactIndex / totalFacts) * 100)}
//                           aria-valuemin="0"
//                           aria-valuemax="100"
//                         ></div>
//                       </div>
//                     </div>

//                     <div className="bg-blue-50 p-6 rounded-lg mb-8">
//                       <p className="text-xl font-medium mb-2" aria-live="polite">
//                         "{currentFact.statement}"
//                       </p>
//                     </div>

//                     <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                       <button
//                         onClick={() => handleAnswer(false)}
//                         className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-lg font-medium flex-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
//                         aria-label="This is a myth"
//                       >
//                         MYTH
//                       </button>
//                       <button
//                         onClick={() => handleAnswer(true)}
//                         className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg font-medium flex-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//                         aria-label="This is a fact"
//                       >
//                         FACT
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}

//             {activeCard === 'chatbot' && (
//               <>
//                 <h2 className="text-2xl font-semibold mb-4">Chat with Science AI</h2>
//                 <p className="text-gray-700 mb-6">
//                   Ask any science-related question and get answers from our AI-powered chatbot.
//                 </p>
//                 <ChatBot />
//               </>
//             )}

//             {!activeCard && (
//               <p className="text-center text-gray-500">
//                 Click a card above to start (Quiz or Chatbot).
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="bg-gray-50 rounded-lg p-6 text-center mt-8">
//           <h3 className="text-xl font-semibold mb-2">About Science Fact Checker</h3>
//           <p className="text-gray-700">
//             This interactive tool helps you distinguish between common science myths and facts or chat with an AI to learn more about science. Testing your knowledge or asking questions is a great way to improve scientific literacy and critical thinking skills.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from 'react';
import ChatBot from '../components/ChatBot';
import { useQuestions } from '../hooks/useQuestions';

export default function FactCheckerPage() {
  const { questions, loading, error } = useQuestions();
  const [activeCard, setActiveCard] = useState(null); // State to track the active card ('quiz' or 'chatbot')
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Get current fact based on index
  const currentFact = questions[currentFactIndex] || {};
  const totalFacts = questions.length;

  // Handle user's answer for quiz
  const handleAnswer = (answer) => {
    const newAnswers = {
      ...userAnswers,
      [currentFact.id]: answer,
    };

    setUserAnswers(newAnswers);

    if (currentFactIndex < totalFacts - 1) {
      setCurrentFactIndex(currentFactIndex + 1);
    } else {
      calculateScore(newAnswers);
      setShowResults(true);
    }
  };

  // Calculate the user's score for quiz
  const calculateScore = (answers) => {
    let correct = 0;

    questions.forEach((fact) => {
      if (answers[fact.id] === fact.isTrue) {
        correct++;
      }
    });

    setScore(Math.round((correct / totalFacts) * 100));
  };

  // Reset the quiz
  const resetQuiz = () => {
    setCurrentFactIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
  };

  // Handle card click to set the active card
  const handleCardClick = (card) => {
    setActiveCard(card === activeCard ? null : card); // Toggle off if same card is clicked again
    if (card === 'quiz') resetQuiz(); // Reset quiz state when activating quiz card
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Science Fact Checker</h1>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Quiz Card */}
          <div
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 ${
              activeCard === 'quiz'
                ? 'border-2 border-blue-600'
                : 'border border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleCardClick('quiz')}
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Quiz</h2>
            <p className="text-gray-600">Test your knowledge about science myths and facts.</p>
          </div>

          {/* Chatbot Card */}
          <div
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 ${
              activeCard === 'chatbot'
                ? 'border-2 border-blue-600'
                : 'border border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleCardClick('chatbot')}
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Chatbot</h2>
            <p className="text-gray-600">Ask science-related questions and get AI-powered answers.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {activeCard === 'quiz' && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Myth or Fact?</h2>
                <p className="text-gray-700 mb-6">
                  Test your knowledge about common science claims. Is each statement a myth or a fact?
                </p>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading questions...</p>
                  </div>
                ) : error ? (
                 <div className="text-center py-8">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    ) : questions.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-gray-700">No questions available at the moment.</p>
        <p className="mt-2 text-gray-600">Please try again later when more questions have been added to the database.</p>
      </div>
    ): showResults ? (
                  // Results view
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
                      <span className="text-3xl font-bold text-blue-600">{score}%</span>
                    </div>

                    <h3 className="text-xl font-semibold mb-4">Your Results</h3>

                    <p className="mb-8">
                      You correctly identified {score}% of the science facts and myths.
                      {score >= 80
                        ? ' Excellent! You have a great scientific knowledge.'
                        : ' Keep learning to improve your scientific literacy!'}
                    </p>

                    <button
                      onClick={resetQuiz}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Start Over"
                    >
                      Try Again
                    </button>

                    {/* Review Answers */}
                    <div className="mt-12 text-left">
                      <h3 className="text-xl font-semibold mb-4">Review Facts & Explanations</h3>

                      <div className="space-y-6">
                        {questions.map((fact, index) => {
                          const userAnswer = userAnswers[fact.id];
                          const isCorrect = userAnswer === fact.isTrue;

                          return (
                            <div
                              key={fact.id}
                              className={`p-4 rounded-lg border ${
                                isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                              }`}
                            >
                              <p className="font-medium">
                                {index + 1}. {fact.statement}
                              </p>

                              <div className="flex items-center text-sm mt-2">
                                <span className="font-medium mr-2">Status:</span>
                                <span className={fact.isTrue ? 'text-green-600' : 'text-red-600'}>
                                  {fact.isTrue ? 'FACT' : 'MYTH'}
                                </span>
                              </div>

                              <div className="flex items-center text-sm mt-1">
                                <span className="font-medium mr-2">Your answer:</span>
                                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                  {userAnswer ? 'FACT' : 'MYTH'} {isCorrect ? '✓' : '✗'}
                                </span>
                              </div>

                              <p className="text-gray-700 mt-3">
                                <span className="font-medium">Explanation:</span> {fact.explanation}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : questions.length > 0 ? (
                  // Quiz view
                  <div>
                    <div className="mb-6">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Question {currentFactIndex + 1} of {totalFacts}</span>
                        <span className="text-sm font-medium">
                          {Math.round((currentFactIndex / totalFacts) * 100)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${(currentFactIndex / totalFacts) * 100}%` }}
                          role="progressbar"
                          aria-valuenow={Math.round((currentFactIndex / totalFacts) * 100)}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg mb-8">
                      <p className="text-xl font-medium mb-2" aria-live="polite">
                        "{currentFact.statement}"
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => handleAnswer(false)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-lg font-medium flex-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="This is a myth"
                      >
                        MYTH
                      </button>
                      <button
                        onClick={() => handleAnswer(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg font-medium flex-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        aria-label="This is a fact"
                      >
                        FACT
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No questions available. Please try again later.</p>
                  </div>
                )}
              </>
            )}

            {activeCard === 'chatbot' && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Chat with Science AI</h2>
                <p className="text-gray-700 mb-6">
                  Ask any science-related question and get answers from our AI-powered chatbot.
                </p>
                <ChatBot />
              </>
            )}

            {!activeCard && (
              <p className="text-center text-gray-500">
                Click a card above to start (Quiz or Chatbot).
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-center mt-8">
          <h3 className="text-xl font-semibold mb-2">About Science Fact Checker</h3>
          <p className="text-gray-700">
            This interactive tool helps you distinguish between common science myths and facts or chat with an AI to learn more about science. Testing your knowledge or asking questions is a great way to improve scientific literacy and critical thinking skills.
          </p>
        </div>
      </div>
    </div>
  );
}