import React from 'react';
import { X, Star, ThumbsUp, MessageSquare, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CustomerReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerReviewsModal: React.FC<CustomerReviewsModalProps> = ({ isOpen, onClose }) => {
  const { reviews } = useApp();

  if (!isOpen) return null;

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  const avgTaste = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.tasteScore, 0) / totalReviews).toFixed(1)
    : '5.0';

  const avgSpeed = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.speedScore, 0) / totalReviews).toFixed(1)
    : '4.8';

  const avgService = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.serviceScore, 0) / totalReviews).toFixed(1)
    : '4.9';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#e5dcd3] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#e5dcd3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-[#2b2118] text-base">รีวิวความพึงพอใจจากลูกค้า</h3>
              <p className="text-xs text-[#786b5e]">ความเห็นจริงจากผู้ใช้บริการร้าน Caffeine Cafe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Rating Summary Card */}
          <div className="bg-white p-5 rounded-xl border border-[#e8dfd5] grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-5 text-center sm:border-r border-[#f0e8df] sm:pr-4">
              <div className="text-4xl font-black text-[#2b2118] tabular-nums font-mono">
                {avgRating}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                จากทั้งหมด {totalReviews} รีวิว
              </span>
            </div>

            <div className="sm:col-span-7 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">รสชาติเครื่องดื่ม &amp; โชกุปัง</span>
                <span className="font-bold text-slate-800 tabular-nums">{avgTaste} / 5.0</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(Number(avgTaste) / 5) * 100}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">ความรวดเร็วในการออกออเดอร์</span>
                <span className="font-bold text-slate-800 tabular-nums">{avgSpeed} / 5.0</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(Number(avgSpeed) / 5) * 100}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">การบริการ &amp; ความใส่ใจ</span>
                <span className="font-bold text-slate-800 tabular-nums">{avgService} / 5.0</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(Number(avgService) / 5) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#2b2118] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#b45309]" />
              <span>ความคิดเห็นล่าสุด</span>
            </h4>

            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 bg-white rounded-xl border border-[#e8dfd5] space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-[#2b2118]">{rev.customerName}</h5>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400 ml-1">· {rev.createdAt}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">#{rev.orderId}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>

                {rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium text-[#786b5e] bg-[#f5ede3] px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
