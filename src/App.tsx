import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MenuSection } from './components/MenuSection';
import { CustomizeModal } from './components/CustomizeModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ReviewModal } from './components/ReviewModal';
import { MemberModal } from './components/MemberModal';
import { PromotionModal } from './components/PromotionModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { CustomerReviewsModal } from './components/CustomerReviewsModal';
import { LineNotificationToast } from './components/LineNotificationToast';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { MenuItem } from './types';
import { MapPin, Phone, Clock, Award, Coffee } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, isAdminLoggedIn } = useApp();

  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  const handleScrollToCategory = (categoryId: string) => {
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (currentView === 'admin' && isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f3efe8]">
        <AdminDashboard />
        <LineNotificationToast />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#2b2118]">
      {/* 3-Zone Clean Header */}
      <Navbar
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
        onOpenReviews={() => setIsReviewsModalOpen(true)}
        onScrollToCategory={handleScrollToCategory}
      />

      <main className="flex-1">
        {/* Hero Section with Scheduled Pickup selector */}
        <HeroBanner
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onExploreMenu={() => handleScrollToCategory('signature')}
        />

        {/* Menu Catalog Section */}
        <MenuSection
          onSelectItem={(item) => setSelectedItemForCustomization(item)}
          searchQuery={searchQuery}
        />
      </main>

      {/* Modern, Warm Footer */}
      <footer className="bg-[#24170e] text-[#faf7f2] border-t border-[#3b2718] mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#b45309] text-white flex items-center justify-center text-sm font-black">
                  CC
                </span>
                <span className="font-bold text-lg text-white">Caffeine Cafe</span>
              </div>
              <p className="text-xs text-[#b8a695] leading-relaxed">
                คาเฟ่ชาไทยและมัทฉะเกรดพรีเมียม พร้อมโชกุปังปิ้งเตาถ่านเนยสดแท้ อบสดใหม่ทุกเช้า
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">ข้อมูลสาขา &amp; ที่อยู่</h4>
              <div className="flex items-start gap-2 text-[#b8a695]">
                <MapPin className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
                <span className="leading-relaxed">Wat Maha Phruettharam School 44 Soi Wat Maha Phruettharam, Maha Phruettharam Subdistrict, Bangkok</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">สิทธิประโยชน์สมาชิก</h4>
              <p className="text-[#b8a695] leading-relaxed">
                สะสมแต้มทุก 10 บาท = 1 แต้ม เพียงแจ้งเบอร์โทรศัพท์ แลกรับส่วนลดและเครื่องดื่มฟรี
              </p>
              <div className="pt-1 flex items-center gap-2 text-amber-400 font-semibold">
                <Award className="w-4 h-4" />
                <span>Caffeine Member Rewards Club</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">ช่องทางการชำระเงิน</h4>
              <p className="text-[#b8a695] leading-relaxed">
                รองรับ PromptPay QR Code, Mobile Banking (K PLUS, SCB, KTB), บัตรเครดิต Visa/Mastercard และ TrueMoney Wallet
              </p>
              <div className="text-[11px] text-emerald-400 font-medium pt-1">
                ✓ ชำระเงินปลอดภัย มีระบบแจ้งเตือนผ่าน LINE
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#3b2718] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c7866] gap-2">
            <span>© 2026 Caffeine Cafe. All rights reserved.</span>
            <span>ระบบสั่งซื้อเครื่องดื่มและจัดการสต็อกเรียลไทม์</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <CustomizeModal
        item={selectedItemForCustomization}
        onClose={() => setSelectedItemForCustomization(null)}
      />

      <CartDrawer />
      <OrderTrackingModal />
      <ReviewModal />
      <MemberModal />
      <PromotionModal />

      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />

      <CustomerReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
      />

      {/* Floating LINE Notification Simulator */}
      <LineNotificationToast />

      {/* Admin Login Modal (User: WMP9999, Password: !Tt6130) */}
      <AdminLoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
