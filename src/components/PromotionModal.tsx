import React from 'react';
import { X, Tag, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PromotionAnnouncement } from '../types';

export const PromotionModal: React.FC = () => {
  const {
    isPromoModalOpen,
    setIsPromoModalOpen,
    promotions,
    appliedPromo,
    applyPromo,
    setIsCartOpen,
  } = useApp();

  if (!isPromoModalOpen) return null;

  const handleApplyPromo = (promo: PromotionAnnouncement) => {
    applyPromo(promo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e5dcd3] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5dcd3] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#2b2118] text-base">โปรโมชั่นและสิทธิพิเศษประจำเดือน</h3>
              <p className="text-xs text-[#786b5e]">อัปเดตสิทธิประโยชน์และโค้ดส่วนลดล่าสุด</p>
            </div>
          </div>
          <button
            onClick={() => setIsPromoModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          {promotions.map((promo) => {
            const isApplied = appliedPromo?.id === promo.id;
            return (
              <div
                key={promo.id}
                className={`p-4 rounded-xl border transition-all relative ${
                  isApplied
                    ? 'border-[#059669] bg-[#ecfdf5] shadow-sm'
                    : 'border-[#e8dfd5] bg-white hover:border-[#c8b9a9]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="text-[#b45309] uppercase tracking-wider">{promo.tagline}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-emerald-700 font-medium">{promo.badge}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#2b2118] mt-1">{promo.title}</h4>
                    <p className="text-xs text-[#6e5e50] mt-1.5 leading-relaxed">{promo.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg font-bold text-[#b45309] tabular-nums">
                      {promo.discountType === 'fixed' ? `-${promo.discountValue}฿` : `-${promo.discountValue}%`}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#f0e8df] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Tag className="w-3.5 h-3.5 text-[#b45309]" />
                    <span className="font-mono font-semibold text-[#3b2416] bg-[#f5ede3] px-2 py-0.5 rounded">
                      {promo.code}
                    </span>
                    <span className="text-slate-400">· ใช้ได้ถึง {promo.validUntil}</span>
                  </div>

                  <button
                    onClick={() => handleApplyPromo(promo)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                      isApplied
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-[#3b2416] hover:bg-[#2b180d] text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>กำลังใช้งาน</span>
                      </>
                    ) : (
                      <>
                        <span>เก็บโค้ดนี้</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#e5dcd3] flex items-center justify-between">
          <p className="text-xs text-[#786b5e]">
            {appliedPromo ? `ใช้โค้ด ${appliedPromo.code} แล้ว พร้อมรับส่วนลดในตะกร้า` : 'เลือกเก็บโค้ดเพื่อรับส่วนลดตอนเช็คเอาท์'}
          </p>
          <button
            onClick={() => {
              setIsPromoModalOpen(false);
              setIsCartOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#3b2416] hover:bg-[#2b180d] rounded-lg transition-colors"
          >
            เปิดตะกร้าสินค้า
          </button>
        </div>
      </div>
    </div>
  );
};
