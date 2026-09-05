import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { TranslationProvider } from './i18n/useTranslation.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ForgotPasswordModal } from './components/ForgotPasswordModal.tsx';
import { SmtpSettingsModal } from './components/SmtpSettingsModal.tsx';
import { PterodactylSettingsModal } from './components/PterodactylSettingsModal.tsx';
import { CreateMinecraftServerWizard } from './components/CreateMinecraftServerWizard.tsx';
import { MinecraftServerDashboard } from './components/MinecraftServerDashboard.tsx';
import { VdsConnectionPage } from './components/admin/VdsConnectionPage.tsx';
import { MinecraftServerInstance } from './types.ts';
import { Loader2 } from 'lucide-react';

function FluxMinecraftAppContent() {
  const { isAuthenticated, isLoading: isAuthLoading, token, user, refreshUser } = useAuth();

  const [servers, setServers] = useState<MinecraftServerInstance[]>([]);
  const [isServersLoading, setIsServersLoading] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'create-wizard' | 'vds-connect'>('dashboard');

  // Global modals
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [showPterodactylModal, setShowPterodactylModal] = useState(false);

  // Check URL pathname for /admin/vds/connect
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin/vds')) {
      setActiveView('vds-connect');
    }
  }, []);

  const fetchServers = async () => {
    if (!token) return;
    setIsServersLoading(true);
    try {
      const res = await fetch('/api/servers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setServers(data || []);
      }
    } catch (e) {
      console.error('Failed to load servers:', e);
    } finally {
      setIsServersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchServers();
    } else {
      setServers([]);
    }
  }, [isAuthenticated, token]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs font-mono text-neutral-400">Loading Flux Hosting...</span>
        </div>
      </div>
    );
  }

  const primaryServer = servers.length > 0 ? servers[0] : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        onOpenSmtpModal={() => setShowSmtpModal(true)}
        onOpenPterodactylModal={() => setShowPterodactylModal(true)}
        onOpenVdsConnect={() => {
          setActiveView(activeView === 'vds-connect' ? 'dashboard' : 'vds-connect');
        }}
        serversCount={servers.length}
        onCreateServerClick={() => setActiveView('create-wizard')}
        hasServer={!!primaryServer}
        activeView={activeView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!isAuthenticated ? (
          <AuthModal onOpenForgotPassword={() => setShowForgotPassword(true)} />
        ) : activeView === 'vds-connect' ? (
          <VdsConnectionPage onBackToDashboard={() => setActiveView('dashboard')} />
        ) : isServersLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-xs font-mono text-neutral-400">Fetching your Minecraft instance...</span>
          </div>
        ) : primaryServer && activeView !== 'create-wizard' ? (
          <MinecraftServerDashboard
            serverId={primaryServer.id}
            onServerDeleted={async () => {
              await fetchServers();
              await refreshUser();
              setActiveView('dashboard');
            }}
          />
        ) : (
          <CreateMinecraftServerWizard
            onServerCreated={async (newServer) => {
              await fetchServers();
              await refreshUser();
              setActiveView('dashboard');
            }}
          />
        )}
      </main>

      {/* Global Modals */}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}

      {showSmtpModal && (
        <SmtpSettingsModal onClose={() => setShowSmtpModal(false)} />
      )}

      {showPterodactylModal && (
        <PterodactylSettingsModal
          onClose={() => setShowPterodactylModal(false)}
          onUpdated={fetchServers}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TranslationProvider>
        <AuthProvider>
          <FluxMinecraftAppContent />
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}
