import Link from 'next/link';

export default function About() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">About GOTUS</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Revolutionizing the way we track and recover unclaimed assets worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              GOTUS (Global Online Tracking for Unclaimed Stuff) is dedicated to helping 
              individuals and organizations locate and recover their unclaimed assets, 
              lost treasures, and forgotten items across the globe.
            </p>
                          <p className="text-gray-600 dark:text-gray-300">
                We believe that everyone deserves a chance to reclaim what&apos;s rightfully theirs, 
                and our platform makes this process simple, secure, and efficient.
              </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To become the world&apos;s leading platform for unclaimed asset discovery and recovery, 
              connecting people with their lost treasures through innovative technology and 
              comprehensive global databases.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              We envision a world where no valuable asset goes unclaimed due to lack of 
              information or accessibility.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg border border-blue-200 dark:border-blue-700">
          <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-300 mb-6">Why Choose GOTUS?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Global Coverage</h3>
              <p className="text-blue-700 dark:text-blue-200">
                Access to databases from multiple countries and jurisdictions worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Secure & Private</h3>
              <p className="text-blue-700 dark:text-blue-200">
                Your personal information is protected with enterprise-grade security.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Fast Results</h3>
              <p className="text-blue-700 dark:text-blue-200">
                Get instant search results and expedited recovery processes.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/contact" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </main>
  )
}