import React, { useState } from 'react';
import { X, QrCode, CreditCard, Smartphone, Banknote, ShieldCheck, CheckCircle2, Copy, Award, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethodType } from '../types';

interface CheckoutModalProps {
  netTotal: number;
  discount: number;
  pointsUsed: number;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  netTotal,
  discount,
  pointsUsed,
  onClose,
}) => {
  const {
    member,
    activeMemberPhone,
    setActiveMemberPhone,
    getMemberByPhone,
    orderType,
    pickupSchedule,
    tableNumber,
    createOrder,
    setIsCartOpen,
    bankQrs,
  } = useApp();

  const [customerName, setCustomerName] = useState(member.name);
  const [customerPhone, setCustomerPhone] = useState(activeMemberPhone || member.phone || '081-987-6543');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('promptpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Bank selection for Mobile Banking (from admin-configured banks)
  const mobileBanks = bankQrs.filter((b) => b.bankCode !== 'promptpay' && b.isActive);
  const [selectedBankId, setSelectedBankId] = useState<string>(mobileBanks[0]?.id || 'bqr-kbank');

  // Card form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9821');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvc, setCardCvc] = useState('888');

  const refNumber = 'CF-' + Math.floor(10000000 + Math.random() * 90000000);
  const pointsToEarn = Math.floor(netTotal / 10);

  // Real-time phone-based points lookup
  const currentMemberForPhone = getMemberByPhone(customerPhone);

  // PromptPay QR config from admin
  const promptPayConfig = bankQrs.find((b) => b.bankCode === 'promptpay') || {
    bankName: 'พร้อมเพย์ (PromptPay QR)',
    bankCode: 'promptpay',
    accountName: 'บจก. คาเฟอีน คาเฟ่ (Caffeine Cafe)',
    accountNumber: '081-987-6543 (เบอร์ร้าน)',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PROMPTPAY-0819876543-CAFFEINECAFE',
    isActive: true,
  };

  const selectedBankConfig = bankQrs.find((b) => b.id === selectedBankId) || mobileBanks[0];

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(refNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyAcc = (accNo: string) => {
    navigator.clipboard?.writeText(accNo.replace(/[^0-9]/g, ''));
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    const cleanPhone = customerPhone.trim() || '081-987-6543';
    setActiveMemberPhone(cleanPhone);

    setTimeout(() => {
      createOrder({
        customerName: customerName.trim() || 'ลูกค้าทั่วไป',
        customerPhone: cleanPhone,
        orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        pickupTime: pickupSchedule,
        paymentMethod,
        discount,
        pointsUsed,
      });
      setIsProcessing(false);
      onClose();
      setIsCartOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e5dcd3] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#e5dcd3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f4efe8] flex items-center justify-center text-[#3b2416]">
              <ShieldCheck className="w-5 h-5 text-[#047857]" />
            </div>
            <div>
              <h3 className="font-bold text-[#2b2118] text-base">ชำระเงินออนไลน์และยืนยันออเดอร์</h3>
              <p className="text-xs text-[#786b5e]">ยอดชำระสุทธิ {netTotal} บาท · Caffeine Cafe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="ปิดหน้าต่างชำระเงิน"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Customer contact details & Phone-based point collection */}
          <div className="bg-white rounded-xl p-3.5 border border-[#e8dfd5] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#2b2118] uppercase tracking-wider">
                ข้อมูลผู้สั่งซื้อและการสะสมแต้ม
              </h4>
              <span className="text-[11px] font-semibold text-[#b45309] flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>สะสมแต้มจากเบอร์โทรศัพท์</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  ชื่อผู้รับสินค้า
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#d8cfc4] rounded-lg text-xs font-medium text-[#2b2118] focus:outline-none focus:ring-1 focus:ring-[#3b2416]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  เบอร์โทรศัพท์มือถือ (ใช้สะสมแต้มอัตโนมัติ) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="เช่น 081-987-6543"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#b45309] rounded-lg text-xs font-bold text-[#2b2118] focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                />
              </div>
            </div>

            {/* Real-time points info box */}
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[#78350f]">
                  เบอร์ {customerPhone}: มีแต้มสะสม{' '}
                  <strong className="text-[#b45309]">{currentMemberForPhone.points}</strong> แต้ม
                </span>
              </div>
              <span className="text-emerald-700 font-bold">
                +รับเพิ่ม {pointsToEarn} แต้ม
              </span>
            </div>
          </div>

          {/* Payment Methods Selection */}
          <div>
            <h4 className="text-xs font-bold text-[#2b2118] uppercase tracking-wider mb-2.5">
              เลือกช่องทางชำระเงิน
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('promptpay')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'promptpay'
                    ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                    : 'bg-white text-[#2b2118] border-[#e8dfd5] hover:border-slate-400'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1.5" />
                <div className="text-xs font-bold">พร้อมเพย์ QR</div>
                <div className={`text-[10px] ${paymentMethod === 'promptpay' ? 'text-[#d8c3b0]' : 'text-slate-500'}`}>
                  สแกนจ่ายได้ทุกธนาคาร
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('mobile-banking')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'mobile-banking'
                    ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                    : 'bg-white text-[#2b2118] border-[#e8dfd5] hover:border-slate-400'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1.5" />
                <div className="text-xs font-bold">โมบายแบงกิ้ง QR</div>
                <div className={`text-[10px] ${paymentMethod === 'mobile-banking' ? 'text-[#d8c3b0]' : 'text-slate-500'}`}>
                  เลือกธนาคาร &amp; สแกน
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit-card')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'credit-card'
                    ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                    : 'bg-white text-[#2b2118] border-[#e8dfd5] hover:border-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1.5" />
                <div className="text-xs font-bold">บัตรเครดิต/เดบิต</div>
                <div className={`text-[10px] ${paymentMethod === 'credit-card' ? 'text-[#d8c3b0]' : 'text-slate-500'}`}>
                  Visa, Mastercard, JCB
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('truemoney')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'truemoney'
                    ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                    : 'bg-white text-[#2b2118] border-[#e8dfd5] hover:border-slate-400'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1.5 text-amber-500" />
                <div className="text-xs font-bold">TrueMoney / LINE Pay</div>
                <div className={`text-[10px] ${paymentMethod === 'truemoney' ? 'text-[#d8c3b0]' : 'text-slate-500'}`}>
                  E-Wallet สะดวกเร็ว
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-[#3b2416] text-white border-[#3b2416] shadow-sm'
                    : 'bg-white text-[#2b2118] border-[#e8dfd5] hover:border-slate-400'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1.5" />
                <div className="text-xs font-bold">เงินสด / เคาน์เตอร์</div>
                <div className={`text-[10px] ${paymentMethod === 'cash' ? 'text-[#d8c3b0]' : 'text-slate-500'}`}>
                  ชำระตอนรับสินค้า
                </div>
              </button>
            </div>
          </div>

          {/* Payment Method Details Panel */}
          <div className="p-4 bg-white rounded-xl border border-[#e8dfd5]">
            {/* 1. PromptPay with Admin Uploaded QR Code */}
            {paymentMethod === 'promptpay' && (
              <div className="flex flex-col items-center text-center">
                <div className="bg-[#113566] text-white text-[11px] font-bold px-3 py-1 rounded-md tracking-wider mb-3">
                  THAI QR PAYMENT · PROMPTPAY
                </div>

                {/* Display QR Code uploaded by Admin */}
                <div className="p-3 bg-white border-2 border-slate-800 rounded-xl shadow-md relative group">
                  <img
                    src={promptPayConfig.qrImageUrl}
                    alt="PromptPay QR Code"
                    className="w-48 h-48 object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1">
                    <span>QR Code บัญชีทางการของร้าน</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-xs text-slate-500">ชื่อบัญชี: </span>
                  <span className="text-xs font-bold text-slate-800">
                    {promptPayConfig.accountName}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mt-0.5 font-medium">
                  เลขพร้อมเพย์: <strong className="font-mono">{promptPayConfig.accountNumber}</strong>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                    Ref: {refNumber}
                  </span>
                  <button
                    onClick={handleCopyRef}
                    className="text-xs text-[#b45309] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedRef ? 'คัดลอกแล้ว' : 'คัดลอก Ref'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  เปิดแอปธนาคารใดก็ได้ แล้วสแกน QR CODE ด้านบนเพื่อชำระเงิน {netTotal} บาท
                </p>
              </div>
            )}

            {/* 2. Mobile Banking with Bank Selector & Admin Uploaded QR Codes */}
            {paymentMethod === 'mobile-banking' && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-700 block">
                  เลือกธนาคารเพื่อแสดง QR Code ชำระเงิน:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {mobileBanks.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold ${
                        selectedBankId === bank.id
                          ? 'border-2 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                      style={{
                        backgroundColor: selectedBankId === bank.id ? bank.color : undefined,
                        borderColor: selectedBankId === bank.id ? bank.color : undefined,
                      }}
                    >
                      <div className="truncate">{bank.bankName.split(' ')[0]}</div>
                      <div className="text-[10px] font-normal opacity-90 truncate">
                        {bank.bankName.split('(')[1]?.replace(')', '') || ''}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Display Chosen Bank's QR Code & Details */}
                {selectedBankConfig && (
                  <div className="p-4 bg-[#faf7f2] rounded-xl border border-[#e8dfd5] flex flex-col items-center text-center">
                    <div
                      className="text-white text-[11px] font-bold px-3 py-1 rounded-md mb-2.5 shadow-xs"
                      style={{ backgroundColor: selectedBankConfig.color }}
                    >
                      {selectedBankConfig.bankName}
                    </div>

                    <div className="p-2.5 bg-white border border-slate-300 rounded-xl shadow-xs">
                      <img
                        src={selectedBankConfig.qrImageUrl}
                        alt={selectedBankConfig.bankName}
                        className="w-44 h-44 object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="mt-3 text-xs">
                      <div className="font-bold text-slate-900">
                        {selectedBankConfig.accountName}
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mt-1 font-mono font-semibold text-slate-700">
                        <span>เลขที่บัญชี: {selectedBankConfig.accountNumber}</span>
                        <button
                          onClick={() => handleCopyAcc(selectedBankConfig.accountNumber)}
                          className="text-[#b45309] hover:underline flex items-center gap-0.5 text-[11px]"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedAcc ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'credit-card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    หมายเลขบัตรเครดิต / เดบิต
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#d8cfc4] rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      วันหมดอายุ
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#d8cfc4] rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      รหัส CVV
                    </label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#d8cfc4] rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'truemoney' && (
              <div className="text-center py-3">
                <div className="text-xs font-bold text-slate-800">
                  ชำระผ่าน TrueMoney Wallet หรือ Rabbit LINE Pay
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ระบบจะทำการหักเงินจากยอดเงินคงเหลือในกระเป๋า E-Wallet เบอร์ {customerPhone}
                </p>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="text-center py-3">
                <div className="text-xs font-bold text-slate-800">
                  ชำระเงินสดหรือบัตรที่เคาน์เตอร์
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  เมื่อระบบเตรียมสินค้าเสร็จ สามารถชำระเงินสดที่บาร์รับสินค้าสาขา Wat Maha Phruettharam ได้ทันที
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer & Submit */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#e5dcd3] flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-500">ยอดชำระทั้งหมด</div>
            <div className="text-lg font-bold text-[#3b2416] tabular-nums font-mono">
              {netTotal} บาท
            </div>
          </div>

          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-sm text-white bg-[#047857] hover:bg-[#065f46] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {isProcessing ? (
              <span>กำลังตรวจสอบการชำระเงิน...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันการชำระเงิน &amp; ส่งออเดอร์</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
