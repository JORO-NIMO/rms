import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const queryClient = new QueryClient();

function App() {
  const [token, setToken] = useState<string | null>(null);

  if (!token) {
    return (
      <QueryClientProvider client={queryClient}>
        <Login onLogin={setToken} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard token={token} onLogout={() => setToken(null)} />
    </QueryClientProvider>
  );
}

export default App;
