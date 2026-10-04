import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Browse from "./pages/Browse.tsx";
import DramaDetail from "./pages/DramaDetail.tsx";
import Watchlist from "./pages/Watchlist.tsx";
import Recommendations from "./pages/Recommendations.tsx";
import Community from "./pages/Community.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
import NetflixGuide from "./pages/NetflixGuide.tsx";
import Person from "./pages/Person.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/drama/:id" element={<DramaDetail />} />
            <Route path="/person/:id" element={<Person />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/best-korean-dramas-on-netflix" element={<NetflixGuide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
