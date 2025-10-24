import { useState } from 'react';
import Students from './Students';
import Marks from './Marks';
import Reports from './Reports';

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

type Page = 'dashboard' | 'students' | 'marks' | 'reports';

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [page, setPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'students':
        return <Students token={token} />;
      case 'marks':
        return <Marks token={token} />;
      case 'reports':
        return <Reports token={token} />;
      default:
        return (
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to SRMS</h2>
              <p className="text-gray-600 mb-4">Logged in with token: {token.slice(0, 50)}...</p>
              <p className="text-gray-600">Grading System: Ugandan (D1: 90-100, D2: 85-89, etc.)</p>
              <p className="text-gray-600 mt-4">Use navigation to manage students, marks, and reports.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">SRMS Dashboard</h1>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          <nav className="flex space-x-8">
            <button
              onClick={() => setPage('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                page === 'dashboard' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setPage('students')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                page === 'students' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setPage('marks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                page === 'marks' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Marks
            </button>
            <button
              onClick={() => setPage('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                page === 'reports' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Reports
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
}
