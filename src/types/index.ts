export type CategoryId = 'all' | 'signature' | 'drinks' | 'bread' | 'snacks';

export interface Category {
  id: CategoryId;
  name: string;
  nameEn: string;
  icon: string;
}

export type SweetnessLevel = '0%' | '25%' | '50%' | '100%' | '125%';
export type IceLevel = 'ปกติ' | 'น้อย' | 'ไม่ใส่น้ำแข็ง' | 'ร้อน' | 'ปั่น (+15฿)';
export type MilkType = 'นมสดแท้ (Regular)' | 'นมโอ๊ต Oat Milk (+15฿)' | 'นมถั่วเหลือง Soy Milk (+10฿)' | 'นมอัลมอนด์ Almond (+15฿)';
export type ToastLevel = 'ปิ้งกรอบนอกนุ่มใน' | 'ปิ้งกรอบพิเศษ' | 'นึ่งนุ่มฟู' | 'ไม่ปิ้ง (ทานสด)';

export interface ToppingOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nameEn: string;
  category: CategoryId;
  price: number;
  description: string;
  imageUrl: string;
  isPopular?: boolean;
  isMonthlyPromo?: boolean;
  discountPrice?: number;
  inStock: boolean;
  calories?: number;
  preparationMinutes: number;
  type: 'drink' | 'bakery';
  allowSweetness?: boolean;
  allowIce?: boolean;
  allowMilk?: boolean;
  allowToast?: boolean;
}

export interface CartItemCustomization {
  sweetness: SweetnessLevel;
  ice: IceLevel;
  milk: MilkType;
  toast?: ToastLevel;
  toppings: ToppingOption[];
  notes?: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  customization: CartItemCustomization;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'takeaway' | 'dine-in' | 'delivery';
export type PaymentMethodType = 'promptpay' | 'mobile-banking' | 'credit-card' | 'truemoney' | 'cash';

export interface Order {
  id: string;
  queueNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  tableNumber?: string;
  pickupTime: string; // e.g., 'ทันที (10-15 นาที)' or '12:30 น.'
  items: CartItem[];
  subtotal: number;
  discount: number;
  pointsUsed: number;
  pointsEarned: number;
  netTotal: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'paid' | 'pending';
  status: OrderStatus;
  createdAt: string;
  estimatedReadyTime: string;
  reviewed?: boolean;
  rating?: number;
  feedback?: string;
}

export interface MemberProfile {
  id: string;
  name: string;
  phone: string;
  tier: 'Green' | 'Gold' | 'Platinum';
  points: number;
  totalSpent: number;
  ordersCount: number;
}

export interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  discountAmount: number;
  description: string;
  badge: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
  tasteScore: number;
  speedScore: number;
  serviceScore: number;
  comment: string;
  tags: string[];
  createdAt: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'raw' | 'ingredient' | 'packaging';
  quantity: number;
  unit: string;
  minimumThreshold: number;
  costPerUnit: number;
  lastRestocked: string;
}

export interface PromotionAnnouncement {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  description: string;
  code: string;
  discountValue: number;
  discountType: 'fixed' | 'percent';
  minOrder: number;
  validUntil: string;
  colorScheme: 'matcha' | 'amber' | 'rose';
}

export interface LineNotification {
  id: string;
  timestamp: string;
  title: string;
  body: string;
  orderId: string;
  type: 'order_received' | 'order_brewing' | 'order_ready' | 'order_completed' | 'promo';
  read: boolean;
}

export interface BankQrConfig {
  id: string;
  bankName: string;
  bankCode: string; // 'promptpay' | 'kbank' | 'scb' | 'ktb' | 'bbl' | 'ttb'
  accountName: string;
  accountNumber: string;
  qrImageUrl: string;
  isActive: boolean;
  color: string;
  updatedAt: string;
}

