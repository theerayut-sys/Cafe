import React, { useState } from 'react';
import { Sparkles, Plus, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryId, MenuItem } from '../types';
import { CATEGORIES } from '../data/initialData';

interface MenuSectionProps {
  onSelectItem: (item: MenuItem) => void;
  searchQuery: string;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onSelectItem, searchQuery }) => {
  const { menuItems } = useApp();
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');

  // Filter items by category and search
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'signature'
        ? item.category === 'signature' || item.isPopular
        : item.category === activeCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#786b5e] mb-1">
            <span>เมนูสดใหม่ประจำวัน</span>
            <span aria-hidden="true">·</span>
            <span>ชงสดแก้วต่อแก้ว ปิ้งเตาถ่านหอมกรุ่น</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2b2118]">
            เมนูเครื่องดื่ม ขนมปัง และของทานเล่น
          </h2>
        </div>

        {/* Category Tabs (Segmented Buttons) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#ede6dc] rounded-xl overflow-x-auto max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#3b2416] text-white shadow-sm'
                  : 'text-[#6e5e50] hover:text-[#2b2118]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Zero items state */}
      {filteredItems.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#e5dcd3] p-8">
          <p className="text-sm font-semibold text-[#2b2118]">ไม่พบเมนูที่ตรงกับคำค้นหา &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูเมนูอร่อยเพิ่มเติม</p>
        </div>
      )}

      {/* Product Grid: 3-column desktop, 2-column tablet/mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredItems.map((item) => {
          const isDiscounted = !!item.discountPrice && item.discountPrice < item.price;
          const currentPrice = item.discountPrice ?? item.price;

          return (
            <div
              key={item.id}
              className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col ${
                item.inStock
                  ? 'border-[#e8dfd5] hover:border-[#b45309] hover:-translate-y-1 hover:shadow-lg'
                  : 'border-slate-200 opacity-60'
              }`}
            >
              {/* Product Image (Takes ~65% height, consistent 4:3 aspect ratio) */}
              <div className="relative aspect-[4/3] w-full bg-[#f4efe8] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Subdued editorial kicker */}
                {item.isPopular && item.inStock && (
                  <div className="absolute top-3 left-3 bg-[#3b2416]/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>เมนูยอดนิยม</span>
                  </div>
                )}

                {item.isMonthlyPromo && item.inStock && !item.isPopular && (
                  <div className="absolute top-3 left-3 bg-[#b45309]/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-semibold">
                    โปรโมชั่นเดือนนี้
                  </div>
                )}

                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span>สินค้าหมดชั่วคราว</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs text-[#786b5e] mb-1.5">
                    <span>{item.type === 'drink' ? 'เครื่องดื่ม' : 'ขนมปัง & อบสด'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#b45309]" />
                      {item.preparationMinutes} นาที
                    </span>
                    {item.calories && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{item.calories} kcal</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#2b2118] group-hover:text-[#b45309] transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#6e5e50] mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Row: Price & Action */}
                <div className="mt-5 pt-4 border-t border-[#f0e8df] flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#2b2118] tabular-nums">
                      {currentPrice} บาท
                    </span>
                    {isDiscounted && (
                      <span className="text-xs text-slate-400 line-through tabular-nums">
                        {item.price} บาท
                      </span>
                    )}
                  </div>

                  <button
                    disabled={!item.inStock}
                    onClick={() => onSelectItem(item)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#3b2416] hover:bg-[#2b180d] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ปรับแต่ง &amp; สั่ง</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
