import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { LandingView } from './views/LandingView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { CreateAppView } from './views/CreateAppView.tsx';
import { AppDetailsView } from './views/AppDetailsView.tsx';
import { BuildsListView } from './views/BuildsListView.tsx';
import { BuildDetailsView } from './views/BuildDetailsView.tsx';
import { PricingView } from './views/PricingView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { DocsView } from './views/DocsView.tsx';

function MainApp() {
  const { user } = useAuth();
  const { setGlobalNavigate } = useToast();
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj_1');
  const [selectedBuildId, setSelectedBuildId] = useState<string>('bld_1');
  const [wizardInitialUrl, setWizardInitialUrl] = useState<string>('');

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleNavigate = (view: string, id?: string) => {
    if (view === 'app-details' && id) {
      setSelectedProjectId(id);
    }
    if (view === 'build-details' && id) {
      setSelectedBuildId(id);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setGlobalNavigate(handleNavigate);
  }, [setGlobalNavigate]);

  const handleStartWizard = (url?: string) => {
    setWizardInitialUrl(url || '');
    setCurrentView('create-app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAppCreated = (projectId: string, buildId?: string) => {
    setSelectedProjectId(projectId);
    if (buildId) {
      setSelectedBuildId(buildId);
      setCurrentView('build-details');
    } else {
      setCurrentView('app-details');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-[#635BFF]/20 selection:text-[#635BFF]">
      {/* Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentView === 'home' && (
          <LandingView onStartWizard={handleStartWizard} onNavigate={handleNavigate} />
        )}

        {currentView === 'how-it-works' && (
          <LandingView onStartWizard={handleStartWizard} onNavigate={handleNavigate} />
        )}

        {currentView === 'features' && (
          <LandingView onStartWizard={handleStartWizard} onNavigate={handleNavigate} />
        )}

        {currentView === 'pricing' && (
          <PricingView onSelectPlan={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'docs' && <DocsView />}

        {currentView === 'dashboard' && (
          <DashboardView onNavigate={handleNavigate} onStartWizard={handleStartWizard} />
        )}

        {currentView === 'apps' && (
          <DashboardView onNavigate={handleNavigate} onStartWizard={handleStartWizard} />
        )}

        {currentView === 'create-app' && (
          <CreateAppView
            initialUrl={wizardInitialUrl}
            onAppCreated={handleAppCreated}
            onCancel={() => setCurrentView(user ? 'dashboard' : 'home')}
          />
        )}

        {currentView === 'app-details' && (
          <AppDetailsView projectId={selectedProjectId} onNavigate={handleNavigate} />
        )}

        {currentView === 'builds' && <BuildsListView onNavigate={handleNavigate} />}

        {currentView === 'build-details' && (
          <BuildDetailsView buildId={selectedBuildId} onNavigate={handleNavigate} />
        )}

        {currentView === 'admin' && <AdminView onNavigate={handleNavigate} />}

        {currentView === 'settings' && (
          <PricingView onSelectPlan={() => setCurrentView('dashboard')} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Notification Toast System */}
      <ToastContainer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setCurrentView('dashboard')}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
