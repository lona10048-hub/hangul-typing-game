import React, { useEffect } from 'react';
import { STICKER_BADGES } from '../data/curriculum5th';
import { soundEngine } from '../utils/sound';
import { RoundOutcome } from '../utils/storage';

interface RoundSummaryModalProps {
  outcome: RoundOutcome;
  newlyUnlockedIds: string[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  outcome,
  newlyUnlockedIds,
  onPlayAgain,
  onGoHome,
}) => {
  useEffect(() => {
    if (newlyUnlockedIds.length > 0) {
      const timer = window.setTimeout(() => {
        soundEngine.playStickerUnlock();
      }, 380);
      return () => window.clearTimeout(timer);
    }
  }, [newlyUnlockedIds.length]);

  const unlockedStickers = STICKER_BADGES.filter((b) => newlyUnlockedIds.includes(b.id));

  const stars =
    outcome.accuracy >= 95 && outcome.completedItems >= 5
      ? 3
      : outcome.accuracy >= 85 && outcome.completedItems >= 3
      ? 2
      : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-[#E7E2D8] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl flex flex-col gap-5">
        <div className="text-center">
          <div className="text-3xl tracking-widest text-[#F59E0B] mb-2" aria-label={`별 ${stars}개`}>
            {'★'.repeat(stars)}
            <span className="text-[#E7E2D8]">{'★'.repeat(3 - stars)}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-[#2C2520]">
            {outcome.bossDefeated
              ? '오타 먹구름을 물리쳤어요!'
              : '연습을 멋지게 마쳤어요!'}
          </h2>
          <p className="text-sm text-[#786B61] mt-1">
            {outcome.topicLabel} · 완료 {outcome.completedItems}개
          </p>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FBF9F4] border border-[#EDE7DC] rounded-xl p-3 text-center">
            <p className="text-xs text-[#8B7D72]">획득 점수</p>
            <p className="font-mono font-bold text-lg tabular-nums text-[#EA580C] mt-0.5">
              {outcome.score}
            </p>
          </div>
          <div className="bg-[#FBF9F4] border border-[#EDE7DC] rounded-xl p-3 text-center">
            <p className="text-xs text-[#8B7D72]">평균 타수</p>
            <p className="font-mono font-bold text-lg tabular-nums text-[#2C2520] mt-0.5">
              {outcome.cpm}타
            </p>
          </div>
          <div className="bg-[#FBF9F4] border border-[#EDE7DC] rounded-xl p-3 text-center">
            <p className="text-xs text-[#8B7D72]">정확도</p>
            <p className="font-mono font-bold text-lg tabular-nums text-[#059669] mt-0.5">
              {outcome.accuracy}%
            </p>
          </div>
          <div className="bg-[#FBF9F4] border border-[#EDE7DC] rounded-xl p-3 text-center">
            <p className="text-xs text-[#8B7D72]">최고 콤보</p>
            <p className="font-mono font-bold text-lg tabular-nums text-[#0284C7] mt-0.5">
              {outcome.maxCombo}
            </p>
          </div>
        </div>

        {/* Newly Unlocked Stickers */}
        {unlockedStickers.length > 0 && (
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
            <p className="text-xs font-bold text-[#92400E] mb-2.5">
              새로운 칭찬 스티커를 모았어요!
            </p>
            <div className="flex flex-col gap-2">
              {unlockedStickers.map((st) => (
                <div key={st.id} className="flex items-center gap-3">
                  <span className="text-2xl">{st.symbol}</span>
                  <div>
                    <p className="text-sm font-bold text-[#2C2520]">{st.title}</p>
                    <p className="text-xs text-[#786B61]">{st.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onGoHome();
            }}
            className="flex-1 py-3 px-4 rounded-xl border border-[#D9D0C3] text-sm font-bold text-[#574C43] hover:bg-[#F5F2EB] transition-colors cursor-pointer whitespace-nowrap"
          >
            다른 게임 선택
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onPlayAgain();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#F97316] text-white text-sm font-bold hover:bg-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
          >
            다시 도전하기
          </button>
        </div>
      </div>
    </div>
  );
};
