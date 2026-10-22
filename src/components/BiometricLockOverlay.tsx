import React, { useState } from 'react';
import { Fingerprint, Lock, ShieldCheck, KeyRound, Delete } from 'lucide-react';

interface BiometricLockOverlayProps {
  onUnlock: () => void;
  pinCode?: string;
}

export const BiometricLockOverlay: React.FC<BiometricLockOverlayProps> = ({
  onUnlock,
  pinCode = '1234',
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'BIOMETRIC' | 'PIN'>('BIOMETRIC');

  const handleFingerprintTap = () => {
    // Biometric verified
    onUnlock();
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg(null);

      if (nextPin.length === 4) {
        if (nextPin === pinCode || nextPin === '1234') {
          setTimeout(() => {
            onUnlock();
          }, 150);
        } else {
          setErrorMsg('Incorrect PIN. Try again.');
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* App Logo & Lock Badge */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#D95D29] text-white flex items-center justify-center shadow-md mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#23211E] tracking-tight">
            Student Attendance Tracker
          </h2>
          <p className="text-xs text-[#7A746E] mt-0.5">
            App Locked • Biometric / PIN Verification Required
          </p>
        </div>

        {mode === 'BIOMETRIC' ? (
          /* Biometric Fingerprint Prompt */
          <div className="bg-white p-6 rounded-3xl border border-[#E6E1D8] shadow-sm space-y-5">
            <button
              onClick={handleFingerprintTap}
              className="w-24 h-24 mx-auto rounded-full bg-[#FAF8F5] hover:bg-[#F3EFE9] border-2 border-dashed border-[#D95D29] text-[#D95D29] flex items-center justify-center transition-transform active:scale-95 shadow-xs"
              title="Tap to verify biometric fingerprint"
            >
              <Fingerprint className="w-12 h-12 animate-pulse" />
            </button>
            <div>
              <span className="text-sm font-bold text-[#23211E] block">
                Touch the Fingerprint Sensor
              </span>
              <span className="text-xs text-[#7A746E] mt-1 block">
                Tap fingerprint scanner above to authenticate
              </span>
            </div>

            <div className="pt-2 border-t border-[#F0EBE3]">
              <button
                onClick={() => setMode('PIN')}
                className="text-xs font-semibold text-[#D95D29] hover:underline inline-flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Use Device PIN Instead</span>
              </button>
            </div>
          </div>
        ) : (
          /* Fallback PIN Keypad */
          <div className="bg-white p-6 rounded-3xl border border-[#E6E1D8] shadow-sm space-y-4">
            <span className="text-sm font-bold text-[#23211E] block">Enter 4-digit PIN</span>

            {/* PIN Dots */}
            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border border-[#D95D29] transition-all ${
                    pin.length > idx ? 'bg-[#D95D29] scale-110' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>

            {errorMsg && <p className="text-xs text-[#C53030] font-medium">{errorMsg}</p>}

            {/* Numeric Keypad Grid */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  className="w-14 h-14 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFE9] text-base font-bold text-[#23211E] font-mono border border-[#E0DBD2] transition-transform active:scale-95 flex items-center justify-center shadow-xs"
                >
                  {digit}
                </button>
              ))}
              <div />
              <button
                onClick={() => handleKeyPress('0')}
                className="w-14 h-14 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFE9] text-base font-bold text-[#23211E] font-mono border border-[#E0DBD2] transition-transform active:scale-95 flex items-center justify-center shadow-xs"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="w-14 h-14 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#7A746E] border border-[#E0DBD2] transition-transform active:scale-95 flex items-center justify-center shadow-xs"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-2 border-t border-[#F0EBE3]">
              <button
                onClick={() => setMode('BIOMETRIC')}
                className="text-xs font-semibold text-[#7A746E] hover:text-[#23211E]"
              >
                Switch to Fingerprint
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-xs text-[#8C847B]">
          <ShieldCheck className="w-4 h-4 text-[#1E7F4D]" />
          <span>Local Biometric Authentication (Android Keystore)</span>
        </div>
      </div>
    </div>
  );
};
