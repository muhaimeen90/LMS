import Link from 'next/link';
import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6" aria-label="Welcome to SciVerse">
          Welcome to <span className="text-blue-600">SciVerse</span>
        </h1>
        <p className="text-xl max-w-3xl mx-auto mb-8">
          An interactive and accessible platform for exploring the wonders of science. 
          Learn at your own pace through gamified lessons, test your knowledge, and discover the truth behind common science myths.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/lessons" 
            className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Start Learning"
          >
            Start Learning
          </Link>
          <Link 
            href="/accessibility" 
            className="bg-gray-200 hover:bg-gray-300 focus:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label="Customize Experience"
          >
            Customize Experience
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 grid md:grid-cols-3 gap-8" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Features</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Interactive Lessons</h3>
          <p>Engage with science concepts through interactive, gamified learning experiences designed for all learning styles.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Science Fact Checker</h3>
          <p>Test your knowledge and learn to distinguish between scientific facts and common misconceptions.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Inclusive Design</h3>
          <p>Built with accessibility in mind, offering customizable settings to ensure science education is accessible to everyone.</p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-50 rounded-lg text-center px-4" aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="text-3xl font-bold mb-4">Ready to Start Your Science Journey?</h2>
        <p className="text-xl max-w-2xl mx-auto mb-8">
          Jump into our interactive lessons or challenge yourself with the Science Fact Checker.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/lessons" 
            className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="View Lessons"
          >
            View Lessons
          </Link>
          <Link 
            href="/fact-checker" 
            className="bg-white hover:bg-gray-100 focus:bg-gray-100 text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Try Fact Checker"
          >
            Try Fact Checker
          </Link>
        </div>
      </section>
    </div>
  );
}
