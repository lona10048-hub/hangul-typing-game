import React from 'react';

interface KeyDef {
  base: string;
  shift?: string;
  hand: 'left' | 'right';
}

const ROW_1: KeyDef[] = [
  { base: 'ㅂ', shift: 'ㅃ', hand: 'left' },
  { base: 'ㅈ', shift: 'ㅉ', hand: 'left' },
  { base: 'ㄷ', shift: 'ㄸ', hand: 'left' },
  { base: 'ㄱ', shift: 'ㄲ', hand: 'left' },
  { base: 'ㅅ', shift: 'ㅆ', hand: 'left' },
  { base: 'ㅛ', hand: 'right' },
  { base: 'ㅕ', hand: 'right' },
  { base: 'ㅑ', hand: 'right' },
  { base: 'ㅐ', shift: 'ㅒ', hand: 'right' },
  { base: 'ㅔ', shift: 'ㅖ', hand: 'right' },
];

const ROW_2: KeyDef[] = [
  { base: 'ㅁ', hand: 'left' },
  { base: 'ㄴ', hand: 'left' },
  { base: 'ㅇ', hand: 'left' },
  { base: 'ㄹ', hand: 'left' },
  { base: 'ㅎ', hand: 'left' },
  { base: 'ㅗ', hand: 'right' },
  { base: 'ㅓ', hand: 'right' },
  { base: 'ㅏ', hand: 'right' },
  { base: 'ㅣ', hand: 'right' },
];

const ROW_3: KeyDef[] = [
  { base: 'ㅋ', hand: 'left' },
  { base: 'ㅌ', hand: 'left' },
  { base: 'ㅊ', hand: 'left' },
  { base: 'ㅍ', hand: 'left' },
  { base: 'ㅠ', hand: 'right' },
  { base: 'ㅜ', hand: 'right' },
  { base: 'ㅡ', hand: 'right' },
];

interface HangulKeyboardGuideProps {
  nextHintKey: string | null;
}

export const HangulKeyboardGuide: React.FC<HangulKeyboardGuideProps> = ({ nextHintKey }) => {
  const needsShift =
    nextHintKey !== null &&
    ['ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅒ', 'ㅖ'].includes(nextHintKey);

  const renderKey = (keyDef: KeyDef) => {
    const isTarget =
      nextHintKey === keyDef.base || (keyDef.shift !== undefined && nextHintKey === keyDef.shift);

    const handTint =
      keyDef.hand === 'left'
        ? 'bg-[#FFF7ED] border-[#FDE2C8] text-[#4A3B32]'
        : 'bg-[#F0FDF4] border-[#CCEBD7] text-[#284234]';

    return (
      <div
        key={keyDef.base}
        className={`relative flex flex-col items-center justify-center w-10 h-11 sm:w-12 sm:h-12 rounded-xl border text-base font-bold transition-transform duration-100 select-none ${
          isTarget
            ? 'bg-[#F97316] border-[#EA580C] text-white scale-105 shadow-md z-10'
            : handTint
        }`}
      >
        {keyDef.shift && (
          <span
            className={`absolute top-1 right-1.5 text-[10px] leading-none font-medium ${
              isTarget && nextHintKey === keyDef.shift
                ? 'text-white underline'
                : isTarget
                ? 'text-orange-100'
                : 'text-[#8B7D72]'
            }`}
          >
            {keyDef.shift}
          </span>
        )}
        <span className="leading-none">{keyDef.base}</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#E7E2D8] rounded-2xl p-4 select-none">
      <div className="flex items-center justify-between mb-3 text-xs text-[#786B61]">
        <span>한글 두벌식 자판 도우미</span>
        <div className="flex items-center gap-3">
          <span>왼손 (자음)</span>
          <span aria-hidden="true">·</span>
          <span>오른손 (모음)</span>
          {nextHintKey && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-bold text-[#EA580C]">
                다음 키:{' '}
                {nextHintKey === ' '
                  ? '띄어쓰기 (Space)'
                  : nextHintKey === 'Backspace'
                  ? '지우기 (Backspace)'
                  : needsShift
                  ? `Shift + ${nextHintKey}`
                  : nextHintKey}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-1.5">{ROW_1.map(renderKey)}</div>
        <div className="flex items-center gap-1.5 pl-4">{ROW_2.map(renderKey)}</div>
        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center justify-center px-3 h-11 sm:h-12 rounded-xl border text-xs font-bold transition-transform duration-100 ${
              needsShift
                ? 'bg-[#F97316] border-[#EA580C] text-white scale-105 shadow-md'
                : 'bg-[#F5F2EB] border-[#E7E2D8] text-[#786B61]'
            }`}
          >
            Shift
          </div>
          {ROW_3.map(renderKey)}
          <div
            className={`flex items-center justify-center px-3 h-11 sm:h-12 rounded-xl border text-xs font-bold transition-transform duration-100 ${
              nextHintKey === 'Backspace'
                ? 'bg-[#E11D48] border-[#BE123C] text-white scale-105 shadow-md'
                : 'bg-[#F5F2EB] border-[#E7E2D8] text-[#786B61]'
            }`}
          >
            지우기
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-0.5 w-full max-w-md">
          <div
            className={`flex-1 h-9 rounded-xl border flex items-center justify-center text-xs font-bold transition-transform duration-100 ${
              nextHintKey === ' '
                ? 'bg-[#F97316] border-[#EA580C] text-white scale-[1.02] shadow-md'
                : 'bg-[#F5F2EB] border-[#E7E2D8] text-[#786B61]'
            }`}
          >
            띄어쓰기 (Space)
          </div>
          <div className="px-4 h-9 rounded-xl border bg-[#F5F2EB] border-[#E7E2D8] flex items-center justify-center text-xs font-bold text-[#786B61]">
            완료 (Enter)
          </div>
        </div>
      </div>
    </div>
  );
};
