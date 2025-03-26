import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import Home from "@/pages/Home";
import FitnessPage from "@/pages/FitnessPage";
import SchedulePage from "@/pages/SchedulePage";
import ProgressPage from "@/pages/ProgressPage";
import FamilyPage from "@/pages/FamilyPage";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/fitness" component={FitnessPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/progress" component={ProgressPage} />
      <Route path="/family" component={FamilyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-lg mx-auto min-h-screen flex flex-col bg-white shadow-lg">
        <Router>
          <AppRouter />
        </Router>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
