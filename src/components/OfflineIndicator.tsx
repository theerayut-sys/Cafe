import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#3b2416] text-[#faf7f2] border border-[#b45309] px-3.5 py-2 text-xs font-medium shadow-xl animate-bounce">
      <WifiOff className="w-4 h-4 text-amber-400" />
      <span>โหมดออฟไลน์ — ข้อมูลเมนูจะถูกโหลดจากแคชในเครื่องของคุณ</span>
    </div>
  );
};
