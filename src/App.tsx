import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ChoiceMethod from "./pages/ChoiceMethod";
import RiskAssessment from "./pages/RiskAssessment";
import TextAssessment from "./pages/TextAssessment";
import VoiceCall from "./pages/VoiceCall";
import DoctorDashboard from "./pages/DoctorDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/choice-method" element={<ChoiceMethod />} />
          <Route path="/risk-assessment" element={<RiskAssessment />} />
          <Route path="/text-assessment" element={<TextAssessment />} />
          <Route path="/voice-call" element={<VoiceCall />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
