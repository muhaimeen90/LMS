'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="/" className="flex items-center">
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-blue-600">SciVerse</span>
            </a>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Making science education accessible to everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-4 text-sm font-bold text-gray-900 uppercase dark:text-white">Resources</h2>
              <ul className="text-gray-600 dark:text-gray-400">
                <li className="mb-2">
                  <a href="/lessons" className="hover:underline focus:underline focus:outline-none">Lessons</a>
                </li>
                <li>
                  <a href="/fact-checker" className="hover:underline focus:underline focus:outline-none">Fact Checker</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-bold text-gray-900 uppercase dark:text-white">Follow us</h2>
              <ul className="text-gray-600 dark:text-gray-400">
                <li className="mb-2">
                  <a href="#" className="hover:underline focus:underline focus:outline-none">Twitter</a>
                </li>
                <li>
                  <a href="#" className="hover:underline focus:underline focus:outline-none">Facebook</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-bold text-gray-900 uppercase dark:text-white">Legal</h2>
              <ul className="text-gray-600 dark:text-gray-400">
                <li className="mb-2">
                  <a href="#" className="hover:underline focus:underline focus:outline-none">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="hover:underline focus:underline focus:outline-none">Terms &amp; Conditions</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <hr className="my-6 border-gray-300 dark:border-gray-700" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} SciVerse™. All Rights Reserved.
          </span>
          <div className="flex mt-4 space-x-6 sm:justify-center md:mt-0">
            <a href="#" className="text-gray-600 hover:text-blue-600 focus:text-blue-600 dark:text-gray-400 dark:hover:text-white focus:outline-none">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 focus:text-blue-600 dark:text-gray-400 dark:hover:text-white focus:outline-none">
              <span className="sr-only">Facebook</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
