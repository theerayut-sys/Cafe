import React from 'react';
import { X, CheckCircle, Clock, Coffee, Bell, RotateCcw, Star, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';

export const OrderTrackingModal: React.FC = () => {
  const {
    activeTrackingOrder,
    setActiveTrackingOrder,
    updateOrderStatus,
    reorder,
    setSelectedOrderForReview,
  } = useApp();

  if (!activeTrackingOrder) return null;

  const steps: { status: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      status: 'received',
      label: 'รับคำสั่งซื้อแล้ว',
      desc: 'ร้านได้รับยอดชำระเงินและคิวแล้ว',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      status: 'preparing',
      label: 'กำลังชง & อบขนม',
      desc: 'บาริสต้ากำลังจัดเตรียมเมนูอย่างพิถีพิถัน',
      icon: <Coffee className="w-4 h-4" />,
    },
    {
      status: 'ready',
      label: 'พร้อมรับสินค้า ✨',
      desc: 'เครื่องดื่มและขนมปังพร้อมรับที่บาร์แล้ว',
      icon: <Bell className="w-4 h-4 text-amber-500" />,
    },
    {
      status: 'completed',
      label: 'เสร็จสิ้น',
      desc: 'รับสินค้าเรียบร้อย ขอให้อร่อยนะคะ',
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
    },
  ];

  const statusIndexMap: Record<OrderStatus, number> = {
    received: 0,
    preparing: 1,
    ready: 2,
    completed: 3,
    cancelled: -1,
  };

  const currentStepIndex = statusIndexMap[activeTrackingOrder.status];

  // Helper to simulate advancing to next step for demo
  const handleAdvanceStep = () => {
    if (activeTrackingOrder.status === 'received') {
      updateOrderStatus(activeTrackingOrder.id, 'preparing');
    } else if (activeTrackingOrder.status === 'preparing') {
      updateOrderStatus(activeTrackingOrder.id, 'ready');
    } else if (activeTrackingOrder.status === 'ready') {
      updateOrderStatus(activeTrackingOrder.id, 'completed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e5dcd3] flex flex-col max-h-[92vh]">
        {/* Header with Queue & Close */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#e5dcd3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#3b2416] text-[#faf7f2] flex flex-col items-center justify-center font-bold shadow-sm">
              <span className="text-[10px] uppercase tracking-wider text-[#d8c3b0]">คิวที่</span>
              <span className="text-base font-black tabular-nums">{activeTrackingOrder.queueNumber}</span>
            </div>
            <div>
              <h3 className="font-bold text-[#2b2118] text-base">
                ติดตามสถานะคำสั่งซื้อแบบเรียลไทม์
              </h3>
              <p className="text-xs text-[#786b5e]">
                ออเดอร์ #{activeTrackingOrder.id} · {activeTrackingOrder.createdAt}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTrackingOrder(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="ปิดการติดตาม"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Estimated ready banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#fef3c7] via-[#fef9c3] to-[#ecfdf5] border border-[#fde68a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#b45309]" />
              <div>
                <span className="text-xs font-bold text-[#92400e] block">
                  {activeTrackingOrder.status === 'ready'
                    ? '🎉 ออเดอร์ของคุณพร้อมรับแล้ว!'
                    : activeTrackingOrder.status === 'completed'
                    ? 'รับสินค้าเรียบร้อยแล้ว'
                    : 'เวลารับสินค้าโดยประมาณ'}
                </span>
                <span className="text-[11px] text-[#78350f]">
                  {activeTrackingOrder.pickupTime} ({activeTrackingOrder.estimatedReadyTime})
                </span>
              </div>
            </div>

            {/* Quick Demo Simulator button to test status changes */}
            {activeTrackingOrder.status !== 'completed' && (
              <button
                onClick={handleAdvanceStep}
                className="px-2.5 py-1 text-[11px] font-semibold bg-[#3b2416] text-white rounded-lg hover:bg-[#2b180d] transition-all shadow-xs"
                title="คลิกเพื่อจำลองขั้นตอนถัดไป"
              >
                จำลองขั้นถัดไป ⏩
              </button>
            )}
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-4 relative pl-2">
            {steps.map((step, idx) => {
              const isPast = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.status} className="flex items-start gap-3.5 relative">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-[15px] top-[26px] bottom-[-16px] w-[2px] transition-colors ${
                        currentStepIndex > idx ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  {/* Icon Node */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all z-10 ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#b45309] text-white ring-4 ring-amber-100 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {step.icon}
                  </div>

                  {/* Text Description */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4
                      className={`text-xs font-bold leading-tight ${
                        isCurrent
                          ? 'text-[#b45309]'
                          : isPast
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Itemized summary */}
          <div className="bg-white rounded-xl p-4 border border-[#e8dfd5] space-y-2.5">
            <h4 className="text-xs font-bold text-[#2b2118] uppercase tracking-wider mb-2">
              รายการสินค้าในออเดอร์นี้ ({activeTrackingOrder.items.length} รายการ)
            </h4>
            <div className="divide-y divide-slate-100">
              {activeTrackingOrder.items.map((item) => (
                <div key={item.cartItemId} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#3b2416] tabular-nums">
                      {item.quantity}x
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">{item.menuItem.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.customization.sweetness !== '100%' && `หวาน ${item.customization.sweetness} · `}
                        {item.customization.ice}
                        {item.customization.toppings.length > 0 && ` · +${item.customization.toppings.map(t => t.name).join(', ')}`}
                      </div>
                    </div>
                  </div>
                  <span className="font-medium text-slate-700 tabular-nums">
                    {item.totalPrice} บาท
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#f0e8df] flex justify-between text-xs font-bold text-slate-800">
              <span>ยอดชำระสุทธิ (ชำระแล้ว)</span>
              <span className="text-[#3b2416] tabular-nums">{activeTrackingOrder.netTotal} บาท</span>
            </div>
          </div>
        </div>

        {/* Footer Actions: Reorder & Review */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#e5dcd3] flex flex-col sm:flex-row items-center gap-2">
          {/* Quick Re-order button */}
          <button
            onClick={() => {
              reorder(activeTrackingOrder);
              setActiveTrackingOrder(null);
            }}
            className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl border border-[#d8cfc4] hover:bg-[#f5ede3] text-xs font-semibold text-[#3b2416] transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#b45309]" />
            <span>กดสั่งซ้ำรายการนี้</span>
          </button>

          {/* Review button */}
          <button
            onClick={() => {
              setSelectedOrderForReview(activeTrackingOrder);
              setActiveTrackingOrder(null);
            }}
            className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-[#3b2416] hover:bg-[#2b180d] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{activeTrackingOrder.reviewed ? 'ดูรีวิวของคุณ' : 'รีวิวความพึงพอใจ (+20 แต้ม)'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
