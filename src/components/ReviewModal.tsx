import React, { useState } from 'react';
import { X, Star, ThumbsUp, Check, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReviewModal: React.FC = () => {
  const { selectedOrderForReview, setSelectedOrderForReview, addReview } = useApp();

  const [rating, setRating] = useState(5);
  const [tasteScore, setTasteScore] = useState(5);
  const [speedScore, setSpeedScore] = useState(5);
  const [serviceScore, setServiceScore] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['เครื่องดื่มหอมอร่อย', 'ขนมปังกรอบนุ่ม']);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!selectedOrderForReview) return null;

  const availableTags = [
    'เครื่องดื่มหอมอร่อย',
    'ขนมปังกรอบนุ่ม',
    'บริการรวดเร็ว',
    'สังขยาเข้มข้น',
    'แพ็กเกจจิ้งดี',
    'มัทฉะแท้กลมกล่อม',
    'ชงตรงตามระดับความหวาน',
    'คุ้มค่าคุ้มราคา',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReview(
      selectedOrderForReview.id,
      rating,
      tasteScore,
      speedScore,
      serviceScore,
      comment.trim() || 'รสชาติดีและบริการประทับใจมากครับ',
      selectedTags
    );
    setIsSubmitted(true);
    setTimeout(() => {
      setSelectedOrderForReview(null);
      setIsSubmitted(false);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#faf7f2] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e5dcd3] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#e5dcd3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-[#2b2118] text-base">รีวิวความพึงพอใจการใช้บริการ</h3>
              <p className="text-xs text-[#786b5e]">
                ออเดอร์คิว {selectedOrderForReview.queueNumber} · ช่วยเราปรับปรุงคุณภาพให้ดียิ่งขึ้น
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedOrderForReview(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">ขอบคุณสำหรับคำรีวิว!</h4>
            <p className="text-xs text-slate-600 mt-1 max-w-xs">
              ระบบได้บันทึกคำติชมเพื่อพัฒนาการบริการ และเพิ่มแต้มสะสมพิเศษให้คุณเรียบร้อยแล้ว
            </p>
            <div className="mt-4 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>+20 แต้มสะสมโบนัส</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5">
            {/* Overall Rating Stars */}
            <div className="text-center bg-white p-4 rounded-xl border border-[#e8dfd5]">
              <span className="text-xs font-bold text-[#2b2118] uppercase tracking-wider block mb-2">
                ให้คะแนนความพึงพอใจโดยรวม
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 fill-slate-100'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-amber-800 mt-1.5 block">
                {rating === 5 && 'ยอดเยี่ยมมาก ประทับใจที่สุด'}
                {rating === 4 && 'ดีมาก ชอบมาก'}
                {rating === 3 && 'ปานกลาง มีจุดที่อยากให้พัฒนา'}
                {rating === 2 && 'ต้องปรับปรุงบางจุด'}
                {rating === 1 && 'ไม่พึงพอใจ'}
              </span>
            </div>

            {/* Sub-ratings */}
            <div className="bg-white p-4 rounded-xl border border-[#e8dfd5] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">รสชาติเครื่องดื่ม &amp; ขนมปัง</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTasteScore(s)}
                      className={`w-6 h-6 rounded text-[11px] font-bold ${
                        tasteScore >= s ? 'bg-[#3b2416] text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">ความรวดเร็วในการเตรียม</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeedScore(s)}
                      className={`w-6 h-6 rounded text-[11px] font-bold ${
                        speedScore >= s ? 'bg-[#3b2416] text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">การบริการและความสะอาด</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setServiceScore(s)}
                      className={`w-6 h-6 rounded text-[11px] font-bold ${
                        serviceScore >= s ? 'bg-[#3b2416] text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Impression Tags */}
            <div>
              <span className="text-xs font-bold text-[#2b2118] uppercase tracking-wider block mb-2">
                จุดเด่นที่คุณประทับใจ (เลือกได้หลายข้อ)
              </span>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isChecked
                          ? 'bg-[#3b2416] text-white border-[#3b2416]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text comments */}
            <div>
              <label className="text-xs font-bold text-[#2b2118] uppercase tracking-wider block mb-1.5">
                ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุง
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="บอกเล่าความรู้สึกของคุณ เช่น เมนูนี้หวานกำลังดี บาริสต้าแนะนำดี หรืออยากให้เพิ่มเมนูใดในอนาคต..."
                className="w-full p-3 bg-white border border-[#d8cfc4] rounded-xl text-xs text-[#2b2118] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b2416]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#3b2416] hover:bg-[#2b180d] text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>ส่งรีวิวรับแต้มโบนัส +20 แต้ม</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
