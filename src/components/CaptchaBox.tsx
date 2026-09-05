import React, { useState, useEffect } from 'react';
import { RotateCw, ShieldCheck, HelpCircle } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation.tsx';

interface CaptchaBoxProps {
  onCaptchaChange: (id: string, solution: string) => void;
  error?: string;
}

export const CaptchaBox: React.FC<CaptchaBoxProps> = ({ onCaptchaChange, error }) => {
  const { t } = useTranslation();
  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaSvg, setCaptchaSvg] = useState<string>('');
  const [captchaHint, setCaptchaHint] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCaptcha = async () => {
    setIsLoading(true);
    setUserInput('');
    try {
      const res = await fetch('/api/auth/captcha');
      if (res.ok) {
        const data = await res.json();
        setCaptchaId(data.id);
        setCaptchaSvg(data.svg);
        setCaptchaHint(data.hint);
        onCaptchaChange(data.id, '');
      }
    } catch (e) {
      console.error('Failed to load CAPTCHA:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleInputChange = (val: string) => {
    setUserInput(val);
    onCaptchaChange(captchaId, val);
  };

  return (
    <div id="captcha-container" className="space-y-2 p-3 bg-neutral-900/80 border border-neutral-800 rounded-lg">
      <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
        <span className="flex items-center gap-1.5 text-neutral-200">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          {t.captchaLabel}
        </span>
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={isLoading}
          className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer text-[11px] disabled:opacity-50"
          title={t.captchaRefresh}
        >
          <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          {t.captchaRefresh}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative overflow-hidden rounded border border-neutral-700 bg-neutral-950 flex-shrink-0 min-w-[170px] h-[52px] flex items-center justify-center select-none shadow-inner">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <img
              src={captchaSvg}
              alt="Security CAPTCHA challenge"
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <div className="flex-1">
          <input
            id="captcha-input-field"
            type="text"
            required
            autoComplete="off"
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={t.captchaPlaceholder}
            className="w-full bg-neutral-950 border border-neutral-700 focus:border-white focus:ring-1 focus:ring-white rounded px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 font-mono transition-colors outline-none"
          />
        </div>
      </div>

      {captchaHint && (
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <HelpCircle className="w-3 h-3" />
          <span>{captchaHint}</span>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
};
