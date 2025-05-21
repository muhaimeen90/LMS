// "use client";
// import { useState, useEffect } from 'react';
// import { scienceFactsData } from '../data/scienceFactsData';

// export function useQuestions() {
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function fetchQuestions() {
//       try {
//         setLoading(true);
        
//         // Fetch top 10 questions from the API
//         const response = await fetch('http://localhost:5000/api/questions/top?limit=10');
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch questions');
//         }
        
//         const data = await response.json();
        
//         // Transform database questions to match the format expected by the quiz
//         const formattedQuestions = data.map((question, index) => ({
//           id: question._id,
//           statement: question.Question,
//           isTrue: question.isTrue,
//           explanation: question.Explanation
//         }));
        
//         // If we have fewer than 10 questions from the database, add from scienceFactsData
//         if (formattedQuestions.length < 10) {
//           const remainingNeeded = 10 - formattedQuestions.length;
//           const additionalQuestions = scienceFactsData.slice(0, remainingNeeded);
          
//           // Make sure we don't add duplicate questions
//           // (This is a simple check - you might want a more sophisticated duplicate detection)
//           const dbQuestionTexts = formattedQuestions.map(q => q.statement.toLowerCase());
          
//           const filteredAdditionalQuestions = additionalQuestions.filter(
//             staticQ => !dbQuestionTexts.includes(staticQ.statement.toLowerCase())
//           );
          
//           // Combine database questions with static questions
//           setQuestions([...formattedQuestions, ...filteredAdditionalQuestions.slice(0, remainingNeeded)]);
//         } else {
//           setQuestions(formattedQuestions);
//         }
//       } catch (err) {
//         console.error('Error fetching questions:', err);
//         setError(err.message);
//         // Fall back to static data if API fails
//         setQuestions(scienceFactsData);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchQuestions();
//   }, []);

//   return { questions, loading, error };
// }

"use client";
import { useState, useEffect } from 'react';

export function useQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        
        // Fetch top 10 questions from the API
        const response = await fetch('http://localhost:5000/api/questions/top?limit=10');
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        
        const data = await response.json();
        
        // Transform database questions to match the format expected by the quiz
        const formattedQuestions = data.map((question) => ({
          id: question._id,
          statement: question.Question,
          isTrue: question.isTrue,
          explanation: question.Explanation
        }));
        
        setQuestions(formattedQuestions);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message);
        // Set empty array instead of falling back to static data
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  return { questions, loading, error };
}