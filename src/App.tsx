
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react"; 
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import VoiceAgentPage from "./pages/VoiceAgentPage";
import DocumentPage from "./pages/DocumentPage";
import CircularsPage from "./pages/CircularsPage";
import SarpanchAcademyPage from "./pages/SarpanchAcademyPage";
import ImportantVideosPage from "./pages/ImportantVideosPage";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./contexts/LanguageContext";

const App = () => {
  // Create a new QueryClient instance within the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/voice-agent" element={<VoiceAgentPage />} />
              <Route path="/circulars" element={<CircularsPage />} />
              <Route path="/document" element={<DocumentPage />} />
              <Route path="/academy" element={<SarpanchAcademyPage />} />
              <Route path="/videos" element={<ImportantVideosPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
