"use client";

import { useState } from 'react';

export default function ChatBot({ lessonId, lessonTitle, lessonGrade, lessonDifficulty }) {
  const [messages, setMessages] = useState([{ 
    type: 'bot',
    content: lessonTitle
      ? `Hi! I'm your Science AI assistant. Ask me any questions related to ${lessonTitle}.`
      : 'Hi! I\'m your Science AI assistant. Ask me if something is a myth or fact!'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          lessonId, 
          lessonTitle,
          grade: lessonGrade || "Grade 9-12", // Default if not provided
          difficulty: lessonDifficulty || "Intermediate" // Default if not provided
        }),
      });

      const data = await response.json();
      // console.log(typeof data.response)
      //  console.log(data);
      
      // Format the response based on what we receive
      let formattedContent;
      // console.log(data);
      if (data.error) {
        // Handle error response
        formattedContent = data.error;
      } else if (
        data.response &&
        typeof data.response === 'object' &&
        data.response.label &&
        data.response.explanation
      ) {
        // If response is an object with label and explanation
        const { label, explanation } = data.response;
        // console.log(label, explanation);
        formattedContent = `<strong>${label}</strong>: ${explanation}`;
      } else if (data.response) {
        // If response is already formatted
        formattedContent = data.response;
      } else {
        // Fallback
        formattedContent = "I couldn't process that properly. Please try another question.";
      }
      
      setMessages((prev) => [...prev, { 
        type: 'bot', 
        content: formattedContent 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render the bot's response with HTML formatting
  const renderBotResponse = (content) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-[400px] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.type === 'user'
                ? 'ml-auto bg-blue-500 text-white'
                : 'bg-white text-gray-800 border border-gray-200'
            } rounded-lg p-3 max-w-[80%] break-words shadow-sm`}
          >
            {message.type === 'user' ? (
              message.content
            ) : (
              renderBotResponse(message.content)
            )}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-200 rounded-lg p-3 max-w-[80%] animate-pulse">
            Thinking...
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about science..."
          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}