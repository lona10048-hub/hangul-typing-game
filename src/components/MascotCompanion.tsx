import React, { useState } from 'react';
import mascotFeverImg from '../assets/images/mascot_tory_fever_1794635935022.jpg';
import mascotHappyImg from '../assets/images/mascot_tory_happy_1794635934161.jpg';
import { getPlayerRank } from '../data/curriculum5th';

export type MascotMood = 'happy' | 'cheering' | 'fever' | 'typo' | 'victory';

interface MascotCompanionProps {
  mood: MascotMood;
  message: string;
  combo: number;
  isFever: boolean;
  totalScore: number;
}

export const MascotCompanion: React.FC<MascotCompanionProps> = ({
  mood,
  message,
  combo,
  isFever,
  totalScore,
}) => {
  const [imgError, setImgError] = useState(false);
  const rank = getPlayerRank(totalScore);

  const imageSrc =
    isFever || mood === 'fever' || mood === 'victory'
      ? mascotFeverImg
      : mascotHappyImg;

  return (
    <aside className="bg-white border border-[#E7E2D8] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#8B7D72]">다람쥐 선생님</p>
          <h3 className="font-display text-xl text-[#2C2520]">토리의 응원실</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#8B7D72]">현재 등급</p>
          <p className="text-sm font-bold text-[#EA580C]">{rank.title}</p>
        </div>
      </div>

      {/* Mascot Artwork */}
      <div
        className={`relative rounded-xl overflow-hidden border transition-colors duration-200 ${
          isFever
            ? 'border-[#F59E0B] bg-[#FFFBEB]'
            : 'border-[#EDE7DC] bg-[#FBF9F4]'
        }`}
      >
        {!imgError ? (
          <img
            src={imageSrc}
            alt="다람쥐 마스코트 토리"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`w-full aspect-square object-cover transition-transform duration-200 ${
              isFever || mood === 'cheering' ? 'animate-mascot-hop' : ''
            }`}
          />
        ) : (
          <div className="w-full aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-[#FEF3C7] to-[#FFEDD5] text-[#9A3412] p-4">
            <span className="text-5xl mb-2" aria-hidden="true">
              🐿️
            </span>
            <span className="font-display text-lg">토리</span>
          </div>
        )}
      </div>

      {/* Speech Bubble */}
      <div
        className={`rounded-xl p-3.5 text-sm leading-relaxed font-medium border transition-colors duration-150 ${
          mood === 'typo'
            ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]'
            : isFever
            ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
            : 'bg-[#F8F6F1] border-[#E7E2D8] text-[#3F362E]'
        }`}
      >
        <p>{message}</p>
      </div>

      {/* Combo & Fever Meter */}
      <div className="pt-1 border-t border-[#F1EDE4]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-[#786B61]">피버 에너지</span>
          <span className="font-mono font-bold tabular-nums text-[#EA580C]">
            {isFever ? '2배 점수 발동 중!' : `${Math.min(combo, 10)} / 10 콤보`}
          </span>
        </div>
        <div className="w-full h-2.5 bg-[#F1EDE4] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              isFever ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
            }`}
            style={{ width: `${isFever ? 100 : Math.min(combo * 10, 100)}%` }}
          />
        </div>
      </div>

      {/* Rank XP Bar */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#786B61]">다음 등급: {rank.nextTitle}</span>
          <span className="font-mono font-bold tabular-nums text-[#574C43]">
            {rank.progressPct}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#F1EDE4] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F97316] rounded-full transition-all duration-300"
            style={{ width: `${rank.progressPct}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
