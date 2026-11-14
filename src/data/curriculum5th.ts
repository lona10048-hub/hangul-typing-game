export type TopicCategory = 'all' | 'korean' | 'proverb' | 'science' | 'history';

export interface SentenceItem {
  id: string;
  topic: Exclude<TopicCategory, 'all'>;
  text: string;
  meaning?: string;
}

export interface WordItem {
  id: string;
  word: string;
  hint: string;
}

export interface StickerBadge {
  id: string;
  title: string;
  description: string;
  symbol: string;
  accentColor: string;
}

export const TOPIC_LABELS: Record<TopicCategory, string> = {
  all: '전체 주제',
  korean: '교과서 우리말',
  proverb: '지혜 속담',
  science: '과학 탐험',
  history: '역사·사회',
};

export const SENTENCES_5TH: SentenceItem[] = [
  // 교과서 우리말 (5학년 국어·어휘·바른 말)
  {
    id: 'k1',
    topic: 'korean',
    text: '윤슬이 반짝이는 강가를 따라 친구들과 걸었습니다.',
    meaning: '윤슬: 햇빛이나 달빛에 비치어 반짝이는 잔물결',
  },
  {
    id: 'k2',
    topic: 'korean',
    text: '다섯 번째 학년이 되어 새로운 목표를 세웠습니다.',
  },
  {
    id: 'k3',
    topic: 'korean',
    text: '반드시 약속을 지키겠다는 마음을 다졌습니다.',
    meaning: '맞춤법 팁: "꼭"이라는 뜻일 때는 "반드시"라고 써요.',
  },
  {
    id: 'k4',
    topic: 'korean',
    text: '시나브로 봄이 찾아와 교정에 꽃망울이 터졌습니다.',
    meaning: '시나브로: 모르는 사이에 조금씩 조금씩',
  },
  {
    id: 'k5',
    topic: 'korean',
    text: '친구의 이야기를 귀 기울여 듣는 태도가 중요합니다.',
  },
  {
    id: 'k6',
    topic: 'korean',
    text: '글을 읽을 때는 글쓴이의 생각과 까닭을 파악해야 합니다.',
  },
  {
    id: 'k7',
    topic: 'korean',
    text: '바르고 고운 말을 사용하면 서로의 기분이 좋아집니다.',
  },
  {
    id: 'k8',
    topic: 'korean',
    text: '도란도란 이야기를 나누며 즐거운 점심시간을 보냈습니다.',
    meaning: '도란도란: 여럿이 나직한 목소리로 정겹게 이야기하는 소리',
  },
  {
    id: 'k9',
    topic: 'korean',
    text: '어려운 낱말은 국어사전에서 뜻을 찾아보면 금방 알 수 있습니다.',
  },
  {
    id: 'k10',
    topic: 'korean',
    text: '문단의 중심 문장과 뒷받침 문장을 잘 구분해 봅시다.',
  },

  // 지혜 속담 (5학년 필수 속담과 뜻 풀이)
  {
    id: 'p1',
    topic: 'proverb',
    text: '가는 말이 고와야 오는 말이 곱다.',
    meaning: '내가 먼저 친절하게 말해야 상대방도 따뜻하게 대답해요.',
  },
  {
    id: 'p2',
    topic: 'proverb',
    text: '티끌 모아 태산이라는 말을 잊지 마세요.',
    meaning: '작은 노력도 꾸준히 모으면 큰 결과를 이룰 수 있어요.',
  },
  {
    id: 'p3',
    topic: 'proverb',
    text: '천 리 길도 한 걸음부터 시작됩니다.',
    meaning: '아무리 큰 일도 작은 시작부터 차근차근 해야 해요.',
  },
  {
    id: 'p4',
    topic: 'proverb',
    text: '백지장도 맞들면 낫다는 지혜를 기억해요.',
    meaning: '쉬운 일이라도 여러 사람이 힘을 합치면 훨씬 수월해요.',
  },
  {
    id: 'p5',
    topic: 'proverb',
    text: '돌다리도 두들겨 보고 건너라는 말이 있습니다.',
    meaning: '잘 아는 일이라도 실수하지 않도록 꼼꼼히 확인해야 해요.',
  },
  {
    id: 'p6',
    topic: 'proverb',
    text: '낮말은 새가 듣고 밤말은 쥐가 듣는다.',
    meaning: '아무도 없을 때라도 말조심을 해야 한다는 뜻이에요.',
  },
  {
    id: 'p7',
    topic: 'proverb',
    text: '세 살 버릇 여든까지 간다고 합니다.',
    meaning: '어릴 때 들인 좋은 습관은 어른이 되어서도 오래 남아요.',
  },
  {
    id: 'p8',
    topic: 'proverb',
    text: '구슬이 서 말이라도 꿰어야 보배입니다.',
    meaning: '아무리 좋은 재료나 지식도 잘 정리하고 활용해야 빛이 나요.',
  },
  {
    id: 'p9',
    topic: 'proverb',
    text: '원숭이도 나무에서 떨어질 때가 있습니다.',
    meaning: '아무리 익숙하고 잘하는 일도 방심하면 실수할 수 있어요.',
  },
  {
    id: 'p10',
    topic: 'proverb',
    text: '시작이 반이라는 마음으로 도전해 봅시다.',
    meaning: '망설이지 않고 첫발을 내딛으면 절반은 해낸 것과 같아요.',
  },

  // 과학 탐험 (5학년 과학 교과)
  {
    id: 's1',
    topic: 'science',
    text: '태양계의 행성들은 태양 주위를 일정한 궤도로 돕니다.',
  },
  {
    id: 's2',
    topic: 'science',
    text: '식물은 햇빛과 물을 이용해 스스로 양분을 만듭니다.',
    meaning: '광합성: 식물이 빛 에너지를 이용해 양분을 만드는 과정',
  },
  {
    id: 's3',
    topic: 'science',
    text: '생태계에서는 생산자와 소비자가 서로 영향을 주고받습니다.',
  },
  {
    id: 's4',
    topic: 'science',
    text: '온도가 높아지면 고체가 액체에 더 빨리 용해됩니다.',
  },
  {
    id: 's5',
    topic: 'science',
    text: '공기 중의 수증기가 식으면 작은 물방울인 구름이 됩니다.',
  },
  {
    id: 's6',
    topic: 'science',
    text: '물체의 빠르기는 이동 거리와 걸린 시간으로 비교합니다.',
  },
  {
    id: 's7',
    topic: 'science',
    text: '지구는 하루에 한 바퀴씩 자전하여 낮과 밤이 생깁니다.',
  },
  {
    id: 's8',
    topic: 'science',
    text: '산성 용액과 염기성 용액을 구분할 때 지시약을 사용합니다.',
  },

  // 역사·사회 (5학년 사회·역사 교과)
  {
    id: 'h1',
    topic: 'history',
    text: '세종대왕은 백성들이 글을 쉽게 배우도록 훈민정음을 창제했습니다.',
  },
  {
    id: 'h2',
    topic: 'history',
    text: '이순신 장군은 거북선과 함께 나라를 굳건히 지켜냈습니다.',
  },
  {
    id: 'h3',
    topic: 'history',
    text: '모두의 의견이 소중하므로 서로 존중하며 대화해야 합니다.',
  },
  {
    id: 'h4',
    topic: 'history',
    text: '우리나라의 사계절은 봄 여름 가을 겨울의 특징이 뚜렷합니다.',
  },
  {
    id: 'h5',
    topic: 'history',
    text: '고구려 백제 신라는 서로 영향을 주고받으며 문화를 발전시켰습니다.',
  },
  {
    id: 'h6',
    topic: 'history',
    text: '국토를 아끼고 환경을 보호하는 것은 우리 모두의 약속입니다.',
  },
  {
    id: 'h7',
    topic: 'history',
    text: '법은 모든 사람이 안전하고 평화롭게 살아가도록 도와줍니다.',
  },
  {
    id: 'h8',
    topic: 'history',
    text: '장영실은 해시계 앙부일구와 물시계 자격루를 만들었습니다.',
  },
];

export const WORDS_5TH: WordItem[] = [
  { id: 'w1', word: '훈민정음', hint: '세종대왕이 만든 우리 글자' },
  { id: 'w2', word: '광합성', hint: '식물이 햇빛으로 양분을 만드는 일' },
  { id: 'w3', word: '태양계', hint: '태양과 그 주위를 도는 행성들' },
  { id: 'w4', word: '협동심', hint: '서로 힘을 합치는 마음' },
  { id: 'w5', word: '윤슬', hint: '햇빛에 반짝이는 잔물결' },
  { id: 'w6', word: '시나브로', hint: '모르는 사이에 조금씩' },
  { id: 'w7', word: '도란도란', hint: '정겹게 이야기를 나누는 모습' },
  { id: 'w8', word: '미리내', hint: '은하수의 순우리말' },
  { id: 'w9', word: '가온길', hint: '세상의 중심이 되는 바른 길' },
  { id: 'w10', word: '다람쥐', hint: '도토리를 좋아하는 숲속 친구' },
  { id: 'w11', word: '무지개', hint: '비 온 뒤 하늘에 뜨는 일곱 빛깔' },
  { id: 'w12', word: '별자리', hint: '밤하늘의 별들을 이어 만든 그림' },
  { id: 'w13', word: '현미경', hint: '작은 물체를 크게 확대해 보는 도구' },
  { id: 'w14', word: '거북선', hint: '이순신 장군이 활약한 우리나라 배' },
  { id: 'w15', word: '앙부일구', hint: '조선 시대에 만든 해시계' },
  { id: 'w16', word: '자격루', hint: '시간을 알려 주는 자동 물시계' },
  { id: 'w17', word: '독도', hint: '우리나라 동쪽 끝의 소중한 섬' },
  { id: 'w18', word: '무궁화', hint: '우리나라를 상징하는 꽃' },
  { id: 'w19', word: '백두산', hint: '한반도에서 가장 높은 산' },
  { id: 'w20', word: '한라산', hint: '제주도 가운데에 우뚝 솟은 산' },
  { id: 'w21', word: '도서관', hint: '다양한 책이 모여 있는 배움터' },
  { id: 'w22', word: '받아쓰기', hint: '문장을 듣고 정확히 적어 보는 연습' },
  { id: 'w23', word: '속력', hint: '단위 시간 동안 물체가 이동한 거리' },
  { id: 'w24', word: '생태계', hint: '생물과 환경이 서로 어울려 사는 곳' },
  { id: 'w25', word: '민들레', hint: '노란 꽃이 피고 하얀 홀씨가 날리는 풀' },
  { id: 'w26', word: '해바라기', hint: '해를 따라 고개를 돌리는 여름 꽃' },
  { id: 'w27', word: '호기심', hint: '새롭고 신기한 것을 알고 싶은 마음' },
  { id: 'w28', word: '슬기롭다', hint: '사리에 밝고 지혜롭다' },
  { id: 'w29', word: '청량하다', hint: '맑고 서늘하여 기분이 상쾌하다' },
  { id: 'w30', word: '운동회', hint: '친구들과 함께 뛰며 응원하는 날' },
  { id: 'w31', word: '사물놀이', hint: '꽹과리 징 장구 북으로 하는 전통 음악' },
  { id: 'w32', word: '인공위성', hint: '지구 주위를 돌며 관측하는 우주 기기' },
  { id: 'w33', word: '단풍잎', hint: '가을이면 붉고 노랗게 물드는 나뭇잎' },
  { id: 'w34', word: '소나무', hint: '사계절 내내 푸른 잎을 간직한 나무' },
  { id: 'w35', word: '천리안', hint: '멀리까지 내다보는 밝은 눈' },
  { id: 'w36', word: '지시약', hint: '용액의 성질에 따라 색이 변하는 물질' },
];

export const STICKER_BADGES: StickerBadge[] = [
  {
    id: 'first_step',
    title: '첫 도토리 발걸음',
    description: '한글 타자 연습을 처음으로 완료했어요',
    symbol: '🌰',
    accentColor: '#D97706',
  },
  {
    id: 'accurate_turtle',
    title: '꼼꼼한 거북이',
    description: '한 판에서 정확도 98% 이상을 달성했어요',
    symbol: '🐢',
    accentColor: '#059669',
  },
  {
    id: 'fast_200',
    title: '번개 손가락',
    description: '평균 타수 200타 이상을 기록했어요',
    symbol: '⚡',
    accentColor: '#0284C7',
  },
  {
    id: 'fast_300',
    title: '타자 질주왕',
    description: '평균 타수 300타 이상을 돌파했어요',
    symbol: '🚀',
    accentColor: '#7C3AED',
  },
  {
    id: 'combo_15',
    title: '리듬 타자 15콤보',
    description: '오타 없이 15번 연속으로 성공했어요',
    symbol: '🎵',
    accentColor: '#EA580C',
  },
  {
    id: 'fever_master',
    title: '피버 타임 마스터',
    description: '10콤보 이상으로 피버 타임을 발동했어요',
    symbol: '🌟',
    accentColor: '#EAB308',
  },
  {
    id: 'boss_slayer',
    title: '먹구름 퇴치사',
    description: '오타 먹구름 보스를 물리쳤어요',
    symbol: '🛡️',
    accentColor: '#DC2626',
  },
  {
    id: 'word_hunter',
    title: '낱말 톡톡 사냥꾼',
    description: '낱말 톡톡에서 15개 이상 성공했어요',
    symbol: '🎯',
    accentColor: '#0D9488',
  },
  {
    id: 'proverb_scholar',
    title: '속담 박사님',
    description: '지혜 속담 주제로 1판을 완료했어요',
    symbol: '📜',
    accentColor: '#B45309',
  },
  {
    id: 'perfect_round',
    title: '무결점 한글 지킴이',
    description: '오타 0개로 한 판을 완벽하게 마쳤어요',
    symbol: '💎',
    accentColor: '#2563EB',
  },
  {
    id: 'steady_5',
    title: '꾸준한 연습생',
    description: '총 5판 이상 타자 연습을 완료했어요',
    symbol: '🌱',
    accentColor: '#16A34A',
  },
  {
    id: 'score_2000',
    title: '5학년 타자 우등생',
    description: '누적 점수 3,000점을 돌파했어요',
    symbol: '🏆',
    accentColor: '#D97706',
  },
];

export function getPlayerRank(totalScore: number): { title: string; nextTitle: string; progressPct: number } {
  const tiers = [
    { min: 0, title: '새싹 타자 친구' },
    { min: 500, title: '도토리 타자 탐험가' },
    { min: 1500, title: '다람쥐 타자 기사' },
    { min: 3000, title: '초록숲 타자 명인' },
    { min: 6000, title: '은하수 타자 대장' },
  ];

  let currentIdx = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (totalScore >= tiers[i].min) {
      currentIdx = i;
    }
  }

  const current = tiers[currentIdx];
  const next = tiers[currentIdx + 1];
  if (!next) {
    return { title: current.title, nextTitle: '최고 등급 달성!', progressPct: 100 };
  }

  const range = next.min - current.min;
  const gained = totalScore - current.min;
  return {
    title: current.title,
    nextTitle: next.title,
    progressPct: Math.min(100, Math.round((gained / range) * 100)),
  };
}
