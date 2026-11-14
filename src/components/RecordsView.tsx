import React, { useState } from 'react';
import { getPlayerRank } from '../data/curriculum5th';
import { GameMode, PlayerProgress } from '../utils/storage';

interface RecordsViewProps {
  progress: PlayerProgress;
  onResetProgress: () => void;
  onStartPractice: () => void;
}

const MODE_NAMES: Record<GameMode, string> = {
  sentence: '문장 따라치기',
  word: '낱말 톡톡',
  boss: '오타 먹구름 대작전',
  timeattack: '60초 타임어택',
};

export const RecordsView: React.FC<RecordsViewProps> = ({
  progress,
  onResetProgress,
  onStartPractice,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const rank = getPlayerRank(progress.totalScore);

  return (
    <section className="flex flex-col gap-6">
      <div className="bg-white border border-[#E7E2D8] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-[#2C2520]">나의 타자 성장 기록</h2>
          <p className="text-sm text-[#786B61] mt-1">
            현재 등급은 <span className="font-bold text-[#EA580C]">{rank.title}</span>이에요.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-3.5 py-2 rounded-xl border border-[#E7E2D8] text-xs font-bold text-[#786B61] hover:bg-[#F5F2EB] transition-colors cursor-pointer whitespace-nowrap"
            >
              기록 초기화
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="px-3 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#BE123C] cursor-pointer whitespace-nowrap"
              >
                정말 초기화할까요?
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 rounded-xl border border-[#E7E2D8] text-xs font-bold text-[#574C43] cursor-pointer whitespace-nowrap"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E2D8] rounded-2xl p-5">
          <p className="text-xs text-[#8B7D72]">누적 점수</p>
          <p className="font-mono font-bold text-2xl tabular-nums text-[#EA580C] mt-1">
            {progress.totalScore.toLocaleString()}점
          </p>
        </div>
        <div className="bg-white border border-[#E7E2D8] rounded-2xl p-5">
          <p className="text-xs text-[#8B7D72]">최고 타수</p>
          <p className="font-mono font-bold text-2xl tabular-nums text-[#2C2520] mt-1">
            {progress.bestCpm}타
          </p>
        </div>
        <div className="bg-white border border-[#E7E2D8] rounded-2xl p-5">
          <p className="text-xs text-[#8B7D72]">최고 정확도</p>
          <p className="font-mono font-bold text-2xl tabular-nums text-[#059669] mt-1">
            {progress.bestAccuracy}%
          </p>
        </div>
        <div className="bg-white border border-[#E7E2D8] rounded-2xl p-5">
          <p className="text-xs text-[#8B7D72]">최고 연속 콤보</p>
          <p className="font-mono font-bold text-2xl tabular-nums text-[#0284C7] mt-1">
            {progress.bestMaxCombo}콤보
          </p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-[#E7E2D8] rounded-2xl p-6">
        <h3 className="font-display text-lg text-[#2C2520] mb-4">최근 연습 기록</h3>

        {progress.history.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center gap-3">
            <p className="text-sm text-[#786B61]">아직 완료한 타자 연습 기록이 없어요.</p>
            <button
              type="button"
              onClick={onStartPractice}
              className="px-4 py-2.5 rounded-xl bg-[#F97316] text-white text-sm font-bold hover:bg-[#EA580C] transition-colors cursor-pointer"
            >
              첫 타자 연습 시작하기
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#EDE7DC] text-xs text-[#8B7D72]">
                  <th className="py-2.5 pr-4 font-medium">놀이 종류</th>
                  <th className="py-2.5 pr-4 font-medium">주제</th>
                  <th className="py-2.5 pr-4 font-medium">점수</th>
                  <th className="py-2.5 pr-4 font-medium">타수</th>
                  <th className="py-2.5 pr-4 font-medium">정확도</th>
                  <th className="py-2.5 pr-4 font-medium">최고 콤보</th>
                  <th className="py-2.5 font-medium">연습 시각</th>
                </tr>
              </thead>
              <tbody>
                {progress.history.map((rec) => (
                  <tr key={rec.id} className="border-b border-[#F5F2EB] last:border-b-0">
                    <td className="py-3 pr-4 font-bold text-[#2C2520] whitespace-nowrap">
                      {MODE_NAMES[rec.mode]}
                    </td>
                    <td className="py-3 pr-4 text-[#574C43] whitespace-nowrap">
                      {rec.topicLabel}
                    </td>
                    <td className="py-3 pr-4 font-mono font-bold tabular-nums text-[#EA580C]">
                      {rec.score}
                    </td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-[#2C2520]">
                      {rec.cpm}타
                    </td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-[#059669]">
                      {rec.accuracy}%
                    </td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-[#0284C7]">
                      {rec.maxCombo}
                    </td>
                    <td className="py-3 text-xs text-[#8B7D72] whitespace-nowrap">
                      {rec.playedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
