import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Clock, Award, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
    orderType,
    setOrderType,
    pickupSchedule,
    setPickupSchedule,
    tableNumber,
    setTableNumber,
    member,
    pointsDiscount,
    setPointsDiscount,
    pointsToUse,
    setPointsToUse,
    appliedPromo,
    setIsPromoModalOpen,
  } = useApp();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  // Calculate promotional discount
  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'fixed') {
      promoDiscount = appliedPromo.discountValue;
    } else {
      promoDiscount = Math.round((cartTotal * appliedPromo.discountValue) / 100);
    }
  }

  const totalDiscount = promoDiscount + pointsDiscount;
  const netTotal = Math.max(0, cartTotal - totalDiscount);
  const pointsToEarn = Math.floor(netTotal / 10);

  // Quick point discount handlers
  const handleTogglePoints = (pts: number, discountBaht: number) => {
    if (pointsToUse === pts) {
      setPointsToUse(0);
      setPointsDiscount(0);
    } else if (member.points >= pts) {
      setPointsToUse(pts);
      setPointsDiscount(discountBaht);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-[#faf7f2] h-full shadow-2xl flex flex-col border-l border-[#e5dcd3] animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#e5dcd3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#3b2416]" />
              <h3 className="font-bold text-[#2b2118] text-base">
                ตะกร้าสินค้า ({cartCount} รายการ)
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="ปิดตะกร้า"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content or Empty State */}
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#ede6dc] text-[#8c7866] flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-[#2b2118]">ตะกร้าของคุณยังว่างอยู่</h4>
              <p className="text-xs text-[#786b5e] mt-1.5 max-w-xs leading-relaxed">
                เลือกเครื่องดื่มชา กาแฟ หรือโชกุปังปิ้งเตาถ่านแสนอร่อย แล้วกดสั่งเพื่อชิมรสชาติสดใหม่ได้ทันที
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-6 px-5 py-2.5 bg-[#3b2416] text-white text-xs font-semibold rounded-xl hover:bg-[#2b180d] transition-colors"
              >
                เลือกดูเมนู
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Pickup & Schedule Header Selector */}
              <div className="bg-white rounded-xl p-3.5 border border-[#e8dfd5] text-xs space-y-2.5">
                <div className="flex items-center justify-between font-semibold text-[#2b2118]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#b45309]" />
                    รูปแบบการรับสินค้า
                  </span>
                  <div className="flex items-center gap-1 bg-[#ede6dc] p-0.5 rounded-lg">
                    <button
                      onClick={() => setOrderType('takeaway')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        orderType === 'takeaway' ? 'bg-[#3b2416] text-white' : 'text-[#6e5e50]'
                      }`}
                    >
                      รับที่ร้าน
                    </button>
                    <button
                      onClick={() => setOrderType('dine-in')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        orderType === 'dine-in' ? 'bg-[#3b2416] text-white' : 'text-[#6e5e50]'
                      }`}
                    >
                      ทานที่ร้าน
                    </button>
                    <button
                      onClick={() => setOrderType('delivery')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        orderType === 'delivery' ? 'bg-[#3b2416] text-white' : 'text-[#6e5e50]'
                      }`}
                    >
                      เดลิเวอรี่
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#f0e8df]">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">
                      เวลารับสินค้า
                    </span>
                    <select
                      value={pickupSchedule}
                      onChange={(e) => setPickupSchedule(e.target.value)}
                      className="w-full bg-[#faf7f2] border border-[#d8cfc4] rounded-lg p-1.5 text-xs font-semibold text-[#2b2118]"
                    >
                      <option value="ทันที (10-15 นาที)">ทันที (10-15 นาที)</option>
                      <option value="11:30 น.">11:30 น.</option>
                      <option value="12:00 น.">12:00 น.</option>
                      <option value="12:30 น.">12:30 น.</option>
                      <option value="13:00 น.">13:00 น.</option>
                      <option value="14:00 น.">14:00 น.</option>
                    </select>
                  </div>

                  {orderType === 'dine-in' ? (
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">
                        โต๊ะที่นั่ง
                      </span>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="โต๊ะ 01"
                        className="w-full bg-[#faf7f2] border border-[#d8cfc4] rounded-lg p-1.5 text-xs font-semibold text-[#2b2118]"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 flex items-center justify-end pt-3">
                      <span>Wat Maha Phruettharam</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 bg-white rounded-xl border border-[#e8dfd5] flex gap-3 shadow-xs"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#f4efe8] flex-shrink-0 border border-[#e8dfd5]">
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-[#2b2118] truncate leading-tight">
                            {item.menuItem.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-0.5"
                            aria-label="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Customization bullet details */}
                        <div className="text-[11px] text-[#786b5e] mt-1 space-y-0.5 leading-snug">
                          {item.menuItem.allowSweetness && (
                            <div>
                              หวาน: {item.customization.sweetness} · {item.customization.ice}
                            </div>
                          )}
                          {item.customization.milk !== 'นมสดแท้ (Regular)' && (
                            <div>{item.customization.milk}</div>
                          )}
                          {item.customization.toast && (
                            <div>การปิ้ง: {item.customization.toast}</div>
                          )}
                          {item.customization.toppings.length > 0 && (
                            <div className="text-amber-700">
                              + {item.customization.toppings.map((t) => t.name).join(', ')}
                            </div>
                          )}
                          {item.customization.notes && (
                            <div className="italic text-slate-500">
                              &ldquo;{item.customization.notes}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="mt-2 pt-2 border-t border-[#f0e8df] flex items-center justify-between">
                        <div className="flex items-center border border-[#d8cfc4] rounded-lg bg-[#faf7f2] p-0.5">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="p-1 rounded text-slate-600 hover:bg-white transition-all"
                            aria-label="ลดจำนวน"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#2b2118] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="p-1 rounded text-slate-600 hover:bg-white transition-all"
                            aria-label="เพิ่มจำนวน"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#2b2118] tabular-nums">
                          {item.totalPrice} บาท
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loyalty Points Redemption Box */}
              <div className="p-3.5 bg-gradient-to-br from-[#fcf9f5] to-[#f4ede4] rounded-xl border border-[#e5dcd3]">
                <div className="flex items-center justify-between text-xs font-bold text-[#3b2416]">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#d97706]" />
                    <span>ใช้แต้มสะสมสมาชิก</span>
                  </div>
                  <span className="text-xs text-[#786b5e] font-normal">
                    คุณมี <strong className="text-[#b45309] font-bold">{member.points}</strong> แต้ม
                  </span>
                </div>

                <p className="text-[11px] text-[#786b5e] mt-1">
                  แลกรับส่วนลดเงินสดทันทีในบิลนี้:
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    disabled={member.points < 50}
                    onClick={() => handleTogglePoints(50, 25)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                      pointsToUse === 50
                        ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                        : 'bg-white text-[#2b2118] border-[#d8cfc4] hover:border-[#b45309] disabled:opacity-40'
                    }`}
                  >
                    <span>50 แต้ม = ลด 25฿</span>
                  </button>

                  <button
                    disabled={member.points < 100}
                    onClick={() => handleTogglePoints(100, 60)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                      pointsToUse === 100
                        ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                        : 'bg-white text-[#2b2118] border-[#d8cfc4] hover:border-[#b45309] disabled:opacity-40'
                    }`}
                  >
                    <span>100 แต้ม = ลด 60฿</span>
                  </button>
                </div>
              </div>

              {/* Promo code badge / trigger */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#e8dfd5] text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#b45309]" />
                  {appliedPromo ? (
                    <div>
                      <span className="font-bold text-emerald-800">โค้ด: {appliedPromo.code}</span>
                      <span className="text-slate-500 block text-[11px]">
                        ลด {appliedPromo.discountType === 'fixed' ? `${appliedPromo.discountValue}฿` : `${appliedPromo.discountValue}%`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-600 font-medium">มีโค้ดส่วนลดโปรโมชั่นหรือไม่?</span>
                  )}
                </div>
                <button
                  onClick={() => setIsPromoModalOpen(true)}
                  className="text-xs font-semibold text-[#b45309] hover:underline"
                >
                  {appliedPromo ? 'เปลี่ยนโค้ด' : 'เลือกโค้ด'}
                </button>
              </div>
            </div>
          )}

          {/* Drawer Footer & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#e5dcd3] space-y-3">
              <div className="space-y-1.5 text-xs text-[#6e5e50]">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า</span>
                  <span className="font-semibold tabular-nums text-[#2b2118]">{cartTotal} บาท</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>ส่วนลดโปรโมชั่น ({appliedPromo?.code})</span>
                    <span className="tabular-nums">-{promoDiscount} บาท</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-[#b45309] font-medium">
                    <span>ส่วนลดแต้มสะสม ({pointsToUse} แต้ม)</span>
                    <span className="tabular-nums">-{pointsDiscount} บาท</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#f0e8df] flex justify-between items-baseline text-sm font-bold text-[#2b2118]">
                  <span>ยอดชำระสุทธิ</span>
                  <span className="text-lg text-[#3b2416] tabular-nums font-mono">
                    {netTotal} บาท
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#786b5e]">
                  <span>แต้มสะสมที่จะได้รับจากบิลนี้</span>
                  <span className="font-semibold text-[#b45309]">+{pointsToEarn} แต้ม</span>
                </div>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-3.5 px-4 bg-[#3b2416] hover:bg-[#2b180d] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-between shadow-md active:scale-[0.99]"
              >
                <span>เลือกช่องทางชำระเงิน</span>
                <span className="flex items-center gap-1">
                  <span>{netTotal} บาท</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          netTotal={netTotal}
          discount={totalDiscount}
          pointsUsed={pointsToUse}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </>
  );
};
