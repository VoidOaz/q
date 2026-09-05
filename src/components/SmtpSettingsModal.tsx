import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Send, CheckCircle2, AlertCircle, Terminal, RefreshCw, Clock, Shield } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { SmtpConfig, EmailLog } from '../types.ts';

interface SmtpSettingsModalProps {
  onClose: () => void;
}

export const SmtpSettingsModal: React.FC<SmtpSettingsModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');

  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [secure, setSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [fromName, setFromName] = useState('Flux Hosting');
  const [fromEmail, setFromEmail] = useState('noreply@fluxhosting.io');
  const [testRecipient, setTestRecipient] = useState(user?.email || '');

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; transcript?: string[] } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Fetch current SMTP config
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/settings/smtp', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: SmtpConfig = await res.json();
        setHost(data.host || '');
        setPort(String(data.port || 587));
        setSecure(data.secure || false);
        setSmtpUser(data.user || '');
        setFromName(data.fromName || 'Flux Hosting');
        setFromEmail(data.fromEmail || 'noreply@fluxhosting.io');
      }
    } catch (e) {
      console.error('Failed to load SMTP settings:', e);
    }
  };

  // Fetch email logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/settings/email-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(data);
      }
    } catch (e) {
      console.error('Failed to load email logs:', e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          host: host.trim(),
          port: Number(port) || 587,
          secure,
          user: smtpUser.trim(),
          pass: smtpPass.trim() || undefined,
          fromName: fromName.trim(),
          fromEmail: fromEmail.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(data.message || t.success);
      } else {
        setError(data.error || 'Failed to save SMTP settings.');
      }
    } catch {
      setError('Connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const res = await fetch('/api/settings/smtp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          host: host.trim(),
          port: Number(port) || 587,
          secure,
          user: smtpUser.trim(),
          pass: smtpPass.trim() || undefined,
          fromEmail: fromEmail.trim(),
          testRecipient: testRecipient.trim() || user?.email,
        }),
      });

      const data = await res.json();
      setTestResult(data);
      fetchLogs();
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'SMTP diagnostic request timed out.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-700 flex items-center justify-center text-white">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.smtpModalTitle}</h2>
            <p className="text-xs text-neutral-400">{t.smtpModalDesc}</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 border-b border-neutral-800 mt-4 mb-4">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config' ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.smtpConfigTab}
          </button>
          <button
            onClick={() => {
              setActiveTab('logs');
              fetchLogs();
            }}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>{t.emailHistoryTab}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300 font-mono">
              {emailLogs.length}
            </span>
          </button>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'config' ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1">{t.smtpHost} *</label>
                <input
                  type="text"
                  required
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="smtp.mailgun.org or smtp.gmail.com"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">{t.smtpPort} *</label>
                <input
                  type="number"
                  required
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">{t.smtpUsername} *</label>
                <input
                  type="text"
                  required
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="postmaster@yourdomain.com"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">{t.smtpPassword}</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="Leave empty to keep current password"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">{t.smtpFromName}</label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Flux Hosting Control Panel"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">{t.smtpFromEmail} *</label>
                <input
                  type="email"
                  required
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="noreply@fluxhosting.io"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg">
              <input
                id="smtp-secure-checkbox"
                type="checkbox"
                checked={secure}
                onChange={(e) => setSecure(e.target.checked)}
                className="rounded border-neutral-700 text-white focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="smtp-secure-checkbox" className="text-xs text-neutral-300 font-medium cursor-pointer">
                {t.smtpSecureTls} (Port 465 SSL)
              </label>
            </div>

            {/* Test Connection Box */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">{t.btnTestSmtp}</span>
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleTestConnection}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? t.smtpTesting : t.btnTestSmtp}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="test.recipient@example.com"
                  className="flex-1 bg-neutral-900 border border-neutral-700 focus:border-white rounded px-2.5 py-1 text-xs text-white font-mono outline-none"
                />
              </div>

              {testResult && (
                <div className={`p-2.5 rounded border text-xs ${testResult.success ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' : 'bg-red-950/30 border-red-800 text-red-300'}`}>
                  <div className="font-semibold mb-1 flex items-center gap-1.5">
                    {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.transcript && (
                    <div className="mt-2 p-2 bg-neutral-950 rounded font-mono text-[11px] text-neutral-400 space-y-0.5 max-h-24 overflow-y-auto">
                      {testResult.transcript.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg text-xs transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-white hover:bg-neutral-200 text-black font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? t.loading : t.btnSaveSmtp}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 pb-2">
              <span>{t.emailHistoryTab} (Last 50 Transmissions)</span>
              <button
                onClick={fetchLogs}
                disabled={logsLoading}
                className="flex items-center gap-1 text-neutral-300 hover:text-white cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${logsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {emailLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-950 rounded-lg border border-neutral-800">
                {t.noEmailLogs}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {emailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white font-bold">{log.to}</span>
                      <span className="text-neutral-500">{new Date(log.sentAt).toLocaleString()}</span>
                    </div>
                    <div className="text-neutral-300 font-sans font-medium text-xs">
                      {log.subject}
                    </div>
                    {log.previewBody && (
                      <p className="text-[11px] text-neutral-400 font-sans line-clamp-2 bg-neutral-900/60 p-2 rounded border border-neutral-800/80">
                        {log.previewBody}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 uppercase font-bold">
                        {log.status}
                      </span>
                      <span className="text-neutral-500 uppercase">{log.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
