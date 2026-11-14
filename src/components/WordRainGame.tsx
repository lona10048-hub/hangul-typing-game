import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WORDS_5TH, WordItem } from '../data/curriculum5th';
import { countHangulKeystrokes } from '../utils/hangul';
import { soundEngine } from '../utils/sound';
import { RoundOutcome } from '../utils/storage';
import { MascotMood } from './MascotCompanion';

interface ActiveWordCard {
  uid: string;
  item: WordItem;
  lane: number; // 0..3
  yPct: number; // 0..100
  speed: number;
  kind: 'normal' | 'golden' | 'heart';
}

interface WordRainGameProps {
  onMascotUpdate: (mood: MascotMood, message: string, combo: number, isFever: boolean) => void;
  onFinishRound: (outcome: RoundOutcome) => void;
  onExit: () => void;
}

const TARGET_WORDS_GOAL = 20;

export const WordRainGame: React.FC<WordRainGameProps> = ({
  onMascotUpdate,
  onFinishRound,
  onExit,
}) => {
  const [cards, setCards] = useState<ActiveWordCard[]>([]);
  const [typed, setTyped] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feverTriggered, setFeverTriggered] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [typoCount, setTypoCount] = useState(0);
  const [totalJamos, setTotalJamos] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [lastHint, setLastHint] = useState<{ word: string; hint: string } | null>(null);
  const [shakeInput, setShakeInput] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const finishedRef = useRef(false);
  const wordQueueIndexRef = useRef(0);

  const shuffledWords = useMemo(() => {
    const copy = [...WORDS_5TH];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, []);

  const isFever = combo >= 10;

  const spawnCard = (existing: ActiveWordCard[]): ActiveWordCard => {
    const item = shuffledWords[wordQueueIndexRef.current % shuffledWords.length];
    wordQueueIndexRef.current += 1;

    // Pick a lane that has no card near the top
    const lanes = [0, 1, 2, 3];
    const freeLanes = lanes.filter(
      (lane) => !existing.some((c) => c.lane === lane && c.yPct < 24)
    );
    const lane =
      freeLanes.length > 0
        ? freeLanes[Math.floor(Math.random() * freeLanes.length)]
        : Math.floor(Math.random() * 4);

    const roll = Math.random();
    const kind: ActiveWordCard['kind'] =
      roll < 0.14 ? 'golden' : roll < 0.22 ? 'heart' : 'normal';

    const levelBoost = Math.min(completedCount * 0.035, 0.7);
    return {
      uid: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      item,
      lane,
      yPct: 4,
      speed: 0.42 + levelBoost + Math.random() * 0.14,
      kind,
    };
  };

  const cardsRef = useRef<ActiveWordCard[]>([]);
  const statsRef = useRef({
    completedCount: 0,
    score: 0,
    totalJamos: 0,
    maxCombo: 0,
    typoCount: 0,
    hearts: 5,
  });

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    const initial = [spawnCard([])];
    cardsRef.current = initial;
    setCards(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endGame = (
    finalCompleted: number,
    finalScore: number,
    finalJamos: number,
    finalMaxCombo: number,
    finalTypos: number
  ) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    soundEngine.playStageClear();

    const elapsedMin = Math.max((Date.now() - startTimeRef.current) / 60000, 0.05);
    const cpm = Math.min(Math.round(finalJamos / elapsedMin), 999);
    const totalTries = Math.max(finalCompleted + finalTypos, 1);
    const accuracy = Math.max(
      0,
      Math.min(100, Math.round((finalCompleted / totalTries) * 100))
    );

    onMascotUpdate('victory', '우와! 낱말들을 정말 빠르게 잡았어요!', combo, isFever);

    onFinishRound({
      mode: 'word',
      topic: 'korean',
      topicLabel: '5학년 핵심 낱말',
      score: finalScore,
      cpm,
      accuracy: finalCompleted === 0 ? 0 : accuracy,
      maxCombo: finalMaxCombo,
      completedItems: finalCompleted,
      typoCount: finalTypos,
      feverTriggered,
      bossDefeated: false,
    });
  };

  // Game animation loop for falling word cards
  useEffect(() => {
    const tick = window.setInterval(() => {
      if (finishedRef.current) return;

      const currentCards = cardsRef.current;
      let missedCount = 0;
      const moved = currentCards.map((c) => ({ ...c, yPct: c.yPct + c.speed }));
      const remaining = moved.filter((c) => {
        if (c.yPct >= 86) {
          missedCount += 1;
          return false;
        }
        return true;
      });

      const desiredCount = Math.min(4, 2 + Math.floor(statsRef.current.completedCount / 6));
      while (remaining.length < desiredCount) {
        remaining.push(spawnCard(remaining));
      }

      cardsRef.current = remaining;
      setCards(remaining);

      if (missedCount > 0) {
        soundEngine.playTypo();
        setCombo(0);
        onMascotUpdate('typo', '낱말이 땅에 닿았어요! 다음 낱말을 잡아봐요.', 0, false);
        const nextHearts = Math.max(0, statsRef.current.hearts - missedCount);
        statsRef.current.hearts = nextHearts;
        setHearts(nextHearts);
        if (nextHearts <= 0) {
          endGame(
            statsRef.current.completedCount,
            statsRef.current.score,
            statsRef.current.totalJamos,
            statsRef.current.maxCombo,
            statsRef.current.typoCount
          );
        }
      }
    }, 60);

    return () => window.clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryMatchWord = (rawValue: string, allowSubmitError: boolean) => {
    const clean = rawValue.trim();
    if (!clean || finishedRef.current) return false;

    const matched = cardsRef.current.find((c) => c.item.word === clean);
    if (matched) {
      const nextCombo = combo + 1;
      const nextMaxCombo = Math.max(maxCombo, nextCombo);
      const feverNow = nextCombo >= 10;
      if (feverNow && !feverTriggered) {
        setFeverTriggered(true);
        soundEngine.playFeverStart();
      } else {
        soundEngine.playWordComplete(nextCombo);
      }

      const basePts = matched.kind === 'golden' ? 160 : 80;
      const gained = Math.round(basePts * (feverNow ? 2 : 1));
      const nextScore = score + gained;
      const nextCompleted = completedCount + 1;
      const nextJamos = totalJamos + countHangulKeystrokes(matched.item.word);

      statsRef.current.score = nextScore;
      statsRef.current.completedCount = nextCompleted;
      statsRef.current.totalJamos = nextJamos;
      statsRef.current.maxCombo = nextMaxCombo;

      setScore(nextScore);
      setCombo(nextCombo);
      setMaxCombo(nextMaxCombo);
      setCompletedCount(nextCompleted);
      setTotalJamos(nextJamos);
      setLastHint({ word: matched.item.word, hint: matched.item.hint });
      setTyped('');
      setIsComposing(false);

      if (matched.kind === 'heart') {
        const healedHearts = Math.min(5, statsRef.current.hearts + 1);
        statsRef.current.hearts = healedHearts;
        setHearts(healedHearts);
      }

      const filtered = cardsRef.current.filter((c) => c.uid !== matched.uid);
      if (filtered.length < 2) {
        filtered.push(spawnCard(filtered));
      }
      cardsRef.current = filtered;
      setCards(filtered);

      if (feverNow) {
        onMascotUpdate('fever', '피버 타임! 황금 속도로 낱말을 잡아요!', nextCombo, true);
      } else {
        onMascotUpdate(
          'cheering',
          `"${matched.item.word}" 정답! ${nextCombo}콤보 중이에요!`,
          nextCombo,
          false
        );
      }

      if (nextCompleted >= TARGET_WORDS_GOAL) {
        window.setTimeout(() => {
          endGame(nextCompleted, nextScore, nextJamos, nextMaxCombo, statsRef.current.typoCount);
        }, 250);
      }

      return true;
    }

    if (allowSubmitError) {
      soundEngine.playTypo();
      const nextTypos = typoCount + 1;
      statsRef.current.typoCount = nextTypos;
      setTypoCount(nextTypos);
      setCombo(0);
      setTyped('');
      setShakeInput(true);
      window.setTimeout(() => setShakeInput(false), 240);
      onMascotUpdate('typo', '아쉬워요! 위에 떠 있는 낱말을 보고 다시 쳐 봐요.', 0, false);
    }

    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTyped(val);
    const nativeComposing = (e.nativeEvent as InputEvent).isComposing ?? isComposing;

    if (val.endsWith(' ')) {
      tryMatchWord(val, true);
      return;
    }

    if (val.length > typed.length) {
      soundEngine.playKeyTick(combo);
    }

    if (!nativeComposing) {
      tryMatchWord(val, false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      tryMatchWord(typed, true);
    }
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    tryMatchWord(e.currentTarget.value, false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top HUD */}
      <div className="bg-white border border-[#E7E2D8] rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
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
            낱말 톡톡 게임
          </span>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <div>
            <span className="text-xs text-[#8B7D72] mr-1.5">점수</span>
            <span className="font-mono font-bold tabular-nums text-[#EA580C]">{score}</span>
          </div>
          <div>
            <span className="text-xs text-[#8B7D72] mr-1.5">잡은 낱말</span>
            <span className="font-mono font-bold tabular-nums text-[#2C2520]">
              {completedCount} / {TARGET_WORDS_GOAL}
            </span>
          </div>
          <div>
            <span className="text-xs text-[#8B7D72] mr-1.5">하트</span>
            <span className="text-[#E11D48] tracking-wider">
              {'♥'.repeat(hearts)}
              <span className="text-[#E7E2D8]">{'♥'.repeat(5 - hearts)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Falling Word Stage */}
      <div className="bg-white border border-[#E7E2D8] rounded-2xl p-5 flex flex-col gap-4">
        <div
          onClick={() => inputRef.current?.focus()}
          className="relative w-full h-[340px] rounded-xl border border-[#EDE7DC] bg-gradient-to-b from-[#F0F9FF] via-[#F8FAFC] to-[#ECFDF5] overflow-hidden cursor-text"
        >
          {/* Subtle grass line at the bottom */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-[#D1FAE5] border-t border-[#A7F3D0] flex items-center justify-center text-xs font-medium text-[#065F46]">
            초록 풀밭에 닿기 전에 아래 칸에 똑같이 입력하세요
          </div>

          {/* Active Word Cards */}
          {cards.map((card) => {
            const isTargeting =
              typed.trim().length > 0 && card.item.word.startsWith(typed.trim());
            const leftPct = 8 + card.lane * 22;

            return (
              <div
                key={card.uid}
                style={{
                  top: `${card.yPct}%`,
                  left: `${leftPct}%`,
                }}
                className={`absolute px-4 py-2 rounded-xl border font-bold text-lg sm:text-xl shadow-sm transition-transform duration-75 select-none whitespace-nowrap ${
                  isTargeting
                    ? 'bg-[#FFF7ED] border-[#F97316] text-[#C2410C] scale-105 z-10'
                    : card.kind === 'golden'
                    ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
                    : card.kind === 'heart'
                    ? 'bg-[#FFF1F2] border-[#FB7185] text-[#9F1239]'
                    : 'bg-white border-[#D6CFC2] text-[#2C2520]'
                }`}
              >
                {card.kind === 'golden' && <span className="mr-1.5 text-sm">★</span>}
                {card.kind === 'heart' && <span className="mr-1.5 text-sm">♥</span>}
                {card.item.word}
              </div>
            );
          })}
        </div>

        {/* Input Box directly underneath */}
        <div className={`relative ${shakeInput ? 'animate-gentle-shake' : ''}`}>
          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={handleCompositionEnd}
            placeholder="내려오는 낱말을 똑같이 치고 Enter 또는 띄어쓰기!"
            aria-label="낱말 입력창"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full text-xl font-medium px-5 py-3.5 rounded-xl border-2 border-[#D9D0C3] bg-white text-[#2C2520] placeholder:text-[#B8ACA0] focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {lastHint && (
          <div className="bg-[#F8F6F1] border border-[#E7E2D8] rounded-xl px-4 py-2.5 text-sm text-[#3F362E]">
            <span className="font-bold text-[#EA580C] mr-2">{lastHint.word}</span>
            <span>{lastHint.hint}</span>
          </div>
        )}
      </div>
    </div>
  );
};
