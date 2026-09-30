import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldAlert, CheckCircle, ArrowRight, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, adminLogin, setCurrentView } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const success = adminLogin(username, password);
      setIsLoading(false);

      if (success) {
        setIsLoginModalOpen(false);
        setCurrentView('admin');
        setUsername('');
        setPassword('');
      } else {
        setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
      }
    }, 400);
  };

  const handleQuickFill = () => {
    setUsername('WMP9999');
    setPassword('!Tt6130');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-[#e5dcd3] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#24170e] text-white flex items-center justify-between border-b border-[#3b2718]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#b45309] text-white flex items-center justify-center shadow-inner">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">เข้าสู่ระบบจัดการร้านหลังบ้าน</h3>
              <p className="text-[11px] text-[#b8a695]">Caffeine OS · Merchant Backoffice POS</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start justify-between gap-2">
            <div>
              <span className="font-bold block">ข้อมูลสิทธิ์ผู้ดูแลระบบ:</span>
              <span className="font-mono">User: <strong>WMP9999</strong> | Password: <strong>!Tt6130</strong></span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-semibold text-[#b45309] underline hover:text-[#92400e] whitespace-nowrap pt-0.5"
            >
              กรอกอัตโนมัติ
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2b2118] uppercase tracking-wider mb-1.5">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ระบุ User เช่น WMP9999"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#d8cfc4] rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3b2416]"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2b2118] uppercase tracking-wider mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ระบุรหัสผ่าน เช่น !Tt6130"
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#d8cfc4] rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3b2416]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#3b2416] hover:bg-[#2b180d] disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {isLoading ? (
                <span>กำลังตรวจสอบข้อมูล...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบหลังบ้าน</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
