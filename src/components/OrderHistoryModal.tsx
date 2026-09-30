import React from 'react';
import { X, RotateCcw, Clock, Star, ExternalLink, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const {
    orders,
    reorder,
    setActiveTrackingOrder,
    setSelectedOrderForReview,
  } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#e5dcd3] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#e5dcd3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f4efe8] text-[#3b2416] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#2b2118] text-base">ประวัติการสั่งซื้อของคุณ</h3>
              <p className="text-xs text-[#786b5e]">กดสั่งซ้ำได้ทันทีไม่ต้องเลือกท็อปปิ้งใหม่</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-slate-700">ยังไม่มีประวัติการสั่งซื้อ</p>
              <p className="text-xs text-slate-400 mt-1">เริ่มสั่งเมนูแรกเพื่อสะสมแต้มและบันทึกประวัติ</p>
            </div>
          ) : (
            orders.map((order: Order) => (
              <div
                key={order.id}
                className="p-4 bg-white rounded-xl border border-[#e8dfd5] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[#3b2416] bg-[#f4efe8] px-2 py-0.5 rounded">
                        คิว {order.queueNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 font-mono">#{order.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{order.createdAt}</span>
                    </div>

                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#b45309]" />
                      <span>{order.pickupTime}</span>
                      <span className="text-slate-300">·</span>
                      <span className="capitalize">
                        {order.orderType === 'takeaway'
                          ? 'รับที่ร้าน'
                          : order.orderType === 'dine-in'
                          ? `ทานที่ร้าน (${order.tableNumber})`
                          : 'เดลิเวอรี่'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      order.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.status === 'ready'
                        ? 'bg-amber-50 text-amber-700 animate-pulse'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {order.status === 'completed'
                      ? 'สำเร็จ'
                      : order.status === 'ready'
                      ? 'พร้อมรับสินค้า'
                      : 'กำลังเตรียม'}
                  </span>
                </div>

                {/* Items */}
                <div className="text-xs space-y-1.5 border-t border-b border-[#f0e8df] py-2.5">
                  {order.items.map((item) => (
                    <div key={item.cartItemId} className="flex justify-between">
                      <div className="flex-1 pr-2 truncate">
                        <span className="font-bold text-[#2b2118] mr-1.5">{item.quantity}x</span>
                        <span className="font-medium text-slate-800">{item.menuItem.name}</span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          ({item.customization.sweetness}
                          {item.customization.toppings.length > 0 && `, +${item.customization.toppings.length} ท็อปปิ้ง`})
                        </span>
                      </div>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {item.totalPrice}฿
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summary & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-slate-500">ยอดรวม: </span>
                    <strong className="text-base font-bold text-[#3b2416] tabular-nums font-mono">
                      {order.netTotal} บาท
                    </strong>
                    <span className="text-[11px] text-[#b45309] ml-1.5 font-medium">
                      (+{order.pointsEarned} แต้ม)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View live tracking if not completed */}
                    <button
                      onClick={() => {
                        setActiveTrackingOrder(order);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>สถานะ</span>
                    </button>

                    {/* Review button if completed */}
                    {order.status === 'completed' && !order.reviewed && (
                      <button
                        onClick={() => {
                          setSelectedOrderForReview(order);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>รีวิว</span>
                      </button>
                    )}

                    {/* Re-order 1-click button */}
                    <button
                      onClick={() => {
                        reorder(order);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#3b2416] hover:bg-[#2b180d] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span>สั่งซ้ำ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
