import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthWrapper } from "./components/AuthWrapper";
import NavigationBar from "./components/NavigationBar";
import Index from "./pages/Index";
import DreamHistory from "./pages/DreamHistory";
import DreamDetail from "./pages/DreamDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthWrapper>
          <div className="min-h-screen bg-gradient-to-b from-dream-blue via-dream-purple to-dream-lavender">
            <NavigationBar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/history" element={<DreamHistory />} />
              <Route path="/dream/:id" element={<DreamDetail />} />
            </Routes>
          </div>
        </AuthWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;