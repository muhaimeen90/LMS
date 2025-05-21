// "use client";

// import { useState } from 'react';

// export default function ChatBot() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userMessage = input;
//     console.log('User:', userMessage);
//     setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: userMessage }),
//       });
      
//       const data = await response.json();
//       setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
//     } catch (error) {
//       console.error('Error:', error);
//       setMessages(prev => [...prev, { 
//         type: 'bot', 
//         content: 'Sorry, I encountered an error. Please try again.' 
//       }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden h-[600px] flex flex-col">
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             className={`${
//               message.type === 'user' 
//                 ? 'ml-auto bg-blue-500 text-white' 
//                 : 'bg-gray-100'
//             } rounded-lg p-3 max-w-[80%]`}
//           >
//             {message.content}
//           </div>
//         ))}
//         {isLoading && (
//           <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] animate-pulse">
//             Thinking...
//           </div>
//         )}
//       </div>
//       <form onSubmit={handleSubmit} className="p-4 border-t">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Ask anything about science..."
//             className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
//           >
//             Send
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }



// "use client";

// import { useState } from 'react';

// export default function ChatBot() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userMessage = input;
//     setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: userMessage }),
//       });

//       const data = await response.json();
//       setMessages((prev) => [...prev, { type: 'bot', content: data.response }]);
//     } catch (error) {
//       console.error('Error:', error);
//       setMessages((prev) => [
//         ...prev,
//         { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Function to format the bot's response with paragraphs, bold text, and bullet points
//   const formatBotResponse = (text) => {
//     // Replace **text** with <strong>text</strong> for bold
//     let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

//     // Split into paragraphs based on double newlines
//     const paragraphs = formattedText.split('\n\n').map((paragraph, index) => {
//       // Split into lines for bullet point detection
//       const lines = paragraph.split('\n').map((line, lineIndex) => {
//         line = line.trim();
//         if (line.startsWith('* ')) {
//           const bulletContent = line.replace(/^\*\s*/, ''); // Remove "* " marker
//           return (
//             <li key={lineIndex} className="ml-6 list-disc text-gray-700">
//               <span dangerouslySetInnerHTML={{ __html: bulletContent }} />
//             </li>
//           );
//         }
//         return (
//           <p key={lineIndex} className="text-gray-700 mb-2">
//             <span dangerouslySetInnerHTML={{ __html: line }} />
//           </p>
//         );
//       });

//       return (
//         <div key={index} className="mb-4">
//           {lines.some((line) => line.type === 'li') ? (
//             <ul className="pl-4">{lines}</ul>
//           ) : (
//             lines
//           )}
//         </div>
//       );
//     });

//     return paragraphs;
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden h-[400px] flex flex-col">
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             className={`${
//               message.type === 'user'
//                 ? 'ml-auto bg-blue-500 text-white'
//                 : 'bg-white text-gray-800 border border-gray-200'
//             } rounded-lg p-3 max-w-[80%] break-words shadow-sm`}
//           >
//             {message.type === 'user' ? (
//               message.content
//             ) : (
//               <div className="prose prose-sm max-w-none text-base leading-relaxed">
//                 {formatBotResponse(message.content)}
//               </div>
//             )}
//           </div>
//         ))}
//         {isLoading && (
//           <div className="bg-gray-200 rounded-lg p-3 max-w-[80%] animate-pulse">
//             Thinking...
//           </div>
//         )}
//       </div>
//       <form onSubmit={handleSubmit} className="p-4 border-t flex items-center">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Ask anything about science..."
//           className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// }

"use client";

import { useState } from 'react';

export default function ChatBot() {
  const [messages, setMessages] = useState([{
    type: 'bot',
    content: 'Hi! I\'m your Science AI assistant. Ask me if something is a myth or fact!'
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
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
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
      } else if (data.response.label && data.response.explanation && typeof data.response === 'object') {
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