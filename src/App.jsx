import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import Landing from '@/pages/Landing';
import OperaOSLanding from '@/pages/OperaOSLanding';
import OperaOSBuilder from '@/pages/OperaOSBuilder';
import CortexOSLanding from '@/pages/CortexOSLanding';
import CortexOSBuilder from '@/pages/CortexOSBuilder';
import AdminPortal from '@/pages/AdminPortal';
import AppLayout from '@/components/layout/AppLayout';
import CommandCenter from '@/pages/CommandCenter';
import IntelligenceFeed from '@/pages/IntelligenceFeed';
import Alerts from '@/pages/Alerts';
import Recommendations from '@/pages/Recommendations';
import Scenarios from '@/pages/Scenarios';
import AIAgents from '@/pages/AIAgents';
import DataSources from '@/pages/DataSources';
import NexusSettings from '@/pages/NexusSettings';
import SupplyChainWorkflow from '@/pages/SupplyChainWorkflow';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground font-medium tracking-wide">NEXUS OS</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/opera" element={<OperaOSLanding />} />
      <Route path="/builder" element={<OperaOSBuilder />} />
      <Route path="/cortex" element={<CortexOSLanding />} />
      <Route path="/cortex-builder" element={<CortexOSBuilder />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RoleGuard><CommandCenter /></RoleGuard>} />
          <Route path="/intelligence" element={<RoleGuard><IntelligenceFeed /></RoleGuard>} />
          <Route path="/alerts" element={<RoleGuard><Alerts /></RoleGuard>} />
          <Route path="/recommendations" element={<RoleGuard><Recommendations /></RoleGuard>} />
          <Route path="/scenarios" element={<RoleGuard><Scenarios /></RoleGuard>} />
          <Route path="/agents" element={<RoleGuard><AIAgents /></RoleGuard>} />
          <Route path="/data-sources" element={<RoleGuard><DataSources /></RoleGuard>} />
          <Route path="/settings" element={<RoleGuard><NexusSettings /></RoleGuard>} />
          <Route path="/admin" element={<RoleGuard><AdminPortal /></RoleGuard>} />
          <Route path="/supply-chain" element={<RoleGuard><SupplyChainWorkflow /></RoleGuard>} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App