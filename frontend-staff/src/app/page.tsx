import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          마트의원 직원용 페이지
        </h1>

        <div className="space-y-4">
          <Link
            href="/mtswait"
            className="block w-full text-center py-4 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            대기자 명단 (MTSWAIT)
          </Link>

          <Link
            href="/mtsmtr"
            className="block w-full text-center py-4 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            진료기록 (MTSMTR)
          </Link>
        </div>
      </div>
    </div>
  );
}
