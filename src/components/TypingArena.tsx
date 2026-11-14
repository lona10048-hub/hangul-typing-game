import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SENTENCES_5TH,
  SentenceItem,
  TOPIC_LABELS,
  TopicCategory,
} from '../data/curriculum5th';
import { countHangulKeystrokes, evaluateTypingProgress } from '../utils/hangul';
import { soundEngine } from '../utils/sound';
import { GameMode, RoundOutcome } from '../utils/storage';
import monsterTypoCloudImg from '../assets/images/monster_typo_cloud_1794635935673.jpg';
import { HangulKeyboardGuide } from './HangulKeyboardGuide';
import { MascotMood } from './MascotCompanion';

interface TypingArenaProps {
  mode: Exclude<GameMode, 'word'>;
  topic: TopicCategory;
  onMascotUpdate: (mood: MascotMood, message: string, combo: number, isFever: boolean) => void;
  onFinishRound: (outcome: RoundOutcome) => void;
  onExit: () => void;
}

interface FloatingScore {
  id: number;
  text: string;
  isFever: boolean;
}

const SENTENCES_PER_ROUND = 8;
const BOSS_MAX_HP = 1000;
const TIME_ATTACK_SECONDS = 60;

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  mode,
  topic,
  onMascotUpdate,
  onFinishRound,
  onExit,
}) => {
  const sentencePool = useMemo(() => {
    const filtered =
      topic === 'all' ? SENTENCES_5TH : SENTENCES_5TH.filter((s) => s.topic === topic);
    const shuffled = shuffleArray(filtered);
    if (mode === 'sentence') {
      return shuffled.slice(0, Math.min(SENTENCES_PER_ROUND, shuffled.length));
    }
    // For boss & timeattack, build a long shuffled queue
    return [...shuffled, ...shuffleArray(filtered), ...shuffleArray(filtered)];
  }, [mode, topic]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feverTriggered, setFeverTriggered] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [typoCount, setTypoCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [completedJamos, setCompletedJamos] = useState(0);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [liveCpm, setLiveCpm] = useState(0);

  // Boss & Time Attack specific state
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [bossHitAnim, setBossHitAnim] = useState(false);
  const [monsterImgError, setMonsterImgError] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [timeLeft, setTimeLeft] = useState(TIME_ATTACK_SECONDS);

  const [showKeyboard, setShowKeyboard] = useState(true);
  const [shakeInput, setShakeInput] = useState(false);
  const [lastMeaning, setLastMeaning] = useState<string | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const finishedRef = useRef(false);
  const prevErrorCountRef = useRef(0);

  const currentItem: SentenceItem = sentencePool[currentIndex % sentencePool.length];
  const nextItem: SentenceItem | undefined =
    mode === 'sentence' && currentIndex + 1 >= sentencePool.length
      ? undefined
      : sentencePool[(currentIndex + 1) % sentencePool.length];

  const isFever = combo >= 10;

  const evaluation = useMemo(
    () => evaluateTypingProgress(currentItem.text, typed, isComposing),
    [currentItem.text, typed, isComposing]
  );

  // Focus input on mount and sentence change
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  // Live CPM timer
  useEffect(() => {
    if (!startTime || finishedRef.current) return;
    const interval = window.setInterval(() => {
      const elapsedMin = Math.max((Date.now() - startTime) / 60000, 0.04);
      const currentJamos = countHangulKeystrokes(
        currentItem.text.slice(0, evaluation.completedCorrectCount)
      );
      const cpm = Math.round((completedJamos + currentJamos) / elapsedMin);
      setLiveCpm(Math.min(cpm, 999));
    }, 350);
    return () => window.clearInterval(interval);
  }, [startTime, completedJamos, evaluation.completedCorrectCount, currentItem.text]);

  // Time Attack countdown
  useEffect(() => {
    if (mode !== 'timeattack' || !startTime || finishedRef.current) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, startTime]);

  const finishGame = (bossDefeated: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    soundEngine.playStageClear();

    const elapsedMin = startTime ? Math.max((Date.now() - startTime) / 60000, 0.05) : 0.1;
    const finalCpm = Math.min(Math.round(completedJamos / elapsedMin), 999);
    const totalAttempts = Math.max(totalKeystrokes, 1);
    const accuracy = Math.max(
      0,
      Math.min(100, Math.round(((totalAttempts - typoCount) / totalAttempts) * 100))
    );

    onMascotUpdate('victory', '대단해요! 끝까지 멋지게 완주했어요!', combo, isFever);

    onFinishRound({
      mode,
      topic,
      topicLabel: TOPIC_LABELS[topic],
      score,
      cpm: finalCpm,
      accuracy: completedCount === 0 ? 0 : accuracy,
      maxCombo,
      completedItems: completedCount,
      typoCount,
      feverTriggered,
      bossDefeated,
    });
  };

  // Trigger finish when timeLeft hits 0
  useEffect(() => {
    if (mode === 'timeattack' && timeLeft === 0 && !finishedRef.current) {
      finishGame(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, mode]);

  const spawnFloatingScore = (pts: number, feverNow: boolean) => {
    const id = Date.now() + Math.random();
    setFloatingScores((prev) => [
      ...prev.slice(-3),
      { id, text: `+${pts}${feverNow ? ' 피버!' : ''}`, isFever: feverNow },
    ]);
    window.setTimeout(() => {
      setFloatingScores((prev) => prev.filter((f) => f.id !== id));
    }, 800);
  };

  const completeSentence = () => {
    if (finishedRef.current) return;

    const nextCombo = combo + 1;
    const nextMaxCombo = Math.max(maxCombo, nextCombo);
    const feverNow = nextCombo >= 10;
    if (feverNow && !feverTriggered) {
      setFeverTriggered(true);
      soundEngine.playFeverStart();
    }

    const basePoints = currentItem.text.length * 10;
    const multiplier = feverNow ? 2 : nextCombo >= 5 ? 1.5 : 1;
    const earnedPoints = Math.round(basePoints * multiplier);

    const nextScore = score + earnedPoints;
    const nextCompleted = completedCount + 1;
    const sentenceJamos = countHangulKeystrokes(currentItem.text);
    const nextCompletedJamos = completedJamos + sentenceJamos;

    setScore(nextScore);
    setCombo(nextCombo);
    setMaxCombo(nextMaxCombo);
    setCompletedCount(nextCompleted);
    setCompletedJamos(nextCompletedJamos);
    setLastMeaning(currentItem.meaning ?? null);
    setTyped('');
    setIsComposing(false);
    prevErrorCountRef.current = 0;

    spawnFloatingScore(earnedPoints, feverNow);

    if (mode === 'boss') {
      const damage = Math.round(140 * multiplier);
      const nextHp = Math.max(0, bossHp - damage);
      setBossHp(nextHp);
      setBossHitAnim(true);
      soundEngine.playAttackHit();
      window.setTimeout(() => setBossHitAnim(false), 260);

      if (nextHp <= 0) {
        onMascotUpdate('victory', '와! 오타 먹구름을 물리쳤어요!', nextCombo, feverNow);
        window.setTimeout(() => {
          // Calculate final outcome using updated local variables
          if (finishedRef.current) return;
          finishedRef.current = true;
          soundEngine.playStageClear();
          const elapsedMin = startTime ? Math.max((Date.now() - startTime) / 60000, 0.05) : 0.1;
          const finalCpm = Math.min(Math.round(nextCompletedJamos / elapsedMin), 999);
          const totalAttempts = Math.max(totalKeystrokes + 1, 1);
          const accuracy = Math.max(
            0,
            Math.min(100, Math.round(((totalAttempts - typoCount) / totalAttempts) * 100))
          );
          onFinishRound({
            mode,
            topic,
            topicLabel: TOPIC_LABELS[topic],
            score: nextScore + 300,
            cpm: finalCpm,
            accuracy,
            maxCombo: nextMaxCombo,
            completedItems: nextCompleted,
            typoCount,
            feverTriggered: feverTriggered || feverNow,
            bossDefeated: true,
          });
        }, 300);
        return;
      }
    } else {
      soundEngine.playWordComplete(nextCombo);
    }

    if (feverNow) {
      onMascotUpdate('fever', '피버 타임! 점수가 두 배로 올라가요!', nextCombo, true);
    } else if (nextCombo >= 5) {
      onMascotUpdate('cheering', `${nextCombo}콤보! 리듬이 정말 좋아요!`, nextCombo, false);
    } else {
      onMascotUpdate('happy', '참 잘했어요! 다음 문장도 차근차근 쳐 봐요.', nextCombo, false);
    }

    if (mode === 'sentence' && nextCompleted >= sentencePool.length) {
      window.setTimeout(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        soundEngine.playStageClear();
        const elapsedMin = startTime ? Math.max((Date.now() - startTime) / 60000, 0.05) : 0.1;
        const finalCpm = Math.min(Math.round(nextCompletedJamos / elapsedMin), 999);
        const totalAttempts = Math.max(totalKeystrokes + 1, 1);
        const accuracy = Math.max(
          0,
          Math.min(100, Math.round(((totalAttempts - typoCount) / totalAttempts) * 100))
        );
        onFinishRound({
          mode,
          topic,
          topicLabel: TOPIC_LABELS[topic],
          score: nextScore,
          cpm: finalCpm,
          accuracy,
          maxCombo: nextMaxCombo,
          completedItems: nextCompleted,
          typoCount,
          feverTriggered: feverTriggered || feverNow,
          bossDefeated: false,
        });
      }, 280);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finishedRef.current) return;
    const val = e.target.value;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setTyped(val);
    setTotalKeystrokes((prev) => prev + 1);

    // Evaluate immediate typo feedback
    const nativeComposing = (e.nativeEvent as InputEvent).isComposing ?? isComposing;
    const nextEval = evaluateTypingProgress(currentItem.text, val, nativeComposing);

    if (nextEval.errorCount > prevErrorCountRef.current) {
      soundEngine.playTypo();
      setTypoCount((prev) => prev + 1);
      setCombo(0);
      setShakeInput(true);
      window.setTimeout(() => setShakeInput(false), 240);
      onMascotUpdate('typo', '괜찮아요! 오타를 지우고 천천히 다시 쳐 봐요.', 0, false);

      if (mode === 'boss') {
        setHearts((prev) => {
          const nextHearts = Math.max(0, prev - 1);
          if (nextHearts === 0) {
            window.setTimeout(() => finishGame(false), 250);
          }
          return nextHearts;
        });
      }
    } else if (val.length > typed.length) {
      soundEngine.playKeyTick(combo);
    }

    prevErrorCountRef.current = nextEval.errorCount;

    // Auto-complete when exact match & not actively composing a trailing syllable
    if (val === currentItem.text && !nativeComposing) {
      completeSentence();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      if (typed.trim() === currentItem.text.trim()) {
        completeSentence();
      } else if (evaluation.errorCount === 0 && typed.length >= currentItem.text.length - 1) {
        // Gentle nudge if 1 char short
        soundEngine.playTypo();
      }
    }
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    const finalVal = e.currentTarget.value;
    if (finalVal === currentItem.text) {
      completeSentence();
    }
  };

  const liveAccuracy =
    totalKeystrokes === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round(((totalKeystrokes - typoCount) / totalKeystrokes) * 100)));

  return (
    <div className="flex flex-col gap-5">
      {/* Top Game HUD */}
      <div className="bg-white border border-[#E7E2D8] rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onExit();
            }}
            className="px-3 py-1.5 rounded-lg border border-[#E7E2D8] text-xs font-bold text-[#574C43] hover:bg-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            ← 모드 선택
          </button>
          <span className="font-display text-lg text-[#2C2520] whitespace-nowrap">
            {mode === 'sentence' && '문장 따라치기'}
            {mode === 'boss' && '오타 먹구름 대작전'}
            {mode === 'timeattack' && '60초 타임어택'}
          </span>
          <span className="text-xs text-[#8B7D72] hidden sm:inline whitespace-nowrap">
            {TOPIC_LABELS[topic]}
          </span>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <div>
            <span className="text-xs text-[#8B7D72] mr-1.5">점수</span>
            <span className="font-mono font-bold tabular-nums text-[#EA580C]">{score}</span>
          </div>
          <div>
            <span className="text-xs text-[#8B7D72] mr-1.5">타수</span>
            <span className="font-mono font-bold tabular-nums text-[#2C2520]">{liveCpm}타</span>
          </div>
          <div>
            <span className="text-xs text-[#8B7D72] mr-1.5">정확도</span>
            <span className="font-mono font-bold tabular-nums text-[#059669]">{liveAccuracy}%</span>
          </div>
          {mode === 'sentence' && (
            <div>
              <span className="text-xs text-[#8B7D72] mr-1.5">진행</span>
              <span className="font-mono font-bold tabular-nums text-[#2C2520]">
                {Math.min(completedCount + 1, sentencePool.length)} / {sentencePool.length}
              </span>
            </div>
          )}
          {mode === 'timeattack' && (
            <div>
              <span className="text-xs text-[#8B7D72] mr-1.5">남은 시간</span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  timeLeft <= 10 ? 'text-[#E11D48]' : 'text-[#0284C7]'
                }`}
              >
                {timeLeft}초
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Boss Arena Header (Only in Boss Mode) */}
      {mode === 'boss' && (
        <div className="bg-white border border-[#E7E2D8] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
          <div
            className={`w-24 h-24 rounded-xl overflow-hidden border border-[#E7E2D8] shrink-0 transition-transform duration-150 ${
              bossHitAnim ? 'scale-90 brightness-110' : 'scale-100'
            }`}
          >
            {!monsterImgError ? (
              <img
                src={monsterTypoCloudImg}
                alt="장난꾸러기 오타 먹구름"
                referrerPolicy="no-referrer"
                onError={() => setMonsterImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#EDE9FE] text-4xl">
                👾
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <h3 className="font-display text-lg text-[#2C2520]">오타 먹구름</h3>
                <p className="text-xs text-[#786B61]">
                  정확히 문장을 입력하면 먹구름에게 타자 공격을 날려요!
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#8B7D72] mr-1.5">내 하트</span>
                <span className="text-base tracking-wider text-[#E11D48]" aria-label={`체력 ${hearts}개`}>
                  {'♥'.repeat(hearts)}
                  <span className="text-[#E7E2D8]">{'♥'.repeat(5 - hearts)}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[#7C3AED]">먹구름 체력</span>
              <span className="font-mono font-bold tabular-nums text-[#2C2520]">
                {bossHp} / {BOSS_MAX_HP}
              </span>
            </div>
            <div className="w-full h-3.5 bg-[#F1EDE4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7C3AED] rounded-full transition-all duration-200"
                style={{ width: `${(bossHp / BOSS_MAX_HP) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Typing Stage: Top Prompt + Bottom Matching Input */}
      <div
        className={`relative bg-white border rounded-2xl p-6 sm:p-8 flex flex-col gap-5 transition-colors duration-200 ${
          isFever ? 'border-[#F59E0B] shadow-sm' : 'border-[#E7E2D8]'
        }`}
      >
        {/* Floating Score Popups */}
        <div className="pointer-events-none absolute top-4 right-6 flex flex-col items-end gap-1">
          {floatingScores.map((fs) => (
            <span
              key={fs.id}
              className={`animate-float-up font-mono font-bold text-base ${
                fs.isFever ? 'text-[#D97706]' : 'text-[#059669]'
              }`}
            >
              {fs.text}
            </span>
          ))}
        </div>

        {/* Prompt Header */}
        <div className="flex items-center justify-between text-xs text-[#8B7D72]">
          <span>위의 글을 보고 아래 칸에 똑같이 쳐 보세요</span>
          <span className="font-bold text-[#EA580C]">
            {combo > 0 ? `${combo}콤보 연속 성공 중` : '첫 글자부터 차근차근'}
          </span>
        </div>

        {/* TOP: Target Text Display */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="bg-[#FBF9F4] border border-[#EDE7DC] rounded-xl px-5 py-6 cursor-text"
        >
          <p className="text-2xl sm:text-[28px] leading-relaxed font-medium tracking-wide break-keep select-none">
            {(() => {
              const tokens: { text: string; startIdx: number; isSpace: boolean }[] = [];
              let cursor = 0;
              for (const part of currentItem.text.split(/(\s+)/)) {
                if (part.length === 0) continue;
                tokens.push({
                  text: part,
                  startIdx: cursor,
                  isSpace: /^\s+$/.test(part),
                });
                cursor += part.length;
              }

              const renderChar = (ch: string, idx: number) => {
                const state = evaluation.charStates[idx];
                if (state === 'correct') {
                  return (
                    <span key={idx} className="text-[#059669]">
                      {ch}
                    </span>
                  );
                }
                if (state === 'composing') {
                  return (
                    <span
                      key={idx}
                      className="text-[#D97706] bg-[#FEF3C7] rounded px-0.5 underline decoration-2 decoration-[#F59E0B]"
                    >
                      {ch}
                    </span>
                  );
                }
                if (state === 'error') {
                  return (
                    <span
                      key={idx}
                      className="text-[#E11D48] bg-[#FFE4E6] rounded px-0.5 underline decoration-wavy decoration-[#E11D48]"
                    >
                      {ch}
                    </span>
                  );
                }
                const isNextCursor =
                  idx === typed.length && evaluation.errorCount === 0;
                return (
                  <span
                    key={idx}
                    className={
                      isNextCursor
                        ? 'text-[#2C2520] underline decoration-2 decoration-[#F97316] underline-offset-4'
                        : 'text-[#6B5F55]'
                    }
                  >
                    {ch}
                  </span>
                );
              };

              return tokens.map((token, tIdx) => {
                if (token.isSpace) {
                  return token.text
                    .split('')
                    .map((ch, offset) => renderChar(ch, token.startIdx + offset));
                }
                return (
                  <span key={`word_${tIdx}`} className="inline-block whitespace-nowrap">
                    {token.text
                      .split('')
                      .map((ch, offset) => renderChar(ch, token.startIdx + offset))}
                  </span>
                );
              });
            })()}
          </p>

          {nextItem && (
            <p className="mt-3 pt-3 border-t border-[#EDE7DC] text-sm text-[#9C8E82] truncate">
              다음 문장: {nextItem.text}
            </p>
          )}
        </div>

        {/* BOTTOM: Direct Matching Typing Input */}
        <div className="flex flex-col gap-2">
          <div
            className={`relative flex items-center ${shakeInput ? 'animate-gentle-shake' : ''}`}
          >
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={handleCompositionEnd}
              placeholder="여기에 위의 글을 똑같이 입력하세요..."
              aria-label="한글 문장 따라 치기 입력창"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className={`w-full text-xl sm:text-2xl font-medium px-5 py-4 rounded-xl border-2 bg-white text-[#2C2520] placeholder:text-[#B8ACA0] focus:outline-none transition-colors ${
                evaluation.errorCount > 0
                  ? 'border-[#E11D48] focus:border-[#E11D48]'
                  : isFever
                  ? 'border-[#F59E0B] focus:border-[#D97706]'
                  : 'border-[#D9D0C3] focus:border-[#F97316]'
              }`}
            />
            {evaluation.errorCount > 0 && (
              <span className="absolute right-4 text-xs font-bold text-[#E11D48] bg-[#FFF1F2] px-2.5 py-1 rounded-lg">
                오타! 지우고 다시 치기
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#786B61] px-1">
            <span>
              정확히 다 치면 자동으로 넘어가요 · Enter 키로도 완료할 수 있어요
            </span>
            <button
              type="button"
              onClick={() => setShowKeyboard((prev) => !prev)}
              className="font-bold text-[#EA580C] hover:underline cursor-pointer whitespace-nowrap"
            >
              {showKeyboard ? '자판 도우미 숨기기' : '자판 도우미 보기'}
            </button>
          </div>
        </div>

        {/* Educational Meaning Note (Proverbs / Pure Korean words) */}
        {lastMeaning && (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 text-sm text-[#166534]">
            <span className="font-bold mr-2">방금 배운 뜻</span>
            <span>{lastMeaning}</span>
          </div>
        )}
      </div>

      {/* Interactive Korean Keyboard Guide */}
      {showKeyboard && <HangulKeyboardGuide nextHintKey={evaluation.nextHintKey} />}
    </div>
  );
};
