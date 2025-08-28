import Link from 'next/link';

export default function About() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12">
      <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">About Page</h1>
        <p className="text-lg">This is the about page to test navigation transitions.</p>
        <div className="mt-6">
          <Link 
            href="/" 
            className="bg-white text-green-500 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors inline-block"
          >
            Go back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}