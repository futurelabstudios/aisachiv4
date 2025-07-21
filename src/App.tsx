import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Index from './pages/Index';
import ChatPage from './pages/ChatPage';
import VoiceAgentPage from './pages/VoiceAgentPage';
import DocumentPage from './pages/DocumentPage';
import CircularsPage from './pages/CircularsPage';
import SarpanchAcademyPage from './pages/SarpanchAcademyPage';
import ImportantVideosPage from './pages/ImportantVideosPage';
import GlossaryPage from './pages/GlossaryPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import AuthManager from './contexts/AuthManager';

const App = () => {
  // Create a new QueryClient instance within the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <AuthManager>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/" element={<Navigate to="/chat" replace />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/voice-agent" element={<VoiceAgentPage />} />
                    <Route path="/circulars" element={<CircularsPage />} />
                    <Route path="/document" element={<DocumentPage />} />
                    <Route path="/academy" element={<SarpanchAcademyPage />} />
                    <Route path="/glossary" element={<GlossaryPage />} />
                    <Route path="/videos" element={<ImportantVideosPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>

                  {/* Fallback for index and catch-all */}
                  <Route path="/index" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthManager>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
