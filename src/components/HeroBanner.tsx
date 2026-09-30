import React from 'react';
import { Clock, MapPin, Search, Sparkles, UtensilsCrossed, ShoppingBag, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HERO_IMAGE } from '../data/initialData';
import { OrderType } from '../types';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onExploreMenu: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  onExploreMenu,
}) => {
  const {
    orderType,
    setOrderType,
    pickupSchedule,
    setPickupSchedule,
    tableNumber,
    setTableNumber,
    setIsPromoModalOpen,
  } = useApp();

  const timeOptions = [
    'ทันที (10-15 นาที)',
    '11:30 น.',
    '12:00 น.',
    '12:30 น.',
    '13:00 น.',
    '13:30 น.',
    '14:00 น.',
    '15:00 น.',
  ];

  return (
    <section className="relative overflow-hidden bg-[#24170e] text-[#faf7f2]">
      {/* Background ambient image with measured contrast scrim */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src={HERO_IMAGE}
          alt="Artisanal Cafe Drinks and Shokupan Bakery"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1109] via-[#24170edb] to-[#1c1109]/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Promotional announcement pill-free kicker */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#d8c3b0] mb-3">
          <span className="text-[#f59e0b] font-semibold">โปรโมชั่นประจำเดือน</span>
          <span aria-hidden="true">·</span>
          <span>จับคู่เครื่องดื่มและโชกุปังรับส่วนลดทันที 20 บาท</span>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setIsPromoModalOpen(true)}
            className="text-white underline underline-offset-4 hover:text-[#f59e0b] transition-colors font-medium flex items-center gap-1"
          >
            <span>ดูโค้ดทั้งหมด</span>
            <Sparkles className="w-3 h-3 text-[#f59e0b]" />
          </button>
        </div>

        {/* Hero headline & copy */}
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            รสชาติชาไทยและมัทฉะแท้ <br />
            คู่โชกุปังปิ้งเตาถ่านหอมกรุ่น
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#d8c3b0] leading-relaxed">
            สั่งเครื่องดื่มและเบเกอรี่ออนไลน์ ปรับแต่งความหวานและท็อปปิ้งได้ดั่งใจ
            สั่งล่วงหน้าไม่ต้องรอคิว สะสมแต้มรับส่วนลดพิเศษทุกแก้ว
          </p>
        </div>

        {/* Order Selector Card (Takeaway / Dine-in / Scheduled time) */}
        <div className="mt-8 bg-[#faf7f2] text-[#2b2118] rounded-2xl p-4 sm:p-5 shadow-xl max-w-3xl border border-[#e5dcd3]">
          {/* Order Mode Segmented Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9dfd3] pb-4">
            <div className="flex items-center gap-1 p-1 bg-[#ede6dc] rounded-xl text-xs font-semibold">
              <button
                onClick={() => setOrderType('takeaway')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  orderType === 'takeaway'
                    ? 'bg-[#3b2416] text-white shadow-sm'
                    : 'text-[#6e5e50] hover:text-[#2b2118]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>รับที่ร้าน (Takeaway)</span>
              </button>
              <button
                onClick={() => setOrderType('dine-in')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  orderType === 'dine-in'
                    ? 'bg-[#3b2416] text-white shadow-sm'
                    : 'text-[#6e5e50] hover:text-[#2b2118]'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>ทานที่ร้าน (Dine-in)</span>
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  orderType === 'delivery'
                    ? 'bg-[#3b2416] text-white shadow-sm'
                    : 'text-[#6e5e50] hover:text-[#2b2118]'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>เดลิเวอรี่</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#786b5e]">
              <MapPin className="w-3.5 h-3.5 text-[#b45309]" />
              <span className="font-medium text-[#3b2416]">Wat Maha Phruettharam</span>
            </div>
          </div>

          {/* Pickup Time Scheduler & Search Grid */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Scheduled pickup time picker */}
            <div className="md:col-span-4">
              <label className="block text-[11px] font-semibold text-[#786b5e] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#b45309]" />
                เวลารับสินค้าล่วงหน้า
              </label>
              <select
                value={pickupSchedule}
                onChange={(e) => setPickupSchedule(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#d8cfc4] rounded-lg text-xs font-semibold text-[#2b2118] focus:outline-none focus:ring-2 focus:ring-[#b45309]"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* If Dine-in, show table selector */}
            {orderType === 'dine-in' ? (
              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-[#786b5e] uppercase tracking-wider mb-1">
                  หมายเลขโต๊ะ
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="เช่น โต๊ะ 04"
                  className="w-full px-3 py-2 bg-white border border-[#d8cfc4] rounded-lg text-xs font-semibold text-[#2b2118] focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                />
              </div>
            ) : (
              <div className="hidden md:block md:col-span-1" />
            )}

            {/* Search Input */}
            <div className={orderType === 'dine-in' ? 'md:col-span-5' : 'md:col-span-7'}>
              <label className="block text-[11px] font-semibold text-[#786b5e] uppercase tracking-wider mb-1">
                ค้นหาเมนูเครื่องดื่มและขนมปัง
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9a8a7c]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหา เช่น ชาไทย, มัทฉะ, โชกุปัง, ครัวซองต์..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#d8cfc4] rounded-lg text-xs text-[#2b2118] placeholder-[#9a8a7c] focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ล้าง
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
