import React from 'react';
import {
  Box,
  Sun,
  Moon,
  Globe,
  Mail,
  LogOut,
  Plus,
  ShieldCheck,
  User,
  Cpu,
  Server,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/useTranslation.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

interface NavbarProps {
  onOpenConnectModal?: () => void;
  onOpenSmtpModal?: () => void;
  onOpenPterodactylModal?: () => void;
  onOpenVdsConnect?: () => void;
  serversCount?: number;
  onCreateServerClick?: () => void;
  hasServer?: boolean;
  activeView?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSmtpModal,
  onOpenPterodactylModal,
  onOpenVdsConnect,
  onCreateServerClick,
  hasServer,
  activeView,
}) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const isOperator = Boolean(
    user && (user.username.toUpperCase() === 'PCBC' || user.isOperator || user.role === 'superadmin' || user.role === 'operator' || user.permissions?.includes('vds_binding'))
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-black tracking-tighter shadow-md shadow-emerald-500/20">
            <Box className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                FLUX<span className="text-emerald-400 font-light">HOSTING</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Minecraft VDS
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-neutral-400 -mt-0.5 leading-none">
              High Performance Minecraft Server Hosting • Intel Xeon E5-2690 v4
            </p>
          </div>
        </div>

        {/* Center Node Status (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-neutral-400">Node #1:</span>
          <span className="text-neutral-200">Xeon E5-2690 v4</span>
          <span className="text-neutral-600">•</span>
          <span className="text-emerald-400 font-semibold">1 Gbit Uplink</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Operator VDS Binding Direct Access Button */}
          {user && isOperator && onOpenVdsConnect && (
            <button
              onClick={onOpenVdsConnect}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                activeView === 'vds-connect'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/60'
              }`}
              title="VDS Binding & Connection Management"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>VDS Binding</span>
            </button>
          )}

          {/* Create Server Button (if user has 0 servers) */}
          {user && !hasServer && onCreateServerClick && (
            <button
              onClick={onCreateServerClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Server</span>
            </button>
          )}

          {/* Pterodactyl Panel Settings Button */}
          {onOpenPterodactylModal && (
            <button
              onClick={onOpenPterodactylModal}
              title="Pterodactyl API Integration"
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline text-xs font-mono font-medium text-neutral-300">Pterodactyl</span>
            </button>
          )}

          {/* SMTP Settings Button */}
          {onOpenSmtpModal && (
            <button
              onClick={onOpenSmtpModal}
              title="SMTP Email Configuration"
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" />
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
            title="Switch Language"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono font-bold text-neutral-300 cursor-pointer transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                  <span>{user.username}</span>
                  {user.role === 'owner' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Host Owner" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-neutral-400" title="Member" />
                  )}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  {user.hasServer ? '1/1 Server' : '0/1 Server'}
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-950/40 hover:border-rose-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
