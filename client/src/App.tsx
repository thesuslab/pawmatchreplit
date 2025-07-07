import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import Profile from "@/pages/profile";
import Health from "@/pages/health";
import Auth from "@/pages/auth";

function Router() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <Home user={user} />} />
      <Route path="/discover" component={() => <Discover user={user} />} />
      <Route path="/profile" component={() => <Profile user={user} />} />
      <Route path="/health" component={() => <Health user={user} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
