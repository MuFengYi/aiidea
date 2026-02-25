import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ConfigProvider } from 'antd';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout/Layout';
import LoginPage from './pages/Auth/LoginPage';
import IdeasPage from './pages/Ideas/IdeasPage';
import IdeaEditorPage from './pages/Ideas/IdeaEditorPage';
import SettingsPage from './pages/Settings/SettingsPage';

import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 2 * 60 * 1000,
    },
  },
});

const antdTheme = {
  token: {
    colorPrimary: '#007AFF',
    colorSuccess: '#34C759',
    colorWarning: '#FF9500',
    colorError: '#FF3B30',
    borderRadius: 10,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
};

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <Router>
          <div className="App">
            <Routes>
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
              />

              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<IdeasPage />} />
                        <Route path="/idea/new" element={<IdeaEditorPage />} />
                        <Route path="/idea/:id" element={<IdeaEditorPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            
            {/* Global toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#34C759',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#FF3B30',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
