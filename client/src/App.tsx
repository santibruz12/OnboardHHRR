import { useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Contracts from "@/pages/contracts";
import { CandidatesPage } from "@/pages/candidates";
import { ProbationPage } from "@/pages/probation";
import EgresosPage from "@/pages/egresos";
import JobOffersPage from "@/pages/job-offers";
import RolesPage from "@/pages/roles";
import ReportsPage from "@/pages/reports";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/employees">
        <ProtectedRoute>
          <Employees />
        </ProtectedRoute>
      </Route>
      
      <Route path="/contracts">
        <ProtectedRoute>
          <Contracts />
        </ProtectedRoute>
      </Route>
      
      <Route path="/candidates">
        <ProtectedRoute>
          <CandidatesPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/probation">
        <ProtectedRoute>
          <ProbationPage />
        </ProtectedRoute>
      </Route>

      <Route path="/egresos">
        <ProtectedRoute>
          <EgresosPage />
        </ProtectedRoute>
      </Route>

      <Route path="/job-offers">
        <ProtectedRoute>
          <JobOffersPage />
        </ProtectedRoute>
      </Route>

      <Route path="/roles">
        <ProtectedRoute>
          <RolesPage />
        </ProtectedRoute>
      </Route>

      <Route path="/reports">
        <ProtectedRoute>
          <ReportsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
