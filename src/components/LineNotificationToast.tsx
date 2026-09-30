import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LineNotificationToast: React.FC = () => {
  const { linePushToast, dismissLineToast, orders, setActiveTrackingOrder } = useApp();

  if (!linePushToast) return null;

  const targetOrder = orders.find((o) => o.id === linePushToast.orderId);

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div className="bg-[#06c755] text-white rounded-xl shadow-xl overflow-hidden border border-[#05b34c]">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#05b34c]/90 text-xs">
          <div className="flex items-center gap-1.5 font-bold tracking-wide">
            <span className="w-5 h-5 rounded-full bg-white text-[#06c755] flex items-center justify-center font-black text-[10px]">
              L
            </span>
            <span>LINE NOTIFICATION</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] opacity-80">{linePushToast.timestamp}</span>
            <button
              onClick={dismissLineToast}
              className="p-1 hover:bg-white/20 rounded transition-colors text-white"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 bg-white text-[#1f2937]">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#faf7f2] border border-[#e5e7eb] flex-shrink-0 flex items-center justify-center font-bold text-xs text-[#3b2416]">
              CH
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#111827] truncate">
                {linePushToast.title}
              </h4>
              <p className="text-xs text-[#4b5563] mt-1 leading-relaxed line-clamp-2">
                {linePushToast.body}
              </p>
            </div>
          </div>

          {targetOrder && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">
                สถานะ: {targetOrder.status === 'ready' ? 'พร้อมรับสินค้า ✨' : targetOrder.status === 'preparing' ? 'กำลังทำ 🍵' : 'รับออเดอร์แล้ว'}
              </span>
              <button
                onClick={() => {
                  setActiveTrackingOrder(targetOrder);
                  dismissLineToast();
                }}
                className="text-xs font-semibold text-[#06c755] hover:text-[#05b34c] flex items-center gap-1 transition-colors"
              >
                ดูสถานะออเดอร์
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
