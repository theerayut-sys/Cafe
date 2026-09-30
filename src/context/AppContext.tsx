import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  OrderType,
  StockItem,
  MemberProfile,
  RewardItem,
  Review,
  LineNotification,
  PromotionAnnouncement,
  BankQrConfig,
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_STOCK,
  INITIAL_MEMBER,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_PROMOTIONS,
  INITIAL_BANK_QRS,
  INITIAL_MEMBERS_MAP,
} from '../data/initialData';
import { sounds } from '../utils/audio';

interface AppContextType {
  // Storefront & Menu
  menuItems: MenuItem[];
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuItemStock: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Order & Tracking
  orders: Order[];
  createOrder: (orderPayload: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    tableNumber?: string;
    pickupTime: string;
    paymentMethod: Order['paymentMethod'];
    discount: number;
    pointsUsed: number;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  reorder: (pastOrder: Order) => void;
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  selectedOrderForReview: Order | null;
  setSelectedOrderForReview: (order: Order | null) => void;

  // Pickup Scheduling & Type
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  pickupSchedule: string;
  setPickupSchedule: (time: string) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;

  // Inventory / Stock
  stock: StockItem[];
  restockItem: (id: string, amount: number) => void;
  adjustStockQuantity: (id: string, newQuantity: number) => void;

  // Loyalty & Member
  member: MemberProfile;
  redeemReward: (reward: RewardItem) => boolean;
  pointsDiscount: number;
  setPointsDiscount: (amount: number) => void;
  pointsToUse: number;
  setPointsToUse: (pts: number) => void;
  activeMemberPhone: string;
  setActiveMemberPhone: (phone: string) => void;
  getMemberByPhone: (phone: string) => MemberProfile;
  membersMap: Record<string, MemberProfile>;
  updateMemberPoints: (phone: string, pointsDelta: number) => void;
  registerOrUpdateMember: (profile: { phone: string; name: string; points: number }) => void;

  // Bank QR Configs (Upload from Admin Backoffice)
  bankQrs: BankQrConfig[];
  updateBankQr: (config: BankQrConfig) => void;
  addBankQr: (config: BankQrConfig) => void;
  deleteBankQr: (id: string) => void;
  resetBankQrs: () => void;

  // Reviews
  reviews: Review[];
  addReview: (orderId: string, rating: number, taste: number, speed: number, service: number, comment: string, tags: string[]) => void;

  // Promotions & Announcements
  promotions: PromotionAnnouncement[];
  appliedPromo: PromotionAnnouncement | null;
  applyPromo: (promo: PromotionAnnouncement | null) => void;

  // LINE & Notification simulator
  notifications: LineNotification[];
  linePushToast: LineNotification | null;
  dismissLineToast: () => void;

  // View switch (Customer Storefront vs Admin Backoffice) & Admin Auth
  currentView: 'customer' | 'admin';
  setCurrentView: (view: 'customer' | 'admin') => void;
  isAdminLoggedIn: boolean;
  adminLogin: (user: string, pass: string) => boolean;
  adminLogout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;

  // Modals state helper
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isMemberModalOpen: boolean;
  setIsMemberModalOpen: (open: boolean) => void;
  isPromoModalOpen: boolean;
  setIsPromoModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MENU: 'cham_cafe_menu',
  ORDERS: 'cham_cafe_orders',
  STOCK: 'cham_cafe_stock',
  MEMBER: 'cham_cafe_member',
  REVIEWS: 'cham_cafe_reviews',
  CART: 'cham_cafe_cart',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Menu items with persistence
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Stock
  const [stock, setStock] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOCK);
      return saved ? JSON.parse(saved) : INITIAL_STOCK;
    } catch {
      return INITIAL_STOCK;
    }
  });

  // Phone-based loyalty members map
  const [membersMap, setMembersMap] = useState<Record<string, MemberProfile>>(() => {
    try {
      const saved = localStorage.getItem('caffeine_members_map');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS_MAP;
    } catch {
      return INITIAL_MEMBERS_MAP;
    }
  });

  const [activeMemberPhone, setActiveMemberPhone] = useState<string>('081-987-6543');

  // Active member profile derived from active phone
  const member = membersMap[activeMemberPhone] || {
    id: 'MEM-GUEST',
    name: 'คุณลูกค้าทั่วไป',
    phone: activeMemberPhone,
    tier: 'Green',
    points: 0,
    totalSpent: 0,
    ordersCount: 0,
  };

  const getMemberByPhone = (phone: string): MemberProfile => {
    const cleanPhone = phone.trim();
    if (membersMap[cleanPhone]) {
      return membersMap[cleanPhone];
    }
    return {
      id: 'MEM-' + Math.floor(1000 + Math.random() * 9000),
      name: 'คุณลูกค้า (' + cleanPhone + ')',
      phone: cleanPhone,
      tier: 'Green',
      points: 0,
      totalSpent: 0,
      ordersCount: 0,
    };
  };

  // Bank QR Codes uploaded by admin
  const [bankQrs, setBankQrs] = useState<BankQrConfig[]>(() => {
    try {
      const saved = localStorage.getItem('caffeine_bank_qrs');
      return saved ? JSON.parse(saved) : INITIAL_BANK_QRS;
    } catch {
      return INITIAL_BANK_QRS;
    }
  });

  const updateBankQr = (updated: BankQrConfig) => {
    setBankQrs((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  };

  const addBankQr = (config: BankQrConfig) => {
    setBankQrs((prev) => [...prev, config]);
  };

  const deleteBankQr = (id: string) => {
    setBankQrs((prev) => prev.filter((q) => q.id !== id));
  };

  const resetBankQrs = () => {
    setBankQrs(INITIAL_BANK_QRS);
  };

  const updateMemberPoints = (phone: string, pointsDelta: number) => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) return;
    setMembersMap((prev) => {
      const existing = prev[cleanPhone] || {
        id: 'MEM-' + Math.floor(1000 + Math.random() * 9000),
        name: `ลูกค้า (${cleanPhone})`,
        phone: cleanPhone,
        tier: 'Green',
        points: 0,
        totalSpent: 0,
        ordersCount: 0,
      };
      const newPoints = Math.max(0, existing.points + pointsDelta);
      let newTier = existing.tier;
      if (existing.totalSpent >= 5000) newTier = 'Platinum';
      else if (existing.totalSpent >= 2000) newTier = 'Gold';

      return {
        ...prev,
        [cleanPhone]: {
          ...existing,
          points: newPoints,
          tier: newTier,
        },
      };
    });
  };

  const registerOrUpdateMember = (profile: { phone: string; name: string; points: number }) => {
    const cleanPhone = profile.phone.trim();
    if (!cleanPhone) return;
    setMembersMap((prev) => {
      const existing = prev[cleanPhone];
      return {
        ...prev,
        [cleanPhone]: {
          id: existing?.id || 'MEM-' + Math.floor(1000 + Math.random() * 9000),
          name: profile.name || existing?.name || `ลูกค้า (${cleanPhone})`,
          phone: cleanPhone,
          tier: profile.points >= 1500 ? 'Platinum' : profile.points >= 500 ? 'Gold' : 'Green',
          points: profile.points,
          totalSpent: existing?.totalSpent || 0,
          ordersCount: existing?.ordersCount || 0,
        },
      };
    });
  };

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // View state & Admin Auth
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('cham_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Active tracking
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);

  // Order pickup config
  const [orderType, setOrderType] = useState<OrderType>('takeaway');
  const [pickupSchedule, setPickupSchedule] = useState<string>('ทันที (10-15 นาที)');
  const [tableNumber, setTableNumber] = useState<string>('โต๊ะ 01');

  // Promos & discounts
  const [promotions] = useState<PromotionAnnouncement[]>(INITIAL_PROMOTIONS);
  const [appliedPromo, setAppliedPromo] = useState<PromotionAnnouncement | null>(null);
  const [pointsDiscount, setPointsDiscount] = useState<number>(0);
  const [pointsToUse, setPointsToUse] = useState<number>(0);

  // Notifications & LINE push simulation
  const [notifications, setNotifications] = useState<LineNotification[]>([
    {
      id: 'notif-init-1',
      timestamp: '10:15 น.',
      title: 'Caffeine Official LINE: รับคำสั่งซื้อ #C-04',
      body: 'ร้าน Caffeine Cafe กำลังเริ่มชงเครื่องดื่มและอบขนมให้คุณแล้วค่ะ',
      orderId: 'ORD-1092',
      type: 'order_brewing',
      read: false,
    },
  ]);
  const [linePushToast, setLinePushToast] = useState<LineNotification | null>(null);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem('caffeine_members_map', JSON.stringify(membersMap));
  }, [membersMap]);

  useEffect(() => {
    localStorage.setItem('caffeine_bank_qrs', JSON.stringify(bankQrs));
  }, [bankQrs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Keep activeTrackingOrder in sync with orders list
  useEffect(() => {
    if (activeTrackingOrder) {
      const found = orders.find((o) => o.id === activeTrackingOrder.id);
      if (found) {
        setActiveTrackingOrder(found);
      }
    }
  }, [orders]);

  // Cart operations
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // Check if identical item with identical customization already exists
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.menuItem.id === item.menuItem.id &&
          ci.customization.sweetness === item.customization.sweetness &&
          ci.customization.ice === item.customization.ice &&
          ci.customization.milk === item.customization.milk &&
          ci.customization.toast === item.customization.toast &&
          JSON.stringify(ci.customization.toppings) === JSON.stringify(item.customization.toppings) &&
          ci.customization.notes === item.customization.notes
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + item.quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: updated[existingIdx].unitPrice * newQty,
        };
        return updated;
      }
      return [item, ...prev];
    });
    sounds.playNotificationPop();
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity, totalPrice: i.unitPrice * quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setPointsDiscount(0);
    setPointsToUse(0);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Push simulated LINE message
  const triggerLinePush = (notif: Omit<LineNotification, 'id' | 'timestamp' | 'read'>) => {
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const newNotif: LineNotification = {
      id: 'notif-' + Date.now(),
      timestamp: timeStr,
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setLinePushToast(newNotif);

    if (notif.type === 'order_ready') {
      sounds.playOrderReadyChime();
    } else {
      sounds.playNotificationPop();
    }
  };

  const dismissLineToast = () => setLinePushToast(null);

  // Orders operations
  const createOrder = ({
    customerName,
    customerPhone,
    orderType: chosenType,
    tableNumber: chosenTable,
    pickupTime,
    paymentMethod,
    discount,
    pointsUsed,
  }: {
    customerName: string;
    customerPhone: string;
    orderType: OrderType;
    tableNumber?: string;
    pickupTime: string;
    paymentMethod: Order['paymentMethod'];
    discount: number;
    pointsUsed: number;
  }): Order => {
    const subtotal = cartTotal;
    const netTotal = Math.max(0, subtotal - discount);
    const pointsEarned = Math.floor(netTotal / 10); // 1 pt per 10 THB
    const queueSeq = orders.length + 1;
    const queueNumber = 'C-' + String(queueSeq).padStart(2, '0');
    const orderId = 'ORD-' + (1092 + queueSeq);
    const now = new Date();
    const createdAt = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const readyMin = new Date(now.getTime() + 15 * 60000);
    const estimatedReadyTime = readyMin.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

    const newOrder: Order = {
      id: orderId,
      queueNumber,
      customerName: customerName || member.name,
      customerPhone: customerPhone || member.phone,
      orderType: chosenType,
      tableNumber: chosenType === 'dine-in' ? chosenTable || 'โต๊ะ 01' : undefined,
      pickupTime,
      items: [...cart],
      subtotal,
      discount,
      pointsUsed,
      pointsEarned,
      netTotal,
      paymentMethod,
      paymentStatus: 'paid',
      status: 'received',
      createdAt,
      estimatedReadyTime,
    };

    setOrders((prev) => [newOrder, ...prev]);

    const targetPhone = (customerPhone || activeMemberPhone).trim();

    // Update phone-based member loyalty points
    setMembersMap((prevMap) => {
      const existing = prevMap[targetPhone] || {
        id: 'MEM-' + Math.floor(1000 + Math.random() * 9000),
        name: customerName || `ลูกค้าเบอร์ ${targetPhone}`,
        phone: targetPhone,
        tier: 'Green',
        points: 0,
        totalSpent: 0,
        ordersCount: 0,
      };

      const remainingPoints = Math.max(0, existing.points - pointsUsed + pointsEarned);
      const newTotalSpent = existing.totalSpent + netTotal;
      let newTier: 'Green' | 'Gold' | 'Platinum' = existing.tier;
      if (newTotalSpent >= 5000) newTier = 'Platinum';
      else if (newTotalSpent >= 2000) newTier = 'Gold';

      return {
        ...prevMap,
        [targetPhone]: {
          ...existing,
          name: customerName || existing.name,
          points: remainingPoints,
          totalSpent: newTotalSpent,
          ordersCount: existing.ordersCount + 1,
          tier: newTier,
        },
      };
    });

    // Deduct stock for ordered items
    setStock((prevStock) => {
      const updated = [...prevStock];
      cart.forEach((item) => {
        if (item.menuItem.type === 'drink') {
          const cupIndex = updated.findIndex((s) => s.id === 'stk-7');
          if (cupIndex > -1 && updated[cupIndex].quantity > 0) {
            updated[cupIndex] = {
              ...updated[cupIndex],
              quantity: Math.max(0, updated[cupIndex].quantity - item.quantity),
            };
          }
        }
        if (item.menuItem.category === 'bread' || item.menuItem.id === 'kaya-shokupan-toast') {
          const breadIndex = updated.findIndex((s) => s.id === 'stk-4');
          if (breadIndex > -1 && updated[breadIndex].quantity > 0) {
            updated[breadIndex] = {
              ...updated[breadIndex],
              quantity: Math.max(0, Number((updated[breadIndex].quantity - item.quantity * 0.1).toFixed(1))),
            };
          }
        }
      });
      return updated;
    });

    // Sound effect and confetti
    sounds.playSuccessPayment();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#047857', '#d97706', '#b45309'],
      });
    } catch {
      // ignore
    }

    // LINE Notification simulation
    triggerLinePush({
      title: `Caffeine Official: ยืนยันคำสั่งซื้อคิว ${queueNumber}`,
      body: `ได้รับชำระเงิน ${netTotal}฿ เรียบร้อย! สะสมแต้มเข้าเบอร์ ${targetPhone} (+${pointsEarned} แต้ม) บาริสต้ากำลังจัดเตรียมเมนู รับได้เวลาประมาณ ${estimatedReadyTime}`,
      orderId,
      type: 'order_received',
    });

    clearCart();
    setActiveTrackingOrder(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updated = { ...o, status: nextStatus };

        // Send LINE push notification based on state change
        if (nextStatus === 'preparing') {
          triggerLinePush({
            title: `Caffeine Official: เริ่มเตรียมออเดอร์คิว ${o.queueNumber}`,
            body: `บาริสต้ากำลังชงเครื่องดื่มและอบขนมร้อนๆ ให้คุณอย่างพิถีพิถันค่ะ`,
            orderId: o.id,
            type: 'order_brewing',
          });
        } else if (nextStatus === 'ready') {
          triggerLinePush({
            title: `Caffeine Official: คิว ${o.queueNumber} สินค้าพร้อมรับแล้ว! ✨`,
            body: `กรุณาแสดงรหัสคิว ${o.queueNumber} ที่เคาน์เตอร์รับสินค้าเพื่อรับเครื่องดื่มและขนมปังร้อนๆ ค่ะ`,
            orderId: o.id,
            type: 'order_ready',
          });
        } else if (nextStatus === 'completed') {
          triggerLinePush({
            title: `Caffeine Official: ขอบคุณที่ใช้บริการคิว ${o.queueNumber} ❤️`,
            body: `สะสมแต้มเข้าเบอร์ ${o.customerPhone} (+${o.pointsEarned} แต้ม)! อย่าลืมรีวิวความพึงพอใจเพื่อรับแต้มพิเศษนะคะ`,
            orderId: o.id,
            type: 'order_completed',
          });
        }

        return updated;
      })
    );
  };

  const reorder = (pastOrder: Order) => {
    pastOrder.items.forEach((item) => {
      addToCart({
        ...item,
        cartItemId: 'reorder-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      });
    });
    setIsCartOpen(true);
    sounds.playNotificationPop();
  };

  // Menu updates
  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const addMenuItem = (newItemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...newItemData,
      id: 'menu-' + Date.now(),
    };
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleMenuItemStock = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item))
    );
  };

  // Admin authentication (User: WMP9999, Password: !Tt6130)
  const adminLogin = (user: string, pass: string): boolean => {
    if (user.trim() === 'WMP9999' && pass === '!Tt6130') {
      setIsAdminLoggedIn(true);
      try {
        sessionStorage.setItem('cham_admin_auth', 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentView('customer');
    try {
      sessionStorage.removeItem('cham_admin_auth');
    } catch {
      // ignore
    }
  };

  // Stock
  const restockItem = (id: string, amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    setStock((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + amount, lastRestocked: today } : item
      )
    );
  };

  const adjustStockQuantity = (id: string, newQuantity: number) => {
    setStock((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item))
    );
  };

  // Rewards redemption
  const redeemReward = (reward: RewardItem): boolean => {
    if (member.points < reward.pointsCost) return false;
    setPointsDiscount(reward.discountAmount);
    setPointsToUse(reward.pointsCost);
    sounds.playNotificationPop();
    return true;
  };

  // Reviews
  const addReview = (
    orderId: string,
    rating: number,
    tasteScore: number,
    speedScore: number,
    serviceScore: number,
    comment: string,
    tags: string[]
  ) => {
    const newReview: Review = {
      id: 'rev-' + Date.now(),
      orderId,
      customerName: member.name,
      rating,
      tasteScore,
      speedScore,
      serviceScore,
      comment,
      tags,
      createdAt: 'เมื่อสักครู่',
    };
    setReviews((prev) => [newReview, ...prev]);

    // Mark order as reviewed
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, reviewed: true, rating, feedback: comment } : o))
    );

    // Give bonus points for reviewing to customer phone!
    if (activeMemberPhone) {
      updateMemberPoints(activeMemberPhone, 20); // +20 bonus points
    }

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const applyPromo = (promo: PromotionAnnouncement | null) => {
    setAppliedPromo(promo);
    if (promo) sounds.playNotificationPop();
  };

  return (
    <AppContext.Provider
      value={{
        menuItems,
        updateMenuItem,
        addMenuItem,
        deleteMenuItem,
        toggleMenuItemStock,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        createOrder,
        updateOrderStatus,
        reorder,
        activeTrackingOrder,
        setActiveTrackingOrder,
        selectedOrderForReview,
        setSelectedOrderForReview,
        orderType,
        setOrderType,
        pickupSchedule,
        setPickupSchedule,
        tableNumber,
        setTableNumber,
        stock,
        restockItem,
        adjustStockQuantity,
        member,
        redeemReward,
        pointsDiscount,
        setPointsDiscount,
        pointsToUse,
        setPointsToUse,
        activeMemberPhone,
        setActiveMemberPhone,
        getMemberByPhone,
        membersMap,
        updateMemberPoints,
        registerOrUpdateMember,
        bankQrs,
        updateBankQr,
        addBankQr,
        deleteBankQr,
        resetBankQrs,
        reviews,
        addReview,
        promotions,
        appliedPromo,
        applyPromo,
        notifications,
        linePushToast,
        dismissLineToast,
        currentView,
        setCurrentView,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isCartOpen,
        setIsCartOpen,
        isMemberModalOpen,
        setIsMemberModalOpen,
        isPromoModalOpen,
        setIsPromoModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
