const CHOSEONG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const JUNGSEONG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
];

const JONGSEONG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const COMPOUND_VOWELS: Record<string, string[]> = {
  'ㅘ': ['ㅗ', 'ㅏ'],
  'ㅙ': ['ㅗ', 'ㅐ'],
  'ㅚ': ['ㅗ', 'ㅣ'],
  'ㅝ': ['ㅜ', 'ㅓ'],
  'ㅞ': ['ㅜ', 'ㅔ'],
  'ㅟ': ['ㅜ', 'ㅣ'],
  'ㅢ': ['ㅡ', 'ㅣ'],
};

const DOUBLE_FINALS: Record<string, string[]> = {
  'ㄳ': ['ㄱ', 'ㅅ'],
  'ㄵ': ['ㄴ', 'ㅈ'],
  'ㄶ': ['ㄴ', 'ㅎ'],
  'ㄺ': ['ㄹ', 'ㄱ'],
  'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'],
  'ㄽ': ['ㄹ', 'ㅅ'],
  'ㄾ': ['ㄹ', 'ㅌ'],
  'ㄿ': ['ㄹ', 'ㅍ'],
  'ㅀ': ['ㄹ', 'ㅎ'],
  'ㅄ': ['ㅂ', 'ㅅ'],
};

// Decompose a single character into actual Dubeolsik keystroke jamos
export function decomposeToKeys(char: string): string[] {
  if (!char) return [];
  const code = char.charCodeAt(0);

  // Compatibility Jamo (single consonant/vowel like ㄱ, ㅏ)
  if (code >= 0x3131 && code <= 0x3163) {
    if (COMPOUND_VOWELS[char]) return COMPOUND_VOWELS[char];
    if (DOUBLE_FINALS[char]) return DOUBLE_FINALS[char];
    return [char];
  }

  // Hangul Syllables AC00 - D7A3
  if (code >= 0xac00 && code <= 0xd7a3) {
    const offset = code - 0xac00;
    const choIdx = Math.floor(offset / (21 * 28));
    const jungIdx = Math.floor((offset % (21 * 28)) / 28);
    const jongIdx = offset % 28;

    const keys: string[] = [];
    keys.push(CHOSEONG[choIdx]);

    const jung = JUNGSEONG[jungIdx];
    if (COMPOUND_VOWELS[jung]) {
      keys.push(...COMPOUND_VOWELS[jung]);
    } else {
      keys.push(jung);
    }

    if (jongIdx > 0) {
      const jong = JONGSEONG[jongIdx];
      if (DOUBLE_FINALS[jong]) {
        keys.push(...DOUBLE_FINALS[jong]);
      } else {
        keys.push(jong);
      }
    }
    return keys;
  }

  return [char];
}

// Count total Jamo keystrokes in a string (for accurate Korean CPM / 타수)
export function countHangulKeystrokes(text: string): number {
  let count = 0;
  for (const ch of text) {
    count += decomposeToKeys(ch).length;
  }
  return count;
}

export type CharMatchState = 'correct' | 'composing' | 'error' | 'pending';

export interface TypingEvaluation {
  charStates: CharMatchState[];
  completedCorrectCount: number;
  errorCount: number;
  isExactMatch: boolean;
  nextHintKey: string | null;
}

function isJamoPrefix(prefix: string[], full: string[]): boolean {
  if (prefix.length === 0 || prefix.length > full.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (prefix[i] !== full[i]) return false;
  }
  return true;
}

export function evaluateTypingProgress(
  target: string,
  typed: string,
  isComposing: boolean
): TypingEvaluation {
  const states: CharMatchState[] = new Array(target.length).fill('pending');
  let completedCorrectCount = 0;
  let errorCount = 0;

  for (let i = 0; i < target.length; i++) {
    if (i >= typed.length) {
      states[i] = 'pending';
      continue;
    }

    const tChar = target[i];
    const uChar = typed[i];

    if (uChar === tChar) {
      states[i] = 'correct';
      completedCorrectCount++;
      continue;
    }

    const isLastTyped = i === typed.length - 1;
    if (isLastTyped) {
      const targetKeys = decomposeToKeys(tChar);
      const userKeys = decomposeToKeys(uChar);

      // Case 1: User is partway through typing this syllable (e.g., ㅎ or 하 for 한)
      if (isJamoPrefix(userKeys, targetKeys)) {
        states[i] = 'composing';
        continue;
      }

      // Case 2: Bridge transition during Hangul IME!
      // e.g., Target is "하나", user pressed ㅎ, ㅏ, ㄴ -> browser currently shows "한" at index i!
      // userKeys = [ㅎ, ㅏ, ㄴ], targetKeys = [ㅎ, ㅏ], next target char starts with ㄴ!
      if (
        isComposing &&
        i + 1 < target.length &&
        userKeys.length > targetKeys.length &&
        isJamoPrefix(targetKeys, userKeys)
      ) {
        const extraKeys = userKeys.slice(targetKeys.length);
        const nextTargetKeys = decomposeToKeys(target[i + 1]);
        if (isJamoPrefix(extraKeys, nextTargetKeys)) {
          states[i] = 'correct';
          states[i + 1] = 'composing';
          completedCorrectCount++;
          i++; // skip i+1 as we already marked it composing
          continue;
        }
      }
    }

    states[i] = 'error';
    errorCount++;
  }

  // Extra trailing characters beyond target length count as errors
  if (typed.length > target.length) {
    errorCount += typed.length - target.length;
  }

  // Determine the exact next key to highlight on the keyboard guide
  let nextHintKey: string | null = null;
  for (let i = 0; i < target.length; i++) {
    if (states[i] === 'correct') continue;

    const targetKeys = decomposeToKeys(target[i]);
    if (states[i] === 'composing') {
      const uChar = typed[i];
      if (uChar) {
        const userKeys = decomposeToKeys(uChar);
        if (isJamoPrefix(userKeys, targetKeys) && userKeys.length < targetKeys.length) {
          nextHintKey = targetKeys[userKeys.length];
        } else {
          // Bridge case: already completed target[i] in browser buffer, need next char's 2nd jamo
          nextHintKey = targetKeys[1] ?? targetKeys[0] ?? null;
        }
      } else {
        nextHintKey = targetKeys[1] ?? targetKeys[0] ?? null;
      }
      break;
    }

    if (states[i] === 'error') {
      nextHintKey = 'Backspace';
      break;
    }

    if (states[i] === 'pending') {
      nextHintKey = targetKeys[0] ?? null;
      break;
    }
  }

  return {
    charStates: states,
    completedCorrectCount,
    errorCount,
    isExactMatch: typed === target,
    nextHintKey,
  };
}
