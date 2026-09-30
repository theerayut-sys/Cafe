import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  PlusSquare,
  QrCode,
  Copy,
  Check,
  Sparkles,
  Zap,
  WifiOff,
  Bell,
  Monitor,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'auto' | 'ios' | 'android' | 'desktop'>('auto');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : 'https://caffeine-cafe.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    currentAppUrl
  )}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentAppUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    } else if (isIOS) {
      setActiveTab('ios');
    } else if (isAndroid) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e5dcd3] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2c1d11] to-[#3d2717] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#b45309] text-white flex items-center justify-center shadow-inner">
              <Download className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">ดาวน์โหลดและติดตั้งแอป</h3>
              <p className="text-xs text-[#d8c3b0]">Caffeine Cafe Web App (PWA)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Hero App Showcase Banner */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e8dfd5] flex items-center gap-4 shadow-xs">
            <img
              src="/icon.svg"
              alt="Caffeine Cafe App Icon"
              className="w-16 h-16 rounded-2xl shadow-md flex-shrink-0 bg-[#3b2416] p-1.5 border border-[#5a3a24]"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-[#2b2118] truncate">
                  Caffeine Cafe
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  PWA App
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                สั่งเครื่องดื่ม ชำระเงิน และสะสมแต้มผ่านมือถือได้ทันที
              </p>

              {/* Install Trigger Button */}
              <div className="mt-3">
                {isInstalled ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ติดตั้งลงในเครื่องนี้แล้ว</span>
                  </div>
                ) : (
                  <button
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#3b2416] hover:bg-[#25170d] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>
                      {isInstallable
                        ? 'ติดตั้งแอปทันที (Install Now)'
                        : isIOS
                        ? 'วิธีติดตั้งบน iPhone / iPad'
                        : isAndroid
                        ? 'วิธีติดตั้งบน Android'
                        : 'วิธีติดตั้งลงเครื่อง'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-white rounded-xl border border-[#e8dfd5] flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block text-[11px]">เปิดเร็ว โหลดไว</strong>
                <span className="text-[10px] text-slate-500">ทำงานลื่นไหลเหมือนแอปแท้</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#e8dfd5] flex items-start gap-2.5">
              <WifiOff className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block text-[11px]">เปิดดูเมนูออฟไลน์</strong>
                <span className="text-[10px] text-slate-500">บันทึกข้อมูลไว้ในเครื่อง</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#e8dfd5] flex items-start gap-2.5">
              <Bell className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block text-[11px]">แจ้งเตือนสถานะคิว</strong>
                <span className="text-[10px] text-slate-500">รู้ทันทีเมื่อเครื่องดื่มพร้อมรับ</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#e8dfd5] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block text-[11px]">ไม่เปลืองเมมโมรี่</strong>
                <span className="text-[10px] text-slate-500">ขนาดเบาเพียงไม่กี่ MB</span>
              </div>
            </div>
          </div>

          {/* QR Code Scan on Mobile Section */}
          <div className="bg-white rounded-2xl p-4 border border-[#e8dfd5] text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#2b2118]">
              <QrCode className="w-4 h-4 text-[#b45309]" />
              <span>สแกน QR Code ด้วยมือถือเพื่อเปิดและติดตั้งแอป</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="p-2 bg-[#faf7f2] border-2 border-slate-800 rounded-xl shadow-xs">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for App Install"
                  className="w-32 h-32 object-contain rounded-md"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-left text-xs space-y-2 max-w-xs">
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  ใช้กล้องมือถือ (iPhone หรือ Android) สแกน QR Code เพื่อเปิดเว็บแอปนี้บนมือถือ แล้วกดเพิ่มไปยังหน้าจอหลักได้ทันที
                </p>
                <button
                  onClick={handleCopyLink}
                  className="w-full py-1.5 px-3 bg-[#faf7f2] hover:bg-[#ede5dc] border border-[#d8cfc4] rounded-lg text-slate-700 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'คัดลอกลิงก์สำเร็จแล้ว' : 'คัดลอกลิงก์แอป (Copy URL)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Installation Instructions by Platform */}
          <div className="bg-white rounded-2xl border border-[#e8dfd5] overflow-hidden">
            <div className="flex border-b border-[#e8dfd5] bg-[#faf7f2] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('auto')}
                className={`flex-1 py-2.5 px-3 text-center transition-all ${
                  activeTab === 'auto'
                    ? 'bg-white text-[#3b2416] border-b-2 border-[#3b2416] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                อัตโนมัติ
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2.5 px-3 text-center transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'ios'
                    ? 'bg-white text-[#3b2416] border-b-2 border-[#3b2416] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iOS (iPhone/iPad)</span>
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2.5 px-3 text-center transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'android'
                    ? 'bg-white text-[#3b2416] border-b-2 border-[#3b2416] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Android</span>
              </button>
              <button
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 py-2.5 px-3 text-center transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'desktop'
                    ? 'bg-white text-[#3b2416] border-b-2 border-[#3b2416] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-blue-600" />
                <span>คอมพิวเตอร์</span>
              </button>
            </div>

            <div className="p-4 text-xs space-y-3">
              {activeTab === 'auto' && (
                <div className="space-y-2">
                  <p className="text-slate-700 leading-relaxed">
                    ระบบรองรับการติดตั้งลงในเครื่องของคุณโดยตรง (Progressive Web Application):
                  </p>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    <li>หากใช้ <strong>Chrome / Edge บนคอมพิวเตอร์หรือ Android</strong> สามารถคลิกปุ่ม <strong>&ldquo;ติดตั้งแอปทันที&rdquo;</strong> ด้านบนได้เลย</li>
                    <li>หากใช้ <strong>Safari บน iPhone / iPad</strong> สามารถดูคำแนะนำในแท็บ iOS เพื่อเพิ่มลงหน้าจอโฮมใน 2 คลิก</li>
                  </ul>
                </div>
              )}

              {activeTab === 'ios' && (
                <div className="space-y-2.5">
                  <h5 className="font-bold text-[#2b2118]">ขั้นตอนการติดตั้งบน iPhone / iPad (Safari):</h5>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex items-start gap-2.5 p-2 bg-[#faf7f2] rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-[#3b2416] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        เปิดเว็บไซต์นี้ผ่านแอป <strong>Safari</strong> แล้วแตะปุ่ม <strong>แชร์ (Share)</strong>{' '}
                        <Share2 className="w-3.5 h-3.5 inline text-blue-600" /> ที่แถบเมนูด้านล่าง
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 bg-[#faf7f2] rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-[#3b2416] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        เลื่อนลงมาแล้วแตะเลือก <strong>&ldquo;เพิ่มไปยังหน้าจอโฮม&rdquo; (Add to Home Screen)</strong>{' '}
                        <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 bg-[#faf7f2] rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-[#3b2416] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        แตะปุ่ม <strong>&ldquo;เพิ่ม&rdquo; (Add)</strong> ที่มุมขวาบน จะมีไอคอนแอป Caffeine Cafe ปรากฏบนหน้าจอโฮมของคุณทันที!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'android' && (
                <div className="space-y-2.5">
                  <h5 className="font-bold text-[#2b2118]">ขั้นตอนการติดตั้งบนมือถือ Android:</h5>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex items-start gap-2.5 p-2 bg-[#faf7f2] rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-[#3b2416] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        แตะปุ่ม <strong>&ldquo;ติดตั้งแอปทันที&rdquo;</strong> ด้านบน หรือแตะจุดสามจุด (⋮) ที่มุมบนขวาของ Chrome
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 bg-[#faf7f2] rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-[#3b2416] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        เลือก <strong>&ldquo;ติดตั้งแอป&rdquo; (Install App)</strong> หรือ <strong>&ldquo;เพิ่มลงในหน้าจอหลัก&rdquo;</strong>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 bg-[#faf7f2] rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-[#3b2416] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        แตะยืนยัน <strong>&ldquo;ติดตั้ง&rdquo;</strong> แอปจะถูกดาวน์โหลดลงในเครื่องพร้อมเปิดใช้งานแบบเต็มหน้าจอ
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'desktop' && (
                <div className="space-y-2.5">
                  <h5 className="font-bold text-[#2b2118]">ขั้นตอนการติดตั้งบนคอมพิวเตอร์ (PC / Mac):</h5>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex items-start gap-2.5 p-2 bg-[#faf7f2] rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-[#3b2416] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        มองหาไอคอน <strong>ติดตั้ง (Install icon)</strong> ที่แถบ Address bar ด้านบนขวาของเบราว์เซอร์ Chrome หรือ Edge
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 bg-[#faf7f2] rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-[#3b2416] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        คลิก <strong>&ldquo;ติดตั้ง&rdquo; (Install)</strong> เพื่อเปิดแอปในหน้าต่างแยกเดี่ยว (Standalone Window) พร้อมสร้างไอคอนลัดบนเดสก์ท็อป
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#e5dcd3] flex items-center justify-between text-xs">
          <span className="text-slate-500">
            ปลอดภัย 100% · ไม่ต้องผ่าน App Store
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
