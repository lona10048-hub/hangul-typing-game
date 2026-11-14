import React from 'react';
import { STICKER_BADGES } from '../data/curriculum5th';

interface StickerBookViewProps {
  unlockedIds: string[];
  onStartPractice: () => void;
}

export const StickerBookView: React.FC<StickerBookViewProps> = ({
  unlockedIds,
  onStartPractice,
}) => {
  return (
    <section className="flex flex-col gap-6">
      <div className="bg-white border border-[#E7E2D8] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-[#2C2520]">칭찬 스티커 도감</h2>
          <p className="text-sm text-[#786B61] mt-1">
            타자 연습 미션을 달성하고 도토리 숲의 12가지 칭찬 스티커를 모두 모아 보세요.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-xs text-[#8B7D72]">모은 스티커</p>
            <p className="font-mono font-bold text-xl tabular-nums text-[#EA580C]">
              {unlockedIds.length} / {STICKER_BADGES.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onStartPractice}
            className="px-4 py-2.5 rounded-xl bg-[#F97316] text-white text-sm font-bold hover:bg-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
          >
            스티커 모으러 가기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STICKER_BADGES.map((badge) => {
          const isUnlocked = unlockedIds.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`rounded-2xl border p-5 flex items-start gap-4 transition-colors ${
                isUnlocked
                  ? 'bg-white border-[#E7E2D8]'
                  : 'bg-[#F5F2EB]/60 border-[#E7E2D8] opacity-75'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border ${
                  isUnlocked
                    ? 'bg-[#FFFBEB] border-[#FDE68A]'
                    : 'bg-[#EDE7DC] border-[#DED6C8] grayscale'
                }`}
              >
                {badge.symbol}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#2C2520] truncate">
                    {badge.title}
                  </h3>
                </div>
                <p className="text-xs text-[#786B61] mt-1 leading-relaxed">
                  {badge.description}
                </p>
                <p
                  className={`text-xs font-bold mt-2 ${
                    isUnlocked ? 'text-[#059669]' : 'text-[#9C8E82]'
                  }`}
                >
                  {isUnlocked ? '획득 완료' : '도전 중'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
