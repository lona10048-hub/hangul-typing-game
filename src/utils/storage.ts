export type GameMode = 'sentence' | 'word' | 'boss' | 'timeattack';

export interface GameRecord {
  id: string;
  mode: GameMode;
  topicLabel: string;
  score: number;
  cpm: number;
  accuracy: number;
  maxCombo: number;
  completedItems: number;
  bossDefeated?: boolean;
  playedAt: string;
}

export interface PlayerProgress {
  totalScore: number;
  gamesPlayed: number;
  bestCpm: number;
  bestAccuracy: number;
  bestMaxCombo: number;
  unlockedStickers: string[];
  history: GameRecord[];
}

const STORAGE_KEY = 'hangul_typing_forest_progress_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  totalScore: 0,
  gamesPlayed: 0,
  bestCpm: 0,
  bestAccuracy: 0,
  bestMaxCombo: 0,
  unlockedStickers: [],
  history: [],
};

export function loadProgress(): PlayerProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      totalScore: typeof parsed.totalScore === 'number' ? parsed.totalScore : 0,
      gamesPlayed: typeof parsed.gamesPlayed === 'number' ? parsed.gamesPlayed : 0,
      bestCpm: typeof parsed.bestCpm === 'number' ? parsed.bestCpm : 0,
      bestAccuracy: typeof parsed.bestAccuracy === 'number' ? parsed.bestAccuracy : 0,
      bestMaxCombo: typeof parsed.bestMaxCombo === 'number' ? parsed.bestMaxCombo : 0,
      unlockedStickers: Array.isArray(parsed.unlockedStickers) ? parsed.unlockedStickers : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetAllProgress(): PlayerProgress {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_PROGRESS;
}

export interface RoundOutcome {
  mode: GameMode;
  topic: string;
  topicLabel: string;
  score: number;
  cpm: number;
  accuracy: number;
  maxCombo: number;
  completedItems: number;
  typoCount: number;
  feverTriggered: boolean;
  bossDefeated: boolean;
}

export function recordGameOutcome(
  current: PlayerProgress,
  outcome: RoundOutcome
): { updated: PlayerProgress; newlyUnlocked: string[] } {
  const newTotalScore = current.totalScore + outcome.score;
  const newGamesPlayed = current.gamesPlayed + 1;
  const newBestCpm = Math.max(current.bestCpm, outcome.cpm);
  const newBestAccuracy = Math.max(current.bestAccuracy, outcome.accuracy);
  const newBestMaxCombo = Math.max(current.bestMaxCombo, outcome.maxCombo);

  const earned = new Set<string>(current.unlockedStickers);
  const newlyUnlocked: string[] = [];

  const checkUnlock = (id: string, condition: boolean) => {
    if (condition && !earned.has(id)) {
      earned.add(id);
      newlyUnlocked.push(id);
    }
  };

  checkUnlock('first_step', outcome.completedItems >= 1);
  checkUnlock('accurate_turtle', outcome.accuracy >= 98 && outcome.completedItems >= 3);
  checkUnlock('fast_200', outcome.cpm >= 200);
  checkUnlock('fast_300', outcome.cpm >= 300);
  checkUnlock('combo_15', outcome.maxCombo >= 15);
  checkUnlock('fever_master', outcome.feverTriggered);
  checkUnlock('boss_slayer', outcome.bossDefeated);
  checkUnlock('word_hunter', outcome.mode === 'word' && outcome.completedItems >= 15);
  checkUnlock('proverb_scholar', outcome.topic === 'proverb' && outcome.completedItems >= 5);
  checkUnlock('perfect_round', outcome.typoCount === 0 && outcome.completedItems >= 5);
  checkUnlock('steady_5', newGamesPlayed >= 5);
  checkUnlock('score_2000', newTotalScore >= 3000);

  const newRecord: GameRecord = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    mode: outcome.mode,
    topicLabel: outcome.topicLabel,
    score: outcome.score,
    cpm: outcome.cpm,
    accuracy: outcome.accuracy,
    maxCombo: outcome.maxCombo,
    completedItems: outcome.completedItems,
    bossDefeated: outcome.bossDefeated,
    playedAt: new Date().toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const updated: PlayerProgress = {
    totalScore: newTotalScore,
    gamesPlayed: newGamesPlayed,
    bestCpm: newBestCpm,
    bestAccuracy: newBestAccuracy,
    bestMaxCombo: newBestMaxCombo,
    unlockedStickers: Array.from(earned),
    history: [newRecord, ...current.history].slice(0, 15),
  };

  saveProgress(updated);
  return { updated, newlyUnlocked };
}
