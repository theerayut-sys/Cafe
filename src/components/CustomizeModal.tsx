import React, { useState } from 'react';
import { X, Plus, Minus, Check, Flame, Clock } from 'lucide-react';
import {
  MenuItem,
  CartItem,
  SweetnessLevel,
  IceLevel,
  MilkType,
  ToastLevel,
  ToppingOption,
} from '../types';
import { TOPPINGS } from '../data/initialData';
import { useApp } from '../context/AppContext';

interface CustomizeModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({ item, onClose }) => {
  const { addToCart, setIsCartOpen } = useApp();

  const [sweetness, setSweetness] = useState<SweetnessLevel>('50%');
  const [ice, setIce] = useState<IceLevel>('ปกติ');
  const [milk, setMilk] = useState<MilkType>('นมสดแท้ (Regular)');
  const [toast, setToast] = useState<ToastLevel>('ปิ้งกรอบนอกนุ่มใน');
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  const sweetnessOptions: { level: SweetnessLevel; label: string; desc: string }[] = [
    { level: '0%', label: 'ไม่หวานเลย', desc: '0% น้ำตาล' },
    { level: '25%', label: 'หวานน้อยมาก', desc: 'กลิ่นชาเด่นชัด' },
    { level: '50%', label: 'หวานน้อย (แนะนำ)', desc: 'กลมกล่อมนุ่มนวล' },
    { level: '100%', label: 'หวานปกติ', desc: 'สูตรมาตรฐานของร้าน' },
    { level: '125%', label: 'หวานเข้มข้น', desc: 'สำหรับสายหวาน' },
  ];

  const iceOptions: { level: IceLevel; extra: number }[] = [
    { level: 'ปกติ', extra: 0 },
    { level: 'น้อย', extra: 0 },
    { level: 'ไม่ใส่น้ำแข็ง', extra: 0 },
    { level: 'ร้อน', extra: 0 },
    { level: 'ปั่น (+15฿)', extra: 15 },
  ];

  const milkOptions: { type: MilkType; extra: number }[] = [
    { type: 'นมสดแท้ (Regular)', extra: 0 },
    { type: 'นมโอ๊ต Oat Milk (+15฿)', extra: 15 },
    { type: 'นมถั่วเหลือง Soy Milk (+10฿)', extra: 10 },
    { type: 'นมอัลมอนด์ Almond (+15฿)', extra: 15 },
  ];

  const toastOptions: ToastLevel[] = [
    'ปิ้งกรอบนอกนุ่มใน',
    'ปิ้งกรอบพิเศษ',
    'นึ่งนุ่มฟู',
    'ไม่ปิ้ง (ทานสด)',
  ];

  const toggleTopping = (topping: ToppingOption) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  // Upcharges calculation
  const basePrice = item.discountPrice ?? item.price;
  const iceExtra = ice === 'ปั่น (+15฿)' ? 15 : 0;
  const milkExtra = milk.includes('+15฿') ? 15 : milk.includes('+10฿') ? 10 : 0;
  const toppingsExtra = selectedToppings.reduce((sum, t) => sum + t.price, 0);

  const unitPrice = basePrice + iceExtra + milkExtra + toppingsExtra;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      cartItemId: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      menuItem: item,
      quantity,
      customization: {
        sweetness,
        ice,
        milk,
        toast: item.allowToast ? toast : undefined,
        toppings: selectedToppings,
        notes: notes.trim() || undefined,
      },
      unitPrice,
      totalPrice,
    };

    addToCart(cartItem);
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#e5dcd3] flex flex-col max-h-[92vh]">
        {/* Header with image & item info */}
        <div className="relative bg-white border-b border-[#e5dcd3] p-4 sm:p-5 flex gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#f0e8df] flex-shrink-0 border border-[#e8dfd5]">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 text-xs text-[#786b5e]">
              <span>{item.type === 'drink' ? 'เครื่องดื่มชงสด' : 'เบเกอรี่อบใหม่'}</span>
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
            <h3 className="text-base sm:text-lg font-bold text-[#2b2118] truncate mt-0.5">
              {item.name}
            </h3>
            <p className="text-xs text-[#6e5e50] line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#b45309] tabular-nums">
                {unitPrice} ฿
              </span>
              {item.discountPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {item.price} ฿
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Sweetness Selector (Drinks) */}
          {item.allowSweetness && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#2b2118] uppercase tracking-wider flex items-center gap-1.5">
                  <span>ระดับความหวาน</span>
                  <span className="text-amber-600 font-normal">({sweetness})</span>
                </label>
                <span className="text-[11px] text-slate-500">เลือก 1 ระดับ</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sweetnessOptions.map((opt) => (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setSweetness(opt.level)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      sweetness === opt.level
                        ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                        : 'bg-white text-[#2b2118] border-[#e8dfd5] hover:border-[#b45309]'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{opt.level}</span>
                      {sweetness === opt.level && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${sweetness === opt.level ? 'text-[#d8c3b0]' : 'text-slate-500'}`}>
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ice / Temperature Selector (Drinks) */}
          {item.allowIce && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#2b2118] uppercase tracking-wider">
                  อุณหภูมิ &amp; น้ำแข็ง
                </label>
                <span className="text-[11px] text-slate-500">เลือกได้ 1 แบบ</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {iceOptions.map((opt) => (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setIce(opt.level)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      ice === opt.level
                        ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                        : 'bg-white text-[#2b2118] border-[#e8dfd5] hover:border-[#b45309]'
                    }`}
                  >
                    {opt.level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk Selection (if applicable) */}
          {item.allowMilk && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#2b2118] uppercase tracking-wider">
                  ตัวเลือกนม (Milk Alternative)
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {milkOptions.map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setMilk(opt.type)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                      milk === opt.type
                        ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                        : 'bg-white text-[#2b2118] border-[#e8dfd5] hover:border-[#b45309]'
                    }`}
                  >
                    <span className="font-medium">{opt.type}</span>
                    {milk === opt.type && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toast Preference (for Shokupan & Bakery) */}
          {item.allowToast && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#2b2118] uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#b45309]" />
                  <span>ระดับการปิ้งขนมปังโชกุปัง</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {toastOptions.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setToast(level)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs font-medium flex items-center justify-between ${
                      toast === level
                        ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                        : 'bg-white text-[#2b2118] border-[#e8dfd5] hover:border-[#b45309]'
                    }`}
                  >
                    <span>{level}</span>
                    {toast === level && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toppings (Multi-select) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#2b2118] uppercase tracking-wider">
                ท็อปปิ้งเพิ่มเติม (เลือกได้ตามใจชอบ)
              </label>
              <span className="text-[11px] text-slate-500">เลือกได้มากกว่า 1 อย่าง</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TOPPINGS.map((topping) => {
                const isSelected = selectedToppings.some((t) => t.id === topping.id);
                return (
                  <button
                    key={topping.id}
                    type="button"
                    onClick={() => toggleTopping(topping)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#f4efe8] border-[#b45309] text-[#2b2118]'
                        : 'bg-white border-[#e8dfd5] text-[#4a3d31] hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#b45309] border-[#b45309] text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-medium">{topping.name}</span>
                    </div>
                    <span className="font-semibold text-[#b45309] tabular-nums">+{topping.price}฿</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special instructions */}
          <div>
            <label className="block text-xs font-bold text-[#2b2118] uppercase tracking-wider mb-1.5">
              ข้อความระบุพิเศษถึงบาริสต้า / เชฟ
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ขอแก้วกระดาษ, แยกน้ำแข็งใส่ถุง, ขอส้อม 2 ชุด..."
              maxLength={80}
              className="w-full px-3.5 py-2.5 bg-white border border-[#d8cfc4] rounded-xl text-xs text-[#2b2118] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b45309]"
            />
          </div>
        </div>

        {/* Footer with Quantity Stepper & Add to Cart */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#e5dcd3] flex items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-[#d8cfc4] rounded-xl bg-[#faf7f2] p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 transition-all"
              aria-label="ลดจำนวน"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-[#2b2118] tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white transition-all"
              aria-label="เพิ่มจำนวน"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-sm text-white bg-[#3b2416] hover:bg-[#2b180d] active:scale-[0.99] transition-all flex items-center justify-between shadow-md"
          >
            <span>เพิ่มลงตะกร้า</span>
            <span className="tabular-nums font-mono">{totalPrice} บาท</span>
          </button>
        </div>
      </div>
    </div>
  );
};
