import React, { useState } from 'react';
import { X, Award, Gift, Sparkles, Check, ChevronRight, Phone, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_REWARDS } from '../data/initialData';
import { RewardItem } from '../types';

export const MemberModal: React.FC = () => {
  const {
    isMemberModalOpen,
    setIsMemberModalOpen,
    activeMemberPhone,
    setActiveMemberPhone,
    getMemberByPhone,
    redeemReward,
    setIsCartOpen,
  } = useApp();

  const [inputPhone, setInputPhone] = useState(activeMemberPhone);
  const [redeemedRewardId, setRedeemedRewardId] = useState<string | null>(null);

  if (!isMemberModalOpen) return null;

  const currentMember = getMemberByPhone(inputPhone || activeMemberPhone);

  const handlePhoneChange = (newPhone: string) => {
    setInputPhone(newPhone);
    if (newPhone.trim().length >= 9) {
      setActiveMemberPhone(newPhone.trim());
    }
  };

  const handleRedeem = (reward: RewardItem) => {
    const success = redeemReward(reward);
    if (success) {
      setRedeemedRewardId(reward.id);
      setTimeout(() => {
        setIsMemberModalOpen(false);
        setIsCartOpen(true);
      }, 900);
    }
  };

  const nextTierPts = currentMember.tier === 'Green' ? 500 : currentMember.tier === 'Gold' ? 1500 : 3000;
  const progressPercent = Math.min(100, Math.round((currentMember.points / nextTierPts) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e5dcd3] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#e5dcd3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-[#d97706]" />
            </div>
            <div>
              <h3 className="font-bold text-[#2b2118] text-base">บัตรสมาชิก Caffeine Rewards Club</h3>
              <p className="text-xs text-[#786b5e]">สะสมแต้มทุก 10 บาท = 1 แต้ม จากเบอร์โทรศัพท์ของคุณ</p>
            </div>
          </div>
          <button
            onClick={() => setIsMemberModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Phone Lookup Box */}
          <div className="bg-white p-3.5 rounded-xl border border-[#e8dfd5] space-y-2">
            <label className="block text-xs font-bold text-[#2b2118] uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#b45309]" />
              <span>ค้นหา / ระบุเบอร์โทรศัพท์เพื่อตรวจสอบแต้ม</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="tel"
                value={inputPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="ระบุเบอร์โทร เช่น 081-987-6543"
                className="w-full pl-9 pr-3 py-2 bg-[#faf7f2] border border-[#d8cfc4] rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3b2416]"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              ทุกครั้งที่สั่งซื้อสินค้า เพียงระบุเบอร์นี้ ระบบจะสะสมแต้มให้อัตโนมัติทันที
            </p>
          </div>

          {/* Member Digital Card */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#2c1d11] via-[#3d2717] to-[#1a1009] text-white shadow-xl overflow-hidden border border-[#523924]">
            {/* Ambient pattern */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#d97706]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#d8c3b0]">
                  CAFFEINE CAFE REWARDS
                </span>
                <h4 className="text-lg font-bold mt-0.5 tracking-tight">{currentMember.name}</h4>
                <p className="text-xs text-[#a89585] mt-0.5 font-mono">{currentMember.phone}</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#d97706] text-white tracking-wider">
                  {currentMember.tier.toUpperCase()} TIER
                </span>
                <div className="text-[10px] text-[#d8c3b0] mt-1 font-mono">{currentMember.id}</div>
              </div>
            </div>

            {/* Points highlight */}
            <div className="relative z-10 mt-6 pt-4 border-t border-[#4a3523] flex items-end justify-between">
              <div>
                <span className="text-[11px] text-[#d8c3b0] block">คะแนนสะสมคงเหลือ</span>
                <div className="text-3xl font-black text-amber-300 font-mono tabular-nums leading-none mt-1">
                  {currentMember.points}{' '}
                  <span className="text-sm font-semibold text-white">แต้ม</span>
                </div>
              </div>

              <div className="text-right text-[11px] text-[#d8c3b0]">
                <span>สั่งสะสมแล้ว {currentMember.ordersCount} ครั้ง</span>
                <span className="block font-medium">ยอดรวม {currentMember.totalSpent}฿</span>
              </div>
            </div>

            {/* Progress to next tier */}
            <div className="relative z-10 mt-4">
              <div className="flex justify-between text-[10px] text-[#d8c3b0] mb-1">
                <span>ความก้าวหน้าสู่ระดับถัดไป</span>
                <span className="font-mono">{currentMember.points} / {nextTierPts}</span>
              </div>
              <div className="w-full h-1.5 bg-[#4a3523] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Member Privileges */}
          <div className="bg-white p-4 rounded-xl border border-[#e8dfd5] text-xs space-y-2">
            <span className="font-bold text-[#2b2118] uppercase tracking-wider block">
              สิทธิประโยชน์การสะสมแต้มผ่านเบอร์โทรศัพท์
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                <span>สะสมแต้มทุก 10฿ = 1 แต้ม</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                <span>แลกส่วนลดได้ทันทีในบิล</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                <span>ไม่ต้องพกบัตร เพียงบอกเบอร์</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                <span>รับของขวัญวันเกิดพิเศษ</span>
              </div>
            </div>
          </div>

          {/* Reward Catalog */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-[#2b2118] uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#b45309]" />
                <span>ของรางวัลและส่วนลดที่แลกได้</span>
              </h4>
              <span className="text-[11px] text-slate-500">กดแลกแล้วใช้ในบิลนี้ทันที</span>
            </div>

            <div className="space-y-3">
              {INITIAL_REWARDS.map((rew) => {
                const canRedeem = currentMember.points >= rew.pointsCost;
                const isRedeemed = redeemedRewardId === rew.id;

                return (
                  <div
                    key={rew.id}
                    className="p-3.5 bg-white rounded-xl border border-[#e8dfd5] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="text-[#3b2416]">{rew.title}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {rew.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{rew.description}</p>
                      <div className="text-xs font-bold text-[#b45309] mt-1 tabular-nums">
                        ใช้ {rew.pointsCost} แต้ม
                      </div>
                    </div>

                    <button
                      disabled={!canRedeem || isRedeemed}
                      onClick={() => handleRedeem(rew)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 flex-shrink-0 ${
                        isRedeemed
                          ? 'bg-emerald-600 text-white'
                          : canRedeem
                          ? 'bg-[#3b2416] text-white hover:bg-[#2b180d] shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isRedeemed ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>แลกแล้ว</span>
                        </>
                      ) : canRedeem ? (
                        <>
                          <span>แลกรับส่วนลด</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <span>แต้มไม่พอ</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
