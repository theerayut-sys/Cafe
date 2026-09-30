import React from 'react';
import { ShoppingBag, Award, Store, Coffee, Bell, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onOpenOrderHistory: () => void;
  onOpenReviews: () => void;
  onScrollToCategory: (categoryId: string) => void;
  onOpenDownloadApp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOrderHistory,
  onOpenReviews,
  onScrollToCategory,
  onOpenDownloadApp,
}) => {
  const {
    cartCount,
    setIsCartOpen,
    member,
    setIsMemberModalOpen,
    setIsPromoModalOpen,
    currentView,
    setCurrentView,
    isAdminLoggedIn,
    setIsLoginModalOpen,
    orders,
    setActiveTrackingOrder,
  } = useApp();

  // Check if there is an active (in-progress) order to display tracking quick-access
  const activeOrder = orders.find((o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready');

  return (
    <header className="sticky top-0 z-40 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#e9dfd3] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('customer')}
            className="text-xl font-bold tracking-tight text-[#2b2118] hover:text-[#914d24] transition-colors flex items-center gap-2"
          >
            <span className="w-8 h-8 rounded-lg bg-[#3b2416] text-[#faf7f2] flex items-center justify-center text-sm font-black shadow-sm">
              CC
            </span>
            <span className="font-semibold">Caffeine Cafe</span>
          </button>
        </div>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#655546]">
          <button
            onClick={() => {
              setCurrentView('customer');
              onScrollToCategory('signature');
            }}
            className="hover:text-[#2b2118] transition-colors"
          >
            เครื่องดื่มซิกเนเจอร์
          </button>
          <button
            onClick={() => {
              setCurrentView('customer');
              onScrollToCategory('bread');
            }}
            className="hover:text-[#2b2118] transition-colors"
          >
            ขนมปัง &amp; โชกุปัง
          </button>
          <button
            onClick={() => setIsPromoModalOpen(true)}
            className="hover:text-[#2b2118] transition-colors flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-[#b45309]" />
            โปรโมชั่นเดือนนี้
          </button>
          <button
            onClick={onOpenOrderHistory}
            className="hover:text-[#2b2118] transition-colors"
          >
            ประวัติการสั่งซื้อ
          </button>
          <button
            onClick={onOpenReviews}
            className="hover:text-[#2b2118] transition-colors"
          >
            รีวิวความพึงพอใจ
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active order quick badge if any */}
          {activeOrder && (
            <button
              onClick={() => setActiveTrackingOrder(activeOrder)}
              className="px-3 py-1.5 text-xs font-medium text-[#92400e] bg-[#fef3c7] border border-[#fde68a] rounded-lg hover:bg-[#fde68a] transition-all flex items-center gap-1.5 animate-pulse"
              title="ติดตามสถานะออเดอร์"
            >
              <span className="w-2 h-2 rounded-full bg-[#d97706]" />
              <span className="font-semibold">คิว {activeOrder.queueNumber}</span>
              <span className="hidden sm:inline">กำลังทำ</span>
            </button>
          )}

          {/* Download App Button */}
          <button
            onClick={onOpenDownloadApp}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#b45309] to-[#92400e] hover:from-[#92400e] hover:to-[#78350f] rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="ดาวน์โหลดและติดตั้งแอป Caffeine Cafe"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ดาวน์โหลดแอป</span>
            <span className="sm:hidden">โหลดแอป</span>
          </button>

          {/* Member points card button */}
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-[#3b2416] bg-[#f1ede6] hover:bg-[#e7dfd4] rounded-lg transition-colors flex items-center gap-1.5"
            title="ดูคะแนนสะสมและสิทธิประโยชน์สมาชิก"
          >
            <Award className="w-4 h-4 text-[#d97706]" />
            <span className="font-semibold tabular-nums">{member.points}</span>
            <span className="text-[#7c6955] hidden sm:inline">แต้ม</span>
          </button>

          {/* Cart button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3b2416] hover:bg-[#2b180d] rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            aria-label="ตะกร้าสินค้า"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">ตะกร้า</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#d97706] text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* Switch View: Admin Backoffice vs Storefront */}
          <button
            onClick={() => {
              if (currentView === 'customer') {
                if (isAdminLoggedIn) {
                  setCurrentView('admin');
                } else {
                  setIsLoginModalOpen(true);
                }
              } else {
                setCurrentView('customer');
              }
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border ${
              currentView === 'admin'
                ? 'bg-[#1e293b] text-white border-[#334155]'
                : 'bg-white text-[#524436] border-[#d8cfc4] hover:bg-[#f1ede6]'
            }`}
            title="สลับโหมดหน้าร้าน / ระบบหลังบ้าน"
          >
            {currentView === 'customer' ? (
              <>
                <Store className="w-3.5 h-3.5 text-[#b45309]" />
                <span className="hidden md:inline">ระบบหลังบ้าน</span>
                <span className="md:hidden">POS</span>
              </>
            ) : (
              <>
                <Coffee className="w-3.5 h-3.5 text-[#047857]" />
                <span>กลับหน้าร้าน</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
