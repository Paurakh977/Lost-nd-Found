import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12">
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Hello Tailwind!</h1>
        <p className="text-lg">If you can see this styled, Tailwind is working!</p>
        <div className="mt-6">
          <Link 
            href="/about" 
            className="bg-white text-blue-500 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors inline-block"
          >
            Go to About Page
          </Link>
        </div>
      </div>
    </main>
  )
}