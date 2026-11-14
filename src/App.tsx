import React, { useCallback, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import stageForestBannerImg from './assets/images/stage_forest_banner_1794635936257.jpg';
import { MascotCompanion, MascotMood } from './components/MascotCompanion';
import { RecordsView } from './components/RecordsView';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { StickerBookView } from './components/StickerBookView';
import { TypingArena } from './components/TypingArena';
import { WordRainGame } from './components/WordRainGame';
import {
  STICKER_BADGES,
  TOPIC_LABELS,
  TopicCategory,
  getPlayerRank,
} from './data/curriculum5th';
import { soundEngine } from './utils/sound';
import {
  GameMode,
  PlayerProgress,
  RoundOutcome,
  loadProgress,
  recordGameOutcome,
  resetAllProgress,
} from './utils/storage';

type ActiveTab = 'home' | 'play' | 'stickers' | 'records';

interface ModeCardInfo {
  mode: GameMode;
  title: string;
  subtitle: string;
  rule: string;
  ctaLabel: string;
}

const MODE_CARDS: ModeCardInfo[] = [
  {
    mode: 'sentence',
    title: '문장 따라치기',
    subtitle: '교과서·속담·과학 문장',
    rule: '위에 뜨는 글을 보고 아래 칸에 똑같이 입력해요. 8문장을 차근차근 완주해 보세요.',
    ctaLabel: '연습 시작',
  },
  {
    mode: 'word',
    title: '낱말 톡톡 게임',
    subtitle: '하늘에서 내려오는 낱말',
    rule: '5학년 필수 낱말이 풀밭에 닿기 전에 똑같이 입력해 잡아요. 황금 낱말은 점수 2배!',
    ctaLabel: '게임 시작',
  },
  {
    mode: 'boss',
    title: '오타 먹구름 대작전',
    subtitle: '협동 타자 보스 배틀',
    rule: '문장을 정확히 완성할 때마다 오타 먹구름에게 타자 공격을 날려 물리쳐요!',
    ctaLabel: '도전하기',
  },
  {
    mode: 'timeattack',
    title: '60초 타임어택',
    subtitle: '스피드 최고 기록 도전',
    rule: '1분 동안 빠르고 정확하게 문장을 입력해 콤보와 피버 점수를 쌓아 보세요.',
    ctaLabel: '기록 도전',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedMode, setSelectedMode] = useState<GameMode>('sentence');
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory>('all');
  const [roundKey, setRoundKey] = useState(0);

  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [muted, setMuted] = useState<boolean>(() => soundEngine.isMuted());

  const [mascotMood, setMascotMood] = useState<MascotMood>('happy');
  const [mascotMessage, setMascotMessage] = useState<string>(
    '안녕! 5학년 친구, 오늘도 다람쥐 토리와 함께 즐겁게 타자 연습을 시작해 볼까?'
  );
  const [liveCombo, setLiveCombo] = useState(0);
  const [liveFever, setLiveFever] = useState(false);

  const [bannerImgError, setBannerImgError] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    outcome: RoundOutcome;
    newlyUnlocked: string[];
  } | null>(null);

  const handleToggleSound = () => {
    const nextMuted = !muted;
    soundEngine.setMuted(nextMuted);
    setMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playClick();
    }
  };

  const handleStartMode = (mode: GameMode) => {
    soundEngine.playClick();
    setSelectedMode(mode);
    setSummaryData(null);
    setLiveCombo(0);
    setLiveFever(false);
    setMascotMood('happy');
    setMascotMessage(
      mode === 'word'
        ? '하늘에서 내려오는 낱말을 보고 아래 칸에 똑같이 쳐 보세요!'
        : mode === 'boss'
        ? '오타 먹구름이 나타났어요! 정확한 타자로 먹구름을 물리쳐요!'
        : mode === 'timeattack'
        ? '60초 동안 집중! 준비되면 바로 첫 글자를 쳐 보세요!'
        : '위에 있는 문장을 보면서 천천히 정확하게 따라 쳐 보세요!'
    );
    setRoundKey((k) => k + 1);
    setActiveTab('play');
  };

  const handleMascotUpdate = useCallback(
    (mood: MascotMood, message: string, combo: number, isFever: boolean) => {
      setMascotMood(mood);
      setMascotMessage(message);
      setLiveCombo(combo);
      setLiveFever(isFever);
    },
    []
  );

  const handleFinishRound = useCallback((outcome: RoundOutcome) => {
    setProgress((prev) => {
      const { updated, newlyUnlocked } = recordGameOutcome(prev, outcome);
      setSummaryData({ outcome, newlyUnlocked });
      return updated;
    });
  }, []);

  const handleResetProgress = () => {
    soundEngine.playClick();
    const fresh = resetAllProgress();
    setProgress(fresh);
  };

  const rank = getPlayerRank(progress.totalScore);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#2C2520]">
      {/* Top Bar: Clean 1-row, 3-zone Contract */}
      <header className="sticky top-0 z-30 bg-[#FBF9F4]/95 backdrop-blur-sm border-b border-[#E7E2D8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('home');
            }}
            className="font-display text-xl sm:text-2xl text-[#2C2520] hover:text-[#EA580C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            토닥토닥 한글 타자 숲
          </button>

          {/* Zone 2: Clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6B5F55]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('home');
              }}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'home'
                  ? 'text-[#2C2520] font-bold border-[#F97316]'
                  : 'border-transparent hover:text-[#2C2520]'
              }`}
            >
              놀이 선택
            </button>
            <button
              type="button"
              onClick={() => handleStartMode(selectedMode)}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'play'
                  ? 'text-[#2C2520] font-bold border-[#F97316]'
                  : 'border-transparent hover:text-[#2C2520]'
              }`}
            >
              타자 연습
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('stickers');
              }}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'stickers'
                  ? 'text-[#2C2520] font-bold border-[#F97316]'
                  : 'border-transparent hover:text-[#2C2520]'
              }`}
            >
              스티커 도감
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('records');
              }}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                activeTab === 'records'
                  ? 'text-[#2C2520] font-bold border-[#F97316]'
                  : 'border-transparent hover:text-[#2C2520]'
              }`}
            >
              내 기록
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action (Sound Toggle) */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={muted ? '효과음 켜기' : '효과음 끄기'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                muted
                  ? 'bg-white border-[#D9D0C3] text-[#786B61] hover:bg-[#F5F2EB]'
                  : 'bg-[#F97316] border-[#F97316] text-white hover:bg-[#EA580C]'
              }`}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{muted ? '효과음 꺼짐' : '효과음 켜짐'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Secondary Tab Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-[#EDE7DC] bg-white px-2 py-1.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'home' ? 'bg-[#FFF7ED] text-[#EA580C] font-bold' : 'text-[#6B5F55]'
            }`}
          >
            놀이 선택
          </button>
          <button
            type="button"
            onClick={() => handleStartMode(selectedMode)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'play' ? 'bg-[#FFF7ED] text-[#EA580C] font-bold' : 'text-[#6B5F55]'
            }`}
          >
            타자 연습
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stickers')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'stickers' ? 'bg-[#FFF7ED] text-[#EA580C] font-bold' : 'text-[#6B5F55]'
            }`}
          >
            스티커 도감
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'records' ? 'bg-[#FFF7ED] text-[#EA580C] font-bold' : 'text-[#6B5F55]'
            }`}
          >
            내 기록
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-6 items-start">
            <div className="flex flex-col gap-6">
              {/* Hero Welcome Split */}
              <section className="bg-white border border-[#E7E2D8] rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-[1.15fr_1fr] items-stretch">
                <div className="p-6 sm:p-8 flex flex-col justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold text-[#059669] mb-2">
                      초등 5학년 맞춤 · 건전하고 바른 우리말 교실
                    </p>
                    <h1 className="font-display text-3xl sm:text-4xl text-[#2C2520] leading-snug">
                      위에 뜨는 글을 보고 똑같이 따라 쳐 봐요
                    </h1>
                    <p className="text-sm sm:text-base text-[#6B5F55] mt-3 leading-relaxed">
                      교과서 우리말, 지혜로운 속담, 과학 탐험, 우리 역사 문장을 치며 타자 실력과
                      어휘력을 함께 키워 보세요.
                    </p>
                  </div>

                  {/* Topic Selector */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-[#786B61]">연습할 주제 고르기</span>
                    <div className="flex flex-wrap gap-1.5 bg-[#F5F2EB] p-1.5 rounded-xl">
                      {(Object.keys(TOPIC_LABELS) as TopicCategory[]).map((tKey) => (
                        <button
                          key={tKey}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            setSelectedTopic(tKey);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            selectedTopic === tKey
                              ? 'bg-white text-[#EA580C] shadow-sm'
                              : 'text-[#6B5F55] hover:text-[#2C2520]'
                          }`}
                        >
                          {TOPIC_LABELS[tKey]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStartMode('sentence')}
                      className="px-6 py-3.5 rounded-xl bg-[#F97316] text-white text-base font-bold hover:bg-[#EA580C] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      문장 따라치기 바로 시작
                    </button>
                  </div>
                </div>

                {/* Right Storybook Artwork */}
                <div className="relative min-h-[220px] bg-[#ECFDF5] border-t md:border-t-0 md:border-l border-[#EDE7DC]">
                  {!bannerImgError ? (
                    <img
                      src={stageForestBannerImg}
                      alt="햇살 가득한 초록 학교 숲길 일러스트"
                      referrerPolicy="no-referrer"
                      onError={() => setBannerImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#DCFCE7] to-[#FEF3C7]">
                      <span className="text-5xl mb-2" aria-hidden="true">
                        🌳
                      </span>
                      <p className="font-display text-xl text-[#166534]">한글 타자 숲</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Quick Progress Summary Strip (Zero-pill clean metrics) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#E7E2D8] rounded-2xl px-4 py-3.5">
                  <p className="text-xs text-[#8B7D72]">나의 등급</p>
                  <p className="font-bold text-sm text-[#EA580C] mt-0.5 truncate">{rank.title}</p>
                </div>
                <div className="bg-white border border-[#E7E2D8] rounded-2xl px-4 py-3.5">
                  <p className="text-xs text-[#8B7D72]">최고 타수</p>
                  <p className="font-mono font-bold text-lg tabular-nums text-[#2C2520]">
                    {progress.bestCpm}타
                  </p>
                </div>
                <div className="bg-white border border-[#E7E2D8] rounded-2xl px-4 py-3.5">
                  <p className="text-xs text-[#8B7D72]">누적 점수</p>
                  <p className="font-mono font-bold text-lg tabular-nums text-[#059669]">
                    {progress.totalScore.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white border border-[#E7E2D8] rounded-2xl px-4 py-3.5">
                  <p className="text-xs text-[#8B7D72]">칭찬 스티커</p>
                  <p className="font-mono font-bold text-lg tabular-nums text-[#0284C7]">
                    {progress.unlockedStickers.length} / {STICKER_BADGES.length}
                  </p>
                </div>
              </div>

              {/* 4 Game Modes Grid */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-2xl text-[#2C2520]">재미있는 타자 놀이</h2>
                  <span className="text-xs text-[#8B7D72]">
                    선택된 주제: {TOPIC_LABELS[selectedTopic]}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MODE_CARDS.map((card) => (
                    <div
                      key={card.mode}
                      className="bg-white border border-[#E7E2D8] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[#F97316] transition-colors"
                    >
                      <div>
                        <p className="text-xs text-[#8B7D72]">{card.subtitle}</p>
                        <h3 className="font-display text-xl text-[#2C2520] mt-1">{card.title}</h3>
                        <p className="text-sm text-[#574C43] mt-2 leading-relaxed">{card.rule}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStartMode(card.mode)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#FFF7ED] border border-[#FDE2C8] text-[#C2410C] text-sm font-bold hover:bg-[#F97316] hover:text-white hover:border-[#F97316] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {card.ctaLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Mascot Sidebar */}
            <MascotCompanion
              mood={mascotMood}
              message={mascotMessage}
              combo={liveCombo}
              isFever={liveFever}
              totalScore={progress.totalScore}
            />
          </div>
        )}

        {activeTab === 'play' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-6 items-start">
            <div>
              {selectedMode === 'word' ? (
                <WordRainGame
                  key={`word_${roundKey}`}
                  onMascotUpdate={handleMascotUpdate}
                  onFinishRound={handleFinishRound}
                  onExit={() => setActiveTab('home')}
                />
              ) : (
                <TypingArena
                  key={`${selectedMode}_${selectedTopic}_${roundKey}`}
                  mode={selectedMode}
                  topic={selectedTopic}
                  onMascotUpdate={handleMascotUpdate}
                  onFinishRound={handleFinishRound}
                  onExit={() => setActiveTab('home')}
                />
              )}
            </div>

            <MascotCompanion
              mood={mascotMood}
              message={mascotMessage}
              combo={liveCombo}
              isFever={liveFever}
              totalScore={progress.totalScore}
            />
          </div>
        )}

        {activeTab === 'stickers' && (
          <StickerBookView
            unlockedIds={progress.unlockedStickers}
            onStartPractice={() => handleStartMode('sentence')}
          />
        )}

        {activeTab === 'records' && (
          <RecordsView
            progress={progress}
            onResetProgress={handleResetProgress}
            onStartPractice={() => handleStartMode('sentence')}
          />
        )}
      </main>

      {/* Round Summary Modal */}
      {summaryData && (
        <RoundSummaryModal
          outcome={summaryData.outcome}
          newlyUnlockedIds={summaryData.newlyUnlocked}
          onPlayAgain={() => handleStartMode(selectedMode)}
          onGoHome={() => {
            setSummaryData(null);
            setActiveTab('home');
          }}
        />
      )}
    </div>
  );
}
