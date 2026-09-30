import React, { useState, useRef } from 'react';
import {
  Coffee,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  Package,
  Layers,
  Search,
  DollarSign,
  AlertTriangle,
  RotateCw,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Save,
  Check,
  Star,
  BellRing,
  LogOut,
  X,
  AlertCircle,
  QrCode,
  Phone,
  Award,
  Copy,
  Smartphone,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem, OrderStatus, CategoryId, StockItem, BankQrConfig, MemberProfile } from '../../types';
import { CATEGORIES, INITIAL_BANK_QRS } from '../../data/initialData';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    menuItems,
    updateMenuItem,
    addMenuItem,
    deleteMenuItem,
    toggleMenuItemStock,
    stock,
    restockItem,
    adjustStockQuantity,
    reviews,
    setCurrentView,
    adminLogout,
    bankQrs,
    updateBankQr,
    addBankQr,
    deleteBankQr,
    resetBankQrs,
    membersMap,
    updateMemberPoints,
    registerOrUpdateMember,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'menu' | 'stock' | 'analytics' | 'bank-qr' | 'loyalty'>('queue');
  const [queueFilter, setQueueFilter] = useState<'all' | OrderStatus>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryId | 'all'>('all');

  // Bank QR Code Management State
  const [bankToast, setBankToast] = useState<string | null>(null);
  const [editingBank, setEditingBank] = useState<BankQrConfig | null>(null);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankForm, setNewBankForm] = useState<Partial<BankQrConfig>>({
    bankName: '',
    bankCode: 'kbank',
    accountName: 'บจก. คาเฟอีน คาเฟ่ (Caffeine Cafe)',
    accountNumber: '',
    qrImageUrl: '',
    isActive: true,
    color: '#00a950',
  });

  // Loyalty / Points Phone Management State
  const [loyaltySearch, setLoyaltySearch] = useState('');
  const [loyaltyToast, setLoyaltyToast] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    phone: '',
    name: '',
    points: 50,
  });
  const [adjustPointsModal, setAdjustPointsModal] = useState<{
    phone: string;
    name: string;
    currentPoints: number;
    amount: number;
    reason: string;
  } | null>(null);

  // Edit Menu Item Modal State
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    nameEn: string;
    category: CategoryId;
    price: number;
    discountPrice?: number;
    description: string;
    imageUrl: string;
    type: 'drink' | 'bakery';
    preparationMinutes: number;
  }>({
    name: '',
    nameEn: '',
    category: 'signature',
    price: 85,
    description: '',
    imageUrl: '',
    type: 'drink',
    preparationMinutes: 4,
  });

  // Delete Confirmation Modal State
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // New Menu Item Form Modal State
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenuForm, setNewMenuForm] = useState<{
    name: string;
    nameEn: string;
    category: CategoryId;
    price: number;
    discountPrice?: number;
    description: string;
    imageUrl: string;
    type: 'drink' | 'bakery';
    preparationMinutes: number;
  }>({
    name: '',
    nameEn: '',
    category: 'signature',
    price: 90,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80',
    type: 'drink',
    preparationMinutes: 4,
  });

  // File input refs
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Helper to convert local image to Data URL (base64)
  const handleImageFileUpload = (file: File, isEdit: boolean) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (isEdit) {
          setEditForm((prev) => ({ ...prev, imageUrl: result }));
        } else {
          setNewMenuForm((prev) => ({ ...prev, imageUrl: result }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      nameEn: item.nameEn,
      category: item.category,
      price: item.price,
      discountPrice: item.discountPrice,
      description: item.description,
      imageUrl: item.imageUrl,
      type: item.type,
      preparationMinutes: item.preparationMinutes,
    });
  };

  // Submit Edit Menu Item
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editForm.name.trim()) return;

    updateMenuItem({
      ...editingItem,
      name: editForm.name.trim(),
      nameEn: editForm.nameEn.trim() || editForm.name.trim(),
      category: editForm.category,
      price: Number(editForm.price),
      discountPrice: editForm.discountPrice ? Number(editForm.discountPrice) : undefined,
      description: editForm.description.trim(),
      imageUrl: editForm.imageUrl || editingItem.imageUrl,
      type: editForm.type,
      preparationMinutes: Number(editForm.preparationMinutes),
      allowSweetness: editForm.type === 'drink',
      allowIce: editForm.type === 'drink',
      allowMilk: editForm.type === 'drink',
      allowToast: editForm.type === 'bakery',
    });

    setEditingItem(null);
  };

  // Filter orders for queue
  const filteredOrders = orders.filter((o) => (queueFilter === 'all' ? true : o.status === queueFilter));

  // Analytics Computations
  const totalRevenue = orders.reduce((sum, o) => sum + o.netTotal, 0);
  const totalOrdersCount = orders.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const avgCsat = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  // Count item sales
  const itemSalesMap: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (!itemSalesMap[item.menuItem.id]) {
        itemSalesMap[item.menuItem.id] = {
          name: item.menuItem.name,
          count: 0,
          revenue: 0,
        };
      }
      itemSalesMap[item.menuItem.id].count += item.quantity;
      itemSalesMap[item.menuItem.id].revenue += item.totalPrice;
    });
  });

  const topSellingItems = Object.values(itemSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const lowStockCount = stock.filter((s) => s.quantity <= s.minimumThreshold).length;

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuForm.name.trim()) return;

    addMenuItem({
      name: newMenuForm.name.trim(),
      nameEn: newMenuForm.nameEn.trim() || newMenuForm.name.trim(),
      category: newMenuForm.category,
      price: Number(newMenuForm.price),
      discountPrice: newMenuForm.discountPrice ? Number(newMenuForm.discountPrice) : undefined,
      description: newMenuForm.description.trim(),
      imageUrl: newMenuForm.imageUrl,
      type: newMenuForm.type,
      preparationMinutes: Number(newMenuForm.preparationMinutes),
      inStock: true,
      allowSweetness: newMenuForm.type === 'drink',
      allowIce: newMenuForm.type === 'drink',
      allowMilk: newMenuForm.type === 'drink',
      allowToast: newMenuForm.type === 'bakery',
    });

    setShowAddMenuModal(false);
    setNewMenuForm({
      name: '',
      nameEn: '',
      category: 'signature',
      price: 90,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80',
      type: 'drink',
      preparationMinutes: 4,
    });
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMenuItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  // Bank QR handlers
  const handleBankQrUpload = (bankId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const target = bankQrs.find((b) => b.id === bankId);
      if (target) {
        updateBankQr({
          ...target,
          qrImageUrl: dataUrl,
          updatedAt: new Date().toLocaleDateString('th-TH'),
        });
        setBankToast(`อัปโหลดรูปภาพ QR Code สำหรับ ${target.bankName} เรียบร้อยแล้ว`);
        setTimeout(() => setBankToast(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleBankActive = (bank: BankQrConfig) => {
    updateBankQr({
      ...bank,
      isActive: !bank.isActive,
    });
    setBankToast(`เปลี่ยนสถานะ ${bank.bankName} เป็น ${!bank.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`);
    setTimeout(() => setBankToast(null), 3000);
  };

  const handleSaveBankEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBank) return;
    updateBankQr({
      ...editingBank,
      updatedAt: new Date().toLocaleDateString('th-TH'),
    });
    setEditingBank(null);
    setBankToast(`บันทึกข้อมูล ${editingBank.bankName} สำเร็จ`);
    setTimeout(() => setBankToast(null), 3000);
  };

  const handleAddNewBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankForm.bankName || !newBankForm.accountNumber) return;
    const newConfig: BankQrConfig = {
      id: 'bqr-' + Date.now(),
      bankName: newBankForm.bankName,
      bankCode: newBankForm.bankCode || 'other',
      accountName: newBankForm.accountName || 'บจก. คาเฟอีน คาเฟ่ (Caffeine Cafe)',
      accountNumber: newBankForm.accountNumber,
      qrImageUrl:
        newBankForm.qrImageUrl ||
        'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' +
          encodeURIComponent(newBankForm.accountNumber),
      isActive: true,
      color: newBankForm.color || '#3b2416',
      updatedAt: new Date().toLocaleDateString('th-TH'),
    };
    addBankQr(newConfig);
    setShowAddBankModal(false);
    setNewBankForm({
      bankName: '',
      bankCode: 'kbank',
      accountName: 'บจก. คาเฟอีน คาเฟ่ (Caffeine Cafe)',
      accountNumber: '',
      qrImageUrl: '',
      isActive: true,
      color: '#00a950',
    });
    setBankToast(`เพิ่มบัญชีรับเงิน ${newConfig.bankName} สำเร็จ`);
    setTimeout(() => setBankToast(null), 3000);
  };

  // Loyalty Phone handlers
  const handleAddNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = newMemberForm.phone.trim();
    if (!cleanPhone) return;
    registerOrUpdateMember({
      phone: cleanPhone,
      name: newMemberForm.name.trim() || `ลูกค้า (${cleanPhone})`,
      points: Number(newMemberForm.points) || 0,
    });
    setShowAddMemberModal(false);
    setNewMemberForm({ phone: '', name: '', points: 50 });
    setLoyaltyToast(`ลงทะเบียนเบอร์ ${cleanPhone} เรียบร้อยแล้ว`);
    setTimeout(() => setLoyaltyToast(null), 3500);
  };

  const handleConfirmAdjustPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustPointsModal) return;
    updateMemberPoints(adjustPointsModal.phone, adjustPointsModal.amount);
    setLoyaltyToast(
      `ปรับคะแนนเบอร์ ${adjustPointsModal.phone} (${adjustPointsModal.amount > 0 ? '+' : ''}${adjustPointsModal.amount} แต้ม) สำเร็จ`
    );
    setTimeout(() => setLoyaltyToast(null), 3500);
    setAdjustPointsModal(null);
  };

  return (
    <div className="min-h-screen bg-[#f3efe8] text-[#2b2118]">
      {/* Top Backoffice Banner with User Info & Logout */}
      <div className="bg-[#1e1711] text-white border-b border-[#3b2b1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#b45309] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              POS
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide">
                  ระบบจัดการร้านหลังบ้าน · Caffeine OS
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                  User: WMP9999 (Authenticated)
                </span>
              </div>
              <span className="text-[11px] text-[#b8a695]">
                สาขา Wat Maha Phruettharam (Real-time Cloud Sync)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <button
                onClick={() => setActiveTab('stock')}
                className="px-2.5 py-1 text-xs font-semibold bg-red-900/80 text-red-200 border border-red-700 rounded-lg flex items-center gap-1.5 animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>เตือนวัตถุดิบใกล้หมด ({lowStockCount})</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('customer')}
              className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>กลับหน้าร้าน</span>
            </button>

            <button
              onClick={adminLogout}
              className="px-3 py-1.5 text-xs font-semibold bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="ออกจากระบบจัดการหลังบ้าน"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white border-b border-[#e5dcd3] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-[#3b2416] text-white shadow-sm'
                : 'text-[#6e5e50] hover:bg-[#faf7f2]'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>คิวคำสั่งซื้อ &amp; ครัว ({orders.filter(o => o.status !== 'completed').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-[#3b2416] text-white shadow-sm'
                : 'text-[#6e5e50] hover:bg-[#faf7f2]'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>จัดการเมนู (แก้ไขชื่อ/ราคา/อัปโหลดภาพ/ลบ)</span>
          </button>

          <button
            onClick={() => setActiveTab('bank-qr')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bank-qr'
                ? 'bg-[#3b2416] text-white shadow-sm'
                : 'text-[#6e5e50] hover:bg-[#faf7f2]'
            }`}
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>จัดการ QR Code ธนาคาร ({bankQrs.filter(b => b.isActive).length} ใช้งาน)</span>
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'loyalty'
                ? 'bg-[#3b2416] text-white shadow-sm'
                : 'text-[#6e5e50] hover:bg-[#faf7f2]'
            }`}
          >
            <Phone className="w-4 h-4 text-amber-600" />
            <span>สะสมแต้มตามเบอร์โทร ({Object.keys(membersMap).length} สมาชิก)</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'stock'
                ? 'bg-[#3b2416] text-white shadow-sm'
                : 'text-[#6e5e50] hover:bg-[#faf7f2]'
            }`}
          >
            <Package className="w-4 h-4 text-indigo-600" />
            <span>จัดการสต็อกสินค้า &amp; วัตถุดิบ</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#3b2416] text-white shadow-sm'
                : 'text-[#6e5e50] hover:bg-[#faf7f2]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>รายงานวิเคราะห์ข้อมูลการขาย &amp; CSAT</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ============================================================== */}
        {/* TAB 1: LIVE KITCHEN QUEUE */}
        {/* ============================================================== */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-[#ede6dc] p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setQueueFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    queueFilter === 'all' ? 'bg-[#3b2416] text-white shadow-sm' : 'text-[#6e5e50]'
                  }`}
                >
                  ทั้งหมด ({orders.length})
                </button>
                <button
                  onClick={() => setQueueFilter('received')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    queueFilter === 'received' ? 'bg-[#3b2416] text-white shadow-sm' : 'text-[#6e5e50]'
                  }`}
                >
                  รอดำเนินการ ({orders.filter(o => o.status === 'received').length})
                </button>
                <button
                  onClick={() => setQueueFilter('preparing')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    queueFilter === 'preparing' ? 'bg-[#3b2416] text-white shadow-sm' : 'text-[#6e5e50]'
                  }`}
                >
                  กำลังชง/อบ ({orders.filter(o => o.status === 'preparing').length})
                </button>
                <button
                  onClick={() => setQueueFilter('ready')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    queueFilter === 'ready' ? 'bg-[#3b2416] text-white shadow-sm' : 'text-[#6e5e50]'
                  }`}
                >
                  พร้อมรับสินค้า ({orders.filter(o => o.status === 'ready').length})
                </button>
                <button
                  onClick={() => setQueueFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    queueFilter === 'completed' ? 'bg-[#3b2416] text-white shadow-sm' : 'text-[#6e5e50]'
                  }`}
                >
                  เสร็จสิ้น ({orders.filter(o => o.status === 'completed').length})
                </button>
              </div>

              <div className="text-xs text-[#786b5e] flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-[#b45309]" />
                <span>การเปลี่ยนสถานะจะส่งการแจ้งเตือนไปยัง LINE ของลูกค้าทันที</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-[#e5dcd3]">
                  <p className="text-sm font-semibold text-slate-700">ไม่มีออเดอร์ในสถานะนี้</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all ${
                      order.status === 'ready'
                        ? 'border-amber-400 ring-2 ring-amber-200'
                        : order.status === 'preparing'
                        ? 'border-blue-300'
                        : 'border-[#e8dfd5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between pb-3 border-b border-[#f0e8df]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-12 h-12 rounded-xl bg-[#3b2416] text-white flex flex-col items-center justify-center font-bold">
                            <span className="text-[9px] text-[#d8c3b0] uppercase">คิว</span>
                            <span className="text-base font-black tabular-nums">{order.queueNumber}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#2b2118]">{order.customerName}</h4>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-[#b45309]" />
                                <span>{order.customerPhone}</span>
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                                +{order.pointsEarned} แต้ม
                              </span>
                              {order.pointsUsed > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 font-semibold border border-rose-200">
                                  ใช้ {order.pointsUsed} แต้ม (-{order.discount}฿)
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{order.createdAt}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            order.status === 'ready'
                              ? 'bg-amber-100 text-amber-800'
                              : order.status === 'preparing'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {order.status === 'ready'
                            ? 'พร้อมรับ ✨'
                            : order.status === 'preparing'
                            ? 'กำลังทำ'
                            : order.status === 'completed'
                            ? 'เสร็จสิ้น'
                            : 'รอดำเนินการ'}
                        </span>
                      </div>

                      <div className="py-2.5 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#b45309]" />
                          <span>{order.pickupTime}</span>
                        </span>
                        <span className="font-semibold text-slate-800">
                          {order.orderType === 'dine-in'
                            ? `ทานที่ร้าน (${order.tableNumber})`
                            : order.orderType === 'takeaway'
                            ? 'รับที่ร้าน'
                            : 'เดลิเวอรี่'}
                        </span>
                      </div>

                      <div className="space-y-2 py-2 border-t border-[#f0e8df]">
                        {order.items.map((item) => (
                          <div key={item.cartItemId} className="text-xs bg-[#faf7f2] p-2.5 rounded-xl border border-[#efe6dc]">
                            <div className="flex items-start justify-between font-bold text-[#2b2118]">
                              <span>
                                {item.quantity}x {item.menuItem.name}
                              </span>
                              <span className="tabular-nums">{item.totalPrice}฿</span>
                            </div>

                            <div className="text-[11px] text-[#786b5e] mt-1 space-y-0.5">
                              {item.menuItem.allowSweetness && (
                                <div>• หวาน: {item.customization.sweetness} · {item.customization.ice}</div>
                              )}
                              {item.customization.milk !== 'นมสดแท้ (Regular)' && (
                                <div>• {item.customization.milk}</div>
                              )}
                              {item.customization.toast && (
                                <div>• การปิ้ง: {item.customization.toast}</div>
                              )}
                              {item.customization.toppings.length > 0 && (
                                <div className="text-[#b45309] font-medium">
                                  • +{item.customization.toppings.map((t) => t.name).join(', ')}
                                </div>
                              )}
                              {item.customization.notes && (
                                <div className="text-red-700 italic">
                                  หมายเหตุ: &ldquo;{item.customization.notes}&rdquo;
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f0e8df] space-y-2">
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>ยอดชำระ:</span>
                        <strong className="text-sm font-bold text-[#3b2416] tabular-nums">
                          {order.netTotal} บาท ({order.paymentMethod})
                        </strong>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {order.status === 'received' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="col-span-2 py-2 px-3 bg-[#3b2416] hover:bg-[#2b180d] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <Coffee className="w-3.5 h-3.5 text-amber-400" />
                            <span>เริ่มชง / อบขนม</span>
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="col-span-2 py-2 px-3 bg-[#b45309] hover:bg-[#92400e] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <BellRing className="w-3.5 h-3.5 text-white" />
                            <span>พร้อมรับสินค้า (เรียกคิว {order.queueNumber})</span>
                          </button>
                        )}

                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="col-span-2 py-2 px-3 bg-[#047857] hover:bg-[#065f46] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ส่งมอบสินค้าเรียบร้อย</span>
                          </button>
                        )}

                        {order.status === 'completed' && (
                          <div className="col-span-2 text-center text-xs font-medium text-emerald-700 py-1 bg-emerald-50 rounded-lg">
                            ✓ ออเดอร์เสร็จสิ้นสมบูรณ์
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MENU & REAL-TIME PRICE & EDIT / DELETE / UPLOAD */}
        {/* ============================================================== */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#2b2118]">
                  จัดการเมนูสินค้า (แก้ไขชื่อ/ราคา, อัปโหลดภาพจากเครื่อง, ลบ &amp; เพิ่มเมนู)
                </h3>
                <p className="text-xs text-[#786b5e]">
                  แบ่งหมวดหมู่ชัดเจน: เมนูซิกเนเจอร์, เครื่องดื่ม, ขนมปัง, ของทานเล่น
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="ค้นหาชื่อเมนู..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#d8cfc4] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#3b2416]"
                  />
                </div>

                <button
                  onClick={() => setShowAddMenuModal(true)}
                  className="px-4 py-2 bg-[#3b2416] hover:bg-[#2b180d] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มเมนูใหม่</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 bg-[#ede6dc] p-1 rounded-xl text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-[#3b2416] text-white shadow-sm'
                    : 'text-[#6e5e50] hover:text-[#2b2118]'
                }`}
              >
                ทั้งหมด ({menuItems.length})
              </button>
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    selectedCategoryFilter === cat.id
                      ? 'bg-[#3b2416] text-white shadow-sm'
                      : 'text-[#6e5e50] hover:text-[#2b2118]'
                  }`}
                >
                  {cat.name} ({menuItems.filter((m) => m.category === cat.id).length})
                </button>
              ))}
            </div>

            {/* Menu Items Table */}
            <div className="bg-white rounded-2xl border border-[#e5dcd3] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf7f2] border-b border-[#e5dcd3] text-[#786b5e] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">รูปภาพ &amp; ชื่อเมนู</th>
                      <th className="px-4 py-3.5">หมวดหมู่</th>
                      <th className="px-4 py-3.5">ราคาปกติ</th>
                      <th className="px-4 py-3.5">โปรโมชั่น</th>
                      <th className="px-4 py-3.5">สถานะสต็อก</th>
                      <th className="px-4 py-3.5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e8df]">
                    {menuItems
                      .filter((m) => {
                        const matchesCategory =
                          selectedCategoryFilter === 'all' ? true : m.category === selectedCategoryFilter;
                        const matchesSearch =
                          !menuSearch ||
                          m.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                          m.nameEn.toLowerCase().includes(menuSearch.toLowerCase());
                        return matchesCategory && matchesSearch;
                      })
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-[#faf7f2]/60 transition-colors">
                          {/* Image & Name */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative group/thumb">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-[#e8dfd5] flex-shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                                <span className="text-[11px] text-slate-500 font-normal">{item.nameEn}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3.5">
                            <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                              {CATEGORIES.find((c) => c.id === item.category)?.name || item.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-800 tabular-nums">
                              {item.price} บาท
                            </span>
                          </td>

                          {/* Discount price */}
                          <td className="px-4 py-3.5">
                            {item.discountPrice ? (
                              <span className="font-bold text-amber-700 tabular-nums">
                                {item.discountPrice} บาท
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Stock Toggle */}
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => toggleMenuItemStock(item.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                                item.inStock
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {item.inStock ? 'พร้อมขาย (In Stock)' : 'หมดชั่วคราว (Sold Out)'}
                            </button>
                          </td>

                          {/* Actions: Edit & Delete */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="px-2.5 py-1.5 bg-[#f4efe8] hover:bg-[#ede6dc] text-[#3b2416] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="แก้ไขชื่อ, ราคา, หมวดหมู่, และอัปโหลดภาพ"
                              >
                                <Edit2 className="w-3 h-3 text-[#b45309]" />
                                <span>แก้ไข</span>
                              </button>

                              <button
                                onClick={() => setItemToDelete(item)}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="ลบเมนูนี้ออกจากระบบ"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                                <span>ลบ</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: INVENTORY & STOCK MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#2b2118]">
                  ระบบจัดการสต็อกวัตถุดิบ (Inventory Management)
                </h3>
                <p className="text-xs text-[#786b5e]">
                  ตรวจเช็คปริมาณวัตถุดิบชา กาแฟ นม และขนมปังโชกุปัง พร้อมระบบแจ้งเตือนอัตโนมัติ
                </p>
              </div>

              <div className="text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-[#e5dcd3] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>ตัดสต็อกอัตโนมัติทุกครั้งเมื่อมีการสั่งซื้อผ่านแอป</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stock.map((item: StockItem) => {
                const isLow = item.quantity <= item.minimumThreshold;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between ${
                      isLow ? 'border-red-300 ring-1 ring-red-100 bg-red-50/20' : 'border-[#e8dfd5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {item.category === 'raw' ? 'วัตถุดิบหลัก' : item.category === 'ingredient' ? 'ส่วนผสม' : 'บรรจุภัณฑ์'}
                        </span>
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            ใกล้หมด
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            ปกติ
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                        {item.name}
                      </h4>

                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-2xl font-black text-[#2b2118] tabular-nums font-mono">
                          {item.quantity.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                      </div>

                      <div className="mt-1 text-[11px] text-slate-400 flex justify-between">
                        <span>ขั้นต่ำ: {item.minimumThreshold.toLocaleString()} {item.unit}</span>
                        <span>เติมล่าสุด: {item.lastRestocked}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f0e8df] flex items-center gap-2">
                      <button
                        onClick={() => {
                          const amount = item.unit === 'ลิตร' || item.unit === 'แถว' ? 10 : 500;
                          restockItem(item.id, amount);
                        }}
                        className="flex-1 py-1.5 px-2 bg-[#faf7f2] hover:bg-[#ede6dc] border border-[#d8cfc4] rounded-lg text-xs font-semibold text-[#3b2416] transition-colors flex items-center justify-center gap-1"
                      >
                        <RotateCw className="w-3 h-3 text-[#b45309]" />
                        <span>
                          เติม +{item.unit === 'ลิตร' || item.unit === 'แถว' ? 10 : 500} {item.unit}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SALES REPORT & BUSINESS ANALYTICS */}
        {/* ============================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#2b2118]">
                รายงานวิเคราะห์ยอดขายและข้อมูลเชิงธุรกิจ (Business Analytics)
              </h3>
              <p className="text-xs text-[#786b5e]">
                ข้อมูลเรียลไทม์เพื่อช่วยตัดสินใจ ปรับปรุงสูตร และวางแผนการตลาด
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#e5dcd3] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>ยอดขายรวมวันนี้</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2 font-mono tabular-nums">
                  {totalRevenue.toLocaleString()} ฿
                </div>
                <span className="text-[11px] text-emerald-700 mt-1 block">
                  ↑ +18.4% เทียบกับสัปดาห์ก่อน
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e5dcd3] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>จำนวนออเดอร์ทั้งหมด</span>
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2 font-mono tabular-nums">
                  {totalOrdersCount} บิล
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  บาริสต้ากำลังทำเฉลี่ย 4-5 นาที/แก้ว
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e5dcd3] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>ราคาเฉลี่ยต่อบิล (AOV)</span>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2 font-mono tabular-nums">
                  {aov} ฿
                </div>
                <span className="text-[11px] text-[#b45309] mt-1 block">
                  การจับคู่เครื่องดื่ม+โชกุปังช่วยเพิ่มยอดบิล
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e5dcd3] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>คะแนนความพึงพอใจ (CSAT)</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2 font-mono tabular-nums">
                  {avgCsat} / 5.0
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  จากรีวิวลูกค้า {reviews.length} รายการ
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-[#e5dcd3] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      ช่วงเวลาที่มีการสั่งซื้อหนาแน่น (Peak Hours Distribution)
                    </h4>
                    <span className="text-xs text-slate-500">
                      ช่วงเช้า (08:00 - 10:00) และช่วงบ่าย (12:00 - 14:00) มียอดสั่งซื้อสูงสุด
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">วันนี้</span>
                </div>

                <div className="h-56 w-full flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
                  {[
                    { hour: '08:00', height: 60, orders: 12 },
                    { hour: '09:00', height: 85, orders: 24 },
                    { hour: '10:00', height: 95, orders: 28 },
                    { hour: '11:00', height: 50, orders: 14 },
                    { hour: '12:00', height: 100, orders: 32 },
                    { hour: '13:00', height: 80, orders: 22 },
                    { hour: '14:00', height: 65, orders: 18 },
                    { hour: '15:00', height: 45, orders: 11 },
                    { hour: '16:00', height: 35, orders: 8 },
                    { hour: '17:00', height: 25, orders: 5 },
                  ].map((bar) => (
                    <div key={bar.hour} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                        {bar.orders}บิล
                      </div>
                      <div
                        className="w-full bg-[#3b2416] hover:bg-[#b45309] rounded-t-lg transition-all duration-300 group-hover:scale-y-105 origin-bottom"
                        style={{ height: `${bar.height}%` }}
                      />
                      <span className="text-[10px] font-medium text-slate-500 mt-2">
                        {bar.hour}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#e5dcd3] shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  5 เมนูขายดีที่สุด (Top Sellers)
                </h4>
                <p className="text-xs text-slate-500 mb-4">จัดอันดับตามจำนวนชิ้นที่จำหน่าย</p>

                <div className="space-y-3.5">
                  {topSellingItems.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <span className="w-5 h-5 rounded-full bg-[#faf7f2] border border-[#e5dcd3] text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-[#b45309] tabular-nums font-mono">
                          {item.count} ชิ้น
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {item.revenue}฿
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: BANK QR CODE MANAGEMENT & UPLOAD */}
        {/* ============================================================== */}
        {activeTab === 'bank-qr' && (
          <div className="space-y-6">
            {/* Notification Toast */}
            {bankToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{bankToast}</span>
                </div>
                <button onClick={() => setBankToast(null)} className="text-emerald-700 hover:text-emerald-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Header info banner */}
            <div className="bg-white rounded-2xl p-5 border border-[#e5dcd3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2b2118]">
                      จัดการ QR Code ธนาคารสำหรับรับชำระเงินออนไลน์
                    </h3>
                    <p className="text-xs text-[#786b5e]">
                      อัปโหลดไฟล์ภาพ QR Code ของแต่ละธนาคารจากเครื่องของคุณ ลูกค้าจะเห็น QR Code เหล่านี้ในหน้าชำระเงินทันที
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setShowAddBankModal(true)}
                  className="px-4 py-2 bg-[#3b2416] hover:bg-[#28180e] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มบัญชี/QR ธนาคารใหม่</span>
                </button>
                <button
                  onClick={() => {
                    resetBankQrs();
                    setBankToast('รีเซ็ต QR Code ธนาคารเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
                    setTimeout(() => setBankToast(null), 3000);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                  title="รีเซ็ตกลับเป็นค่าเริ่มต้น"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>รีเซ็ตค่าเริ่มต้น</span>
                </button>
              </div>
            </div>

            {/* Grid of Bank QR Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankQrs.map((bank) => (
                <div
                  key={bank.id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-xs transition-all flex flex-col justify-between ${
                    bank.isActive ? 'border-[#e8dfd5]' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    {/* Bank Top Bar */}
                    <div
                      className="px-4 py-3 text-white flex items-center justify-between"
                      style={{ backgroundColor: bank.color }}
                    >
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        <span className="font-bold text-xs">{bank.bankName}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                        {bank.isActive ? 'เปิดรับชำระ' : 'ปิดชำระ'}
                      </span>
                    </div>

                    {/* QR Image Preview & Upload Button */}
                    <div className="p-5 flex flex-col items-center text-center">
                      <div className="relative group p-2.5 bg-[#faf7f2] border-2 border-dashed border-slate-300 rounded-2xl mb-3 shadow-inner">
                        <img
                          src={bank.qrImageUrl}
                          alt={bank.bankName}
                          className="w-44 h-44 object-contain rounded-lg bg-white p-1"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* File Upload Button for device upload */}
                      <label className="w-full py-2 px-3 bg-[#3b2416] hover:bg-[#28180e] text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs hover:shadow">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>อัปโหลด QR Code จากเครื่อง</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBankQrUpload(bank.id, file);
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1">
                        รองรับไฟล์ JPG, PNG, WebP ทุกขนาด
                      </p>

                      {/* Account Details */}
                      <div className="w-full mt-4 p-3 bg-[#faf7f2] rounded-xl text-left text-xs space-y-1.5 border border-[#e8dfd5]">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                            ชื่อบัญชี
                          </span>
                          <span className="font-bold text-[#2b2118] truncate block">
                            {bank.accountName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                            เลขที่บัญชี / หมายเลขพร้อมเพย์
                          </span>
                          <span className="font-mono font-bold text-[#b45309]">
                            {bank.accountNumber}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-[#f0e8df] flex items-center justify-between">
                          <span>อัปเดตล่าสุด:</span>
                          <span className="font-mono">{bank.updatedAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-5 pb-5 pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBankActive(bank)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        bank.isActive
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      {bank.isActive ? 'ปิดชำระชั่วคราว' : 'เปิดรับชำระ'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingBank(bank)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title="แก้ไขชื่อบัญชีและเลขที่บัญชี"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {bank.bankCode !== 'promptpay' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`ยืนยันการลบบัญชี ${bank.bankName}?`)) {
                            deleteBankQr(bank.id);
                            setBankToast(`ลบบัญชี ${bank.bankName} เรียบร้อยแล้ว`);
                            setTimeout(() => setBankToast(null), 3000);
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                        title="ลบบัญชีนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: PHONE LOYALTY & CUSTOMER POINTS */}
        {/* ============================================================== */}
        {activeTab === 'loyalty' && (
          <div className="space-y-6">
            {/* Toast notification */}
            {loyaltyToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{loyaltyToast}</span>
                </div>
                <button onClick={() => setLoyaltyToast(null)} className="text-emerald-700 hover:text-emerald-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Header info banner */}
            <div className="bg-white rounded-2xl p-5 border border-[#e5dcd3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2b2118]">
                      ระบบสะสมแต้มสมาชิกจากเบอร์โทรศัพท์ลูกค้า (Phone Loyalty)
                    </h3>
                    <p className="text-xs text-[#786b5e]">
                      ทุกยอดซื้อ 10 บาท = 1 แต้ม ลูกค้าใช้เพียงเบอร์โทรศัพท์ในการสะสมแต้มและแลกรับส่วนลดได้ทันที
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2 bg-[#3b2416] hover:bg-[#28180e] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ลงทะเบียนเบอร์โทรลูกค้าใหม่</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-[#e5dcd3] shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  จำนวนสมาชิกรวม
                </span>
                <span className="text-2xl font-black text-[#2b2118] font-mono mt-1 block">
                  {Object.keys(membersMap).length} <span className="text-sm font-normal text-slate-500">คน</span>
                </span>
                <span className="text-[11px] text-emerald-600 mt-1 block">
                  ✓ ผูกคะแนนกับเบอร์โทรศัพท์ 100%
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#e5dcd3] shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  สมาชิก Gold &amp; Platinum
                </span>
                <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
                  {
                    Object.values(membersMap).filter(
                      (m) => m.tier === 'Gold' || m.tier === 'Platinum'
                    ).length
                  }{' '}
                  <span className="text-sm font-normal text-slate-500">คน</span>
                </span>
                <span className="text-[11px] text-amber-700 mt-1 block">
                  ลูกค้าประจำที่มียอดสะสมสูง
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#e5dcd3] shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  แต้มสะสมคงเหลือรวม
                </span>
                <span className="text-2xl font-black text-[#b45309] font-mono mt-1 block">
                  {Object.values(membersMap).reduce((acc, m) => acc + (m.points || 0), 0)}{' '}
                  <span className="text-sm font-normal text-slate-500">แต้ม</span>
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  พร้อมแลกส่วนลดได้ที่ร้าน
                </span>
              </div>
            </div>

            {/* Search Box */}
            <div className="bg-white rounded-2xl p-4 border border-[#e5dcd3] shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={loyaltySearch}
                  onChange={(e) => setLoyaltySearch(e.target.value)}
                  placeholder="ค้นหาด้วยเบอร์โทรศัพท์ (เช่น 081, 089) หรือ ชื่อลูกค้า..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#d8cfc4] rounded-xl text-xs font-semibold text-[#2b2118] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b2416]"
                />
                {loyaltySearch && (
                  <button
                    onClick={() => setLoyaltySearch('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ล้าง
                  </button>
                )}
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-2xl border border-[#e5dcd3] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f8f5f0] text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-[#e5dcd3]">
                      <th className="py-3.5 px-4">เบอร์โทรศัพท์</th>
                      <th className="py-3.5 px-4">ชื่อลูกค้า</th>
                      <th className="py-3.5 px-4">ระดับสมาชิก</th>
                      <th className="py-3.5 px-4 text-right">แต้มสะสม</th>
                      <th className="py-3.5 px-4 text-right">ยอดซื้อสะสม</th>
                      <th className="py-3.5 px-4 text-center">จำนวนบิล</th>
                      <th className="py-3.5 px-4 text-center">จัดการแต้มด่วน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e8df]">
                    {Object.values(membersMap)
                      .filter((m) => {
                        if (!loyaltySearch) return true;
                        const query = loyaltySearch.toLowerCase();
                        return (
                          m.phone.toLowerCase().includes(query) ||
                          m.name.toLowerCase().includes(query)
                        );
                      })
                      .map((mem) => (
                        <tr key={mem.phone} className="hover:bg-[#faf7f2]/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#2b2118]">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#b45309]" />
                              <span>{mem.phone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {mem.name}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                mem.tier === 'Platinum'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : mem.tier === 'Gold'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {mem.tier} Member
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-mono font-black text-sm text-[#b45309]">
                              {mem.points}
                            </span>{' '}
                            <span className="text-[10px] text-slate-400">แต้ม</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                            {mem.totalSpent.toLocaleString()} ฿
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-slate-600">
                            {mem.ordersCount} ครั้ง
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => {
                                  updateMemberPoints(mem.phone, 10);
                                  setLoyaltyToast(`เพิ่ม +10 แต้มให้เบอร์ ${mem.phone} เรียบร้อย`);
                                  setTimeout(() => setLoyaltyToast(null), 3000);
                                }}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 text-[11px] transition-colors"
                                title="เพิ่ม 10 แต้ม"
                              >
                                +10
                              </button>
                              <button
                                onClick={() => {
                                  updateMemberPoints(mem.phone, 50);
                                  setLoyaltyToast(`เพิ่ม +50 แต้มให้เบอร์ ${mem.phone} เรียบร้อย`);
                                  setTimeout(() => setLoyaltyToast(null), 3000);
                                }}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 text-[11px] transition-colors"
                                title="เพิ่ม 50 แต้ม"
                              >
                                +50
                              </button>
                              <button
                                onClick={() => {
                                  updateMemberPoints(mem.phone, -50);
                                  setLoyaltyToast(`หัก -50 แต้มจากเบอร์ ${mem.phone} เรียบร้อย`);
                                  setTimeout(() => setLoyaltyToast(null), 3000);
                                }}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 text-[11px] transition-colors"
                                title="หัก 50 แต้ม"
                              >
                                -50
                              </button>
                              <button
                                onClick={() =>
                                  setAdjustPointsModal({
                                    phone: mem.phone,
                                    name: mem.name,
                                    currentPoints: mem.points,
                                    amount: 100,
                                    reason: 'โปรโมชั่นพิเศษจากร้าน',
                                  })
                                }
                                className="px-2 py-1 bg-[#3b2416] hover:bg-[#28180e] text-white font-semibold rounded-lg text-[11px] transition-colors"
                              >
                                ปรับแต่ง...
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: EDIT MENU ITEM (EDIT NAME, PRICE, CATEGORY, UPLOAD IMAGE) */}
      {/* ============================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">แก้ไขข้อมูลเมนู</h3>
                <p className="text-xs text-slate-500">ปรับเปลี่ยนชื่อ ราคา หมวดหมู่ และอัปโหลดรูปภาพ</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Image Preview & Upload from Device */}
              <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e8dfd5] space-y-3">
                <span className="font-bold text-slate-800 block">รูปภาพของเมนู</span>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0 relative group">
                    <img
                      src={editForm.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFileUpload(file, true);
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#b45309]" />
                      <span>อัปโหลดรูปจากเครื่องของคุณ</span>
                    </button>
                    <span className="text-[11px] text-slate-500 block">
                      รองรับไฟล์ภาพ JPG, PNG, WEBP (แปลงเป็นภาพพร้อมแสดงผลทันที)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    หรือระบุ Image URL โดยตรง:
                  </label>
                  <input
                    type="url"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              {/* Edit Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อเมนู (ภาษาไทย) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อเมนูภาษาอังกฤษ
                  </label>
                  <input
                    type="text"
                    value={editForm.nameEn}
                    onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    หมวดหมู่ *
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as CategoryId })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="signature">เมนูซิกเนเจอร์ (Signature)</option>
                    <option value="drinks">เครื่องดื่ม (Drinks)</option>
                    <option value="bread">ขนมปัง (Bread &amp; Shokupan)</option>
                    <option value="snacks">ของทานเล่น (Snacks)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภทสินค้า</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'drink' | 'bakery' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="drink">เครื่องดื่ม (มีเลือกระดับความหวาน/น้ำแข็ง/นม)</option>
                    <option value="bakery">ขนมปัง / เบเกอรี่ (มีเลือกระดับการปิ้ง)</option>
                  </select>
                </div>
              </div>

              {/* Price & Discount Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ราคาปกติ (บาท) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ราคาโปรโมชั่น (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.discountPrice || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        discountPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="เว้นว่างถ้าไม่มี"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-amber-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เวลาเตรียม (นาที)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.preparationMinutes}
                    onChange={(e) => setEditForm({ ...editForm, preparationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  คำบรรยายความอร่อย
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b2416] hover:bg-[#2b180d] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD NEW MENU ITEM WITH IMAGE UPLOAD */}
      {/* ============================================================== */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">เพิ่มเมนูใหม่เข้าระบบ</h3>
                <p className="text-xs text-slate-500">กรอกข้อมูลและอัปโหลดรูปภาพเมนูจากเครื่อง</p>
              </div>
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMenuItem} className="space-y-4 text-xs">
              {/* Image Upload from Device */}
              <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e8dfd5] space-y-3">
                <span className="font-bold text-slate-800 block">รูปภาพของเมนู</span>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
                    <img
                      src={newMenuForm.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={addFileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFileUpload(file, false);
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#b45309]" />
                      <span>อัปโหลดรูปจากเครื่องของคุณ</span>
                    </button>
                    <span className="text-[11px] text-slate-500 block">
                      เลือกไฟล์รูปภาพจากมือถือหรือคอมพิวเตอร์ของคุณ
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    หรือใช้ Image URL:
                  </label>
                  <input
                    type="url"
                    value={newMenuForm.imageUrl}
                    onChange={(e) => setNewMenuForm({ ...newMenuForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อเมนู (ภาษาไทย) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMenuForm.name}
                    onChange={(e) => setNewMenuForm({ ...newMenuForm, name: e.target.value })}
                    placeholder="เช่น ชาเขียวมัทฉะลาเต้เย็น"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อภาษาอังกฤษ
                  </label>
                  <input
                    type="text"
                    value={newMenuForm.nameEn}
                    onChange={(e) => setNewMenuForm({ ...newMenuForm, nameEn: e.target.value })}
                    placeholder="เช่น Iced Matcha Green Tea Latte"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    หมวดหมู่ *
                  </label>
                  <select
                    value={newMenuForm.category}
                    onChange={(e) => setNewMenuForm({ ...newMenuForm, category: e.target.value as CategoryId })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="signature">เมนูซิกเนเจอร์ (Signature)</option>
                    <option value="drinks">เครื่องดื่ม (Drinks)</option>
                    <option value="bread">ขนมปัง (Bread &amp; Shokupan)</option>
                    <option value="snacks">ของทานเล่น (Snacks)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภท</label>
                  <select
                    value={newMenuForm.type}
                    onChange={(e) => setNewMenuForm({ ...newMenuForm, type: e.target.value as 'drink' | 'bakery' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="drink">เครื่องดื่ม (Drink)</option>
                    <option value="bakery">ขนมปัง / เบเกอรี่ / ของทานเล่น</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ราคาปกติ (บาท) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newMenuForm.price}
                    onChange={(e) => setNewMenuForm({ ...newMenuForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ราคาโปรโมชั่น (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMenuForm.discountPrice || ''}
                    onChange={(e) =>
                      setNewMenuForm({
                        ...newMenuForm,
                        discountPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="ถ้ามี"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เวลาเตรียม (นาที)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMenuForm.preparationMinutes}
                    onChange={(e) => setNewMenuForm({ ...newMenuForm, preparationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">คำบรรยายความอร่อย</label>
                <textarea
                  rows={2}
                  value={newMenuForm.description}
                  onChange={(e) => setNewMenuForm({ ...newMenuForm, description: e.target.value })}
                  placeholder="บอกเล่าจุดเด่น รสชาติ และวัตถุดิบ..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b2416] hover:bg-[#2b180d] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>บันทึกเมนูใหม่</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">ยืนยันการลบเมนู</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบเมนู <strong className="text-slate-900">&ldquo;{itemToDelete.name}&rdquo;</strong> ออกจากระบบ? การลบนี้จะทำให้เมนูไม่แสดงในหน้าร้านทันที
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: EDIT BANK QR CODE & ACCOUNT DETAILS */}
      {/* ============================================================== */}
      {editingBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">แก้ไขข้อมูลบัญชีธนาคาร &amp; QR Code</h3>
                <p className="text-xs text-slate-500">ปรับเปลี่ยนชื่อบัญชี เลขที่บัญชี หรืออัปโหลด QR Code ใหม่</p>
              </div>
              <button
                onClick={() => setEditingBank(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBankEdit} className="space-y-4 text-xs">
              {/* Image Preview & Upload from Device */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  รูปภาพ QR Code (อัปโหลดจากเครื่อง)
                </label>
                <div className="p-3 bg-[#faf7f2] rounded-xl border border-dashed border-slate-300 flex items-center gap-3">
                  <img
                    src={editingBank.qrImageUrl}
                    alt={editingBank.bankName}
                    className="w-20 h-20 object-contain rounded-lg border bg-white p-1 flex-shrink-0"
                  />
                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3b2416] hover:bg-[#28180e] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>เลือกไฟล์ภาพ QR จากเครื่อง</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              setEditingBank({ ...editingBank, qrImageUrl: dataUrl });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">รองรับ JPG, PNG, WebP ทุกขนาด</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อธนาคาร / ช่องทาง *
                </label>
                <input
                  type="text"
                  required
                  value={editingBank.bankName}
                  onChange={(e) => setEditingBank({ ...editingBank, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อบัญชี (Account Name) *
                </label>
                <input
                  type="text"
                  required
                  value={editingBank.accountName}
                  onChange={(e) => setEditingBank({ ...editingBank, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขที่บัญชี / หมายเลขพร้อมเพย์ (Account Number) *
                </label>
                <input
                  type="text"
                  required
                  value={editingBank.accountNumber}
                  onChange={(e) => setEditingBank({ ...editingBank, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBank(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b2416] hover:bg-[#2b180d] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: ADD NEW BANK QR */}
      {/* ============================================================== */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">เพิ่มบัญชีธนาคาร / QR Code ใหม่</h3>
                <p className="text-xs text-slate-500">กรอกข้อมูลบัญชีและอัปโหลดรูป QR Code สำหรับรับเงิน</p>
              </div>
              <button
                onClick={() => setShowAddBankModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewBank} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อธนาคาร / รูปแบบการชำระ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ธนาคารทหารไทยธนชาต (ttb touch)"
                  value={newBankForm.bankName || ''}
                  onChange={(e) => setNewBankForm({ ...newBankForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อบัญชีรับเงิน *
                </label>
                <input
                  type="text"
                  required
                  value={newBankForm.accountName || ''}
                  onChange={(e) => setNewBankForm({ ...newBankForm, accountName: e.target.value })}
                  placeholder="เช่น บจก. คาเฟอีน คาเฟ่"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขที่บัญชี *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 123-4-56789-0"
                  value={newBankForm.accountNumber || ''}
                  onChange={(e) => setNewBankForm({ ...newBankForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              {/* Upload QR Image */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  รูปภาพ QR Code (อัปโหลดจากเครื่อง)
                </label>
                <div className="p-3 bg-[#faf7f2] rounded-xl border border-dashed border-slate-300 flex items-center gap-3">
                  {newBankForm.qrImageUrl ? (
                    <img
                      src={newBankForm.qrImageUrl}
                      alt="Preview"
                      className="w-20 h-20 object-contain rounded-lg border bg-white p-1 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                      <QrCode className="w-8 h-8" />
                      <span className="text-[9px] mt-1">ยังไม่มีภาพ</span>
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3b2416] hover:bg-[#28180e] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>เลือกไฟล์ภาพ QR Code</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              setNewBankForm((prev) => ({ ...prev, qrImageUrl: dataUrl }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">หากไม่อัปโหลด ระบบจะสร้าง QR ตัวอย่างให้อัตโนมัติ</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b2416] hover:bg-[#2b180d] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>บันทึกบัญชีใหม่</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: ADD NEW LOYALTY MEMBER BY PHONE */}
      {/* ============================================================== */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">ลงทะเบียนสมาชิกตามเบอร์โทร</h3>
                <p className="text-xs text-slate-500">ผูกแต้มสะสมและสิทธิประโยชน์กับเบอร์โทรศัพท์ของลูกค้า</p>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์มือถือ *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="เช่น 089-123-4567"
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อลูกค้า *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณกมลวรรณ"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  แต้มสะสมเริ่มต้น (แต้มต้อนรับสมาชิกใหม่)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newMemberForm.points}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, points: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-amber-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b2416] hover:bg-[#2b180d] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึกสมาชิก</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 7: ADJUST MEMBER POINTS */}
      {/* ============================================================== */}
      {adjustPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">ปรับคะแนนสะสม</h3>
                <p className="text-xs text-slate-500">
                  {adjustPointsModal.name} ({adjustPointsModal.phone})
                </p>
              </div>
              <button
                onClick={() => setAdjustPointsModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjustPoints} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <span className="text-[11px] text-slate-500 block">แต้มปัจจุบัน</span>
                <span className="text-2xl font-black font-mono text-[#b45309]">
                  {adjustPointsModal.currentPoints} แต้ม
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  จำนวนแต้มที่ต้องการเพิ่ม / ลด (ใส่เครื่องหมายลบหากต้องการลด)
                </label>
                <input
                  type="number"
                  required
                  value={adjustPointsModal.amount}
                  onChange={(e) =>
                    setAdjustPointsModal({ ...adjustPointsModal, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[20, 50, 100, 200, -50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAdjustPointsModal({ ...adjustPointsModal, amount: val })}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>

              <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>แต้มหลังการปรับปรุง:</span>
                <strong className="text-sm font-mono font-bold text-emerald-700">
                  {Math.max(0, adjustPointsModal.currentPoints + adjustPointsModal.amount)} แต้ม
                </strong>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustPointsModal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3b2416] hover:bg-[#2b180d] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ยืนยันการปรับแต้ม</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
