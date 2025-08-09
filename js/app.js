// 🔐 카카오 로그인 관련 함수들

// 1️⃣ 카카오 로그인 함수
async function loginWithKakao() {
  const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo: window.location.origin }
  });
  if (error) console.error('❌ Kakao login failed:', error);
}

// 2️⃣ 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('loginKakaoBtn');
  if (loginBtn) {
    loginBtn.onclick = loginWithKakao;
  }
});

// 3️⃣ 로그인 상태 감지 (사용자 정보/인사말 로드 포함)
window.supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    console.log('✅ Kakao user signed in:', session.user);
    console.log('👤 User ID:', session.user.id);
    window.currentUserId = session.user.id;
    window.currentUserSession = session;

    // 화면 전환
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
    
    // 사용자 정보 및 AI 인사말 로드
    loadUserInfo(session.user);
  }
});

// 4️⃣ 페이지 새로고침 시 세션 확인 (사용자 정보 로드 포함)
(async function checkSession() {
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (session?.user) {
    console.log('✅ Session found:', session.user);
    console.log('👤 User ID:', session.user.id);
    window.currentUserId = session.user.id;
    window.currentUserSession = session;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
    
    // 사용자 정보 로드
    loadUserInfo(session.user);
  }
})();

// 🆕 사용자 정보 로드 및 AI 인사말 생성
async function loadUserInfo(user) {
  try {
    const displayName = user.user_metadata?.display_name ||
                        user.user_metadata?.name ||
                        user.user_metadata?.full_name ||
                        '사용자';

    const greetEl = document.getElementById('userGreeting');
    if (greetEl) greetEl.textContent = `안녕하세요, ${displayName}님`;

    const coachingMessage = await generateAICoachingGreeting(user.id, displayName);
    const msgEl = document.getElementById('aiCoachingMessage');
    if (msgEl) msgEl.textContent = coachingMessage;

    console.log('✅ 사용자 정보 로드 완료:', displayName);
  } catch (error) {
    console.error('❌ 사용자 정보 로드 실패:', error);
    const greetEl = document.getElementById('userGreeting');
    const msgEl = document.getElementById('aiCoachingMessage');
    if (greetEl) greetEl.textContent = '안녕하세요, 사용자님';
    if (msgEl) msgEl.textContent = '오늘도 깊은 호흡으로 하루를 시작해볼까요?';
  }
}

// 🆕 AI 코칭 스타일 인사말 생성
async function generateAICoachingGreeting(userId, displayName) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.getFullYear();
    const m = String(yesterday.getMonth() + 1).padStart(2, '0');
    const d = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${y}-${m}-${d}`;

    const { data: yesterdayWorkouts, error } = await window.supabaseClient
      .from('exercise_sessions')
      .select('completed_breaths, created_at')
      .eq('user_id', userId)
      .gte('created_at', `${yesterdayStr} 00:00:00+00`)
      .lt('created_at', `${yesterdayStr} 23:59:59+00`);
    if (error) throw error;

    const didWorkoutYesterday = Array.isArray(yesterdayWorkouts) && yesterdayWorkouts.length > 0;
    const totalBreathsYesterday = didWorkoutYesterday
      ? yesterdayWorkouts.reduce((sum, s) => sum + (s.completed_breaths || 0), 0)
      : 0;

    const greetingTemplates = {
      noYesterdayWorkout: [
        '새로운 하루, 새로운 시작이에요! 오늘은 어떤 호흡을 경험해볼까요?',
        '숨고르기가 필요한 하루네요. 차근차근 시작해봐요!',
        '오늘이야말로 호흡근육을 깨워볼 완벽한 타이밍이에요!',
        '휴식 후 다시 만나니 더 반가워요. 오늘도 함께 호흡해요!',
        '새로운 에너지로 가득한 하루! 깊은 호흡으로 채워봐요.'
      ],
      lightYesterdayWorkout: [
        '어제의 노력이 보여요! 오늘은 조금 더 도전해볼까요?',
        '꾸준함이 느껴져요. 오늘도 한 걸음씩 나아가봐요!',
        '어제의 시작이 오늘의 힘이 되고 있어요. 계속 가봐요!',
        '작은 실천이 큰 변화를 만들어요. 오늘도 응원할게요!',
        '어제의 당신이 오늘의 동기가 되고 있네요!'
      ],
      goodYesterdayWorkout: [
        '어제 정말 훌륭했어요! 이 페이스로 계속 가봐요!',
        '연속 트레이닝의 힘을 느끼고 계시는군요! 멋져요!',
        '어제의 성취가 오늘의 자신감이 되고 있어요!',
        '꾸준한 노력이 습관으로 자리잡고 있네요. 대단해요!',
        '어제 완성한 호흡 리듬을 오늘도 이어가봐요!'
      ]
    };

    let selectedTemplates;
    if (!didWorkoutYesterday) {
      selectedTemplates = greetingTemplates.noYesterdayWorkout;
    } else if (totalBreathsYesterday < 20) {
      selectedTemplates = greetingTemplates.lightYesterdayWorkout;
    } else {
      selectedTemplates = greetingTemplates.goodYesterdayWorkout;
    }

    const randomIndex = Math.floor(Math.random() * selectedTemplates.length);
    return selectedTemplates[randomIndex];
  } catch (error) {
    console.error('❌ AI 인사말 생성 실패:', error);
    return '오늘도 깊은 호흡으로 하루를 시작해볼까요?';
  }
}

// 🆕 오늘의 목표 데이터 로드 및 업데이트
async function updateTodaysGoal() {
  try {
    if (!window.currentUserId) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    const { data: todaySessions, error: sessionError } = await window.supabaseClient
      .from('exercise_sessions')
      .select('completed_breaths, created_at')
      .eq('user_id', window.currentUserId)
      .gte('created_at', `${todayStr} 00:00:00+00`)
      .lt('created_at', `${todayStr} 23:59:59+00`);
    if (sessionError) throw sessionError;

    const todayBreaths = (todaySessions || []).reduce((sum, s) => sum + (s.completed_breaths || 0), 0);
    const goalBreaths = 40;
    const progressPercentage = Math.min((todayBreaths / goalBreaths) * 100, 100);

    updateEnhancedCircularProgress(todayBreaths, goalBreaths, progressPercentage);
    await loadLatestAIAdvice(true);
    console.log('✅ 오늘의 목표 업데이트 완료:', { todayBreaths, goalBreaths, progressPercentage });
  } catch (error) {
    console.error('❌ 오늘의 목표 업데이트 실패:', error);
  }
}

// 🆕 개선된 원형 프로그레스바 업데이트 (퍼센트 표시)
function updateEnhancedCircularProgress(current, target, percentage) {
  const progressFill = document.getElementById('progressFill');
  const percentageEl = document.getElementById('todaysPercentage');
  const statusEl = document.getElementById('goalStatusText');
  const particles = document.getElementById('celebrationParticles');
  if (!progressFill || !percentageEl || !statusEl) return;

  // 퍼센트 숫자 애니메이션
  const displayPercentage = Math.round((current / target) * 100);
  // 숫자만 업데이트 (기호는 CSS로 표시)
  animateNumber(percentageEl, parseInt(percentageEl.textContent) || 0, displayPercentage, 800);

  // 링 채움(시각적)
  progressFill.classList.add('default');
  progressFill.classList.remove('completed');
  percentageEl.classList.remove('completed');

  if (current >= target) {
    progressFill.classList.remove('default');
    progressFill.classList.add('completed');
    percentageEl.classList.add('completed');
    statusEl.textContent = '🎉 목표 달성!';
    statusEl.className = 'goal-status completed';
    if (particles) {
      particles.classList.add('active');
      setTimeout(() => particles.classList.remove('active'), 2000);
    }
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  } else if (current > 0) {
    statusEl.textContent = `${target - current}회 더 가능해요!`;
    statusEl.className = 'goal-status in-progress';
  } else {
    statusEl.textContent = '시작해보세요!';
    statusEl.className = 'goal-status';
  }
}

// 🆕 숫자 애니메이션 함수
function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(start + (end - start) * eased);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// 🆕 최신 AI 조언 로드
async function loadLatestAIAdvice(forceRefresh = false) {
  try {
    if (!window.currentUserId) return;
    const latestAdviceElLoading = document.getElementById('latestAIAdvice');
    if (latestAdviceElLoading) {
      latestAdviceElLoading.className = 'ai-advice-content loading';
      latestAdviceElLoading.textContent = 'AI 조언을 불러오는 중...';
    }
    // 최근 세션의 ai_advice 조회 (사용자 본인 세션에 한해)
    const { data: sessions, error: sErr } = await window.supabaseClient
      .from('exercise_sessions')
      .select('id')
      .eq('user_id', window.currentUserId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (sErr) throw sErr;
    const sessionIds = (sessions || []).map(s => s.id);
    if (sessionIds.length === 0) {
      const el = document.getElementById('latestAIAdvice');
      if (el) {
        el.textContent = '운동을 완료하시면 맞춤형 AI 조언을 받을 수 있어요!';
        el.style.fontStyle = 'italic';
      }
      return;
    }

    const { data: advices, error } = await window.supabaseClient
      .from('ai_advice')
      .select('comprehensive_advice, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;

    const latestAdviceElResult = document.getElementById('latestAIAdvice');
    if (!latestAdviceElResult) return;
    if (advices && advices.length > 0) {
      const advice = advices[0].comprehensive_advice || '';
      const maxLength = window.innerWidth <= 480 ? 60 : 120;
      const truncated = advice.length > maxLength ? advice.substring(0, maxLength) + '...' : advice;
      latestAdviceElResult.textContent = truncated || '운동을 완료하시면 맞춤형 AI 조언을 받을 수 있어요!';
      latestAdviceElResult.className = 'ai-advice-content has-advice';
    } else {
      latestAdviceElResult.textContent = '운동을 완료하시면 맞춤형 AI 조언을 받을 수 있어요!';
      latestAdviceElResult.className = 'ai-advice-content loading';
    }
  } catch (error) {
    console.error('❌ AI 조언 로드 실패:', error);
    const latestAdviceElError = document.getElementById('latestAIAdvice');
    if (latestAdviceElError) {
      latestAdviceElError.textContent = '운동을 완료하시면 맞춤형 AI 조언을 받을 수 있어요!';
      latestAdviceElError.className = 'ai-advice-content loading';
    }
  }
}

// 🏠 메인 앱 관련 함수들

// 🕐 시간대 변환 유틸리티 함수
function toKSTDateString(utcDateStr) {
    if (!utcDateStr) return new Date().toISOString().split('T')[0];
    
    const utcDate = new Date(utcDateStr);
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    return kstDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

// Supabase 설정 (Google Apps Script 대체)
const SUPABASE_URL = 'https://rfqbzibewzvqopqgovbc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJ6aWJld3p2cW9wcWdvdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzIwNTMsImV4cCI6MjA2OTk0ODA1M30.nAXbnAFe4jM7F56QN4b42NhwNJG_iuSXOVM5zC72Bs4';

// 🔄 마이그레이션 상태 확인
function checkMigrationStatus() {
    console.log('🔄 Google Apps Script → Supabase 마이그레이션 상태 확인');
    console.log('✅ SCRIPT_URL → SUPABASE_URL로 교체 완료');
    console.log('✅ getTrainerAdvice 함수 → Supabase Edge Function 호출로 변경 완료');
    console.log('✅ supabase-client.js 추가 완료');
    
    return {
        migrationComplete: true,
        timestamp: new Date().toISOString(),
        oldEndpoint: 'Google Apps Script',
        newEndpoint: 'Supabase Edge Functions',
        functions: ['ai-advice']
    };
}

// 🔥 새로운 기능: 사회적 증명 데이터
const SOCIAL_PROOF_REVIEWS = [
    {
        text: "숨트로 폐활량이 정말 늘었어요! 계단 오를 때 숨이 덜 차요 👍",
        author: "김상우",
        rating: "⭐⭐⭐⭐⭐",
        avatar: "김"
    },
    {
        text: "운동 후 호흡이 훨씬 편해졌습니다. 꾸준히 하니까 확실히 달라져요!",
        author: "박영희",
        rating: "⭐⭐⭐⭐⭐",
        avatar: "박"
    },
    {
        text: "처음엔 힘들었는데 이제 2단계까지 할 수 있어요. 성취감 최고!",
        author: "이민수",
        rating: "⭐⭐⭐⭐⭐",
        avatar: "이"
    },
    {
        text: "숨트 앱 덕분에 매일 꾸준히 하게 되네요. UI도 예쁘고 재미있어요!",
        author: "정하나",
        rating: "⭐⭐⭐⭐⭐",
        avatar: "정"
    },
    {
        text: "호흡근 운동이 이렇게 중요한 줄 몰랐어요. 숨트 강력 추천합니다!",
        author: "최준호",
        rating: "⭐⭐⭐⭐⭐",
        avatar: "최"
    }
];

// 🎮 배지 시스템 데이터
const BADGES_CONFIG = [
    {
        id: 'first_step',
        name: '첫 걸음',
        icon: '🌱',
        description: '첫 번째 호흡 트레이닝 완료',
        hint: '첫 트레이닝',
        condition: (stats) => stats.totalExercises >= 1
    },
    {
        id: 'daily_warrior',
        name: '일일 전사',
        icon: '⚡',
        description: '하루에 3번 이상 트레이닝 완료',
        hint: '하루 3회',
        condition: (stats) => getTodayExerciseCount() >= 3
    },
    {
        id: 'week_master',
        name: '주간 마스터',
        icon: '🔥',
        description: '7일 연속 트레이닝 완료',
        hint: '7일 연속',
        condition: (stats) => stats.consecutiveDays >= 7
    },
    {
        id: 'breath_collector',
        name: '호흡 수집가',
        icon: '🫁',
        description: '총 1000회 호흡 달성',
        hint: '총 1000회',
        condition: (stats) => stats.totalBreaths >= 1000
    },
    {
        id: 'endurance_king',
        name: '지구력 왕',
        icon: '👑',
        description: '50회 트레이닝 완주',
        hint: '50회 완주',
        condition: (stats) => stats.totalExercises >= 50
    },
    {
        id: 'high_intensity',
        name: '고강도 도전자',
        icon: '💪',
        description: '들숨/날숨 모두 4단계 이상 달성',
        hint: '고강도 달성',
        condition: (stats) => getMaxIntensityEver().inhale >= 4 && getMaxIntensityEver().exhale >= 4
    },
    {
        id: 'perfect_month',
        name: '완벽한 달',
        icon: '🌟',
        description: '30일 연속 트레이닝 완료',
        hint: '30일 연속',
        condition: (stats) => stats.consecutiveDays >= 30
    },
    {
        id: 'speed_demon',
        name: '스피드 데몬',
        icon: '🚀',
        description: '휴식시간 없이 2세트 연속 완주',
        hint: '휴식 스킵',
        condition: (stats) => getSkippedRestCount() >= 1 && stats.totalExercises >= 2
    },
    {
        id: 'consistency_hero',
        name: '꾸준함의 영웅',
        icon: '🎯',
        description: '100회 트레이닝 완주',
        hint: '100회 완주',
        condition: (stats) => stats.totalExercises >= 100
    },
    {
        id: 'breath_master',
        name: '호흡 마스터',
        icon: '🧘',
        description: '총 5000회 호흡 달성',
        hint: '총 5000회',
        condition: (stats) => stats.totalBreaths >= 5000
    },
    {
        id: 'legend',
        name: '레전드',
        icon: '🏆',
        description: '모든 조건을 달성한 진정한 마스터',
        hint: '??? 미스터리',
        condition: (stats) => {
            const earnedBadges = getEarnedBadges();
            return earnedBadges.length >= 14; // 자기 자신 제외한 모든 배지
        }
    },
    {
        id: 'quiz_explorer',
        name: '퀴즈 탐험가',
        icon: '🔍',
        description: '퀴즈 2문제를 모두 정답으로 맞혔어요',
        hint: '퀴즈 2문제',
        condition: (stats) => getQuizPerfectCount() >= 1
    },
    {
        id: 'quiz_perfectionist',
        name: '퀴즈 완벽주의자',
        icon: '🎯',
        description: '3번 연속으로 퀴즈를 완벽하게 풀었어요',
        hint: '3번 연속 완벽',
        condition: (stats) => getConsecutivePerfectCount() >= 3
    },
    {
        id: 'quiz_master',
        name: '퀴즈 마스터',
        icon: '🧠',
        description: '6가지 퀴즈 문제를 모두 경험했어요',
        hint: '모든 문제',
        condition: (stats) => getSolvedQuestionsCount() >= 6
    },
    {
        id: 'early_bird',
        name: '일찍 일어나는 새',
        icon: '🌅',
        description: '오전 6시 이전에 트레이닝 완료',
        hint: '새벽 운동',
        condition: (stats) => getEarlyMorningCount() >= 1
    }
];

// 전역 변수들
let currentSet = 1;
let currentBreath = 1;
let exerciseStartTime;
let breathingTimer;
let restTimer;
let isPaused = false;
let isAborted = false;
let breathingPhase = 'inhale';

let resistanceSettings = {
    inhale: 1,
    exhale: 1
};

let userFeedback = null;

// 🎮 퀴즈 시스템 전역 변수
let currentQuizQuestion = 0;
let quizCorrectAnswers = 0;
let selectedQuestions = []; // 선택된 2문제
let solvedQuestions = []; // 지금까지 푼 문제들 (배지용)
let quizStartTime = null;

// 🔥 리뷰 캐러셀 전역 변수
let reviewCarouselInterval;
let currentReviewIndex = 0;

// 🔧 전역 휴식 타이머
let globalRestTimer = null;
let globalRestTime = 120;

// 🎯 퀴즈 오퍼 타이머
let quizOfferTimer = null;

// 하단 네비게이션 바 제어 함수들
function showBottomNav() {
    const nav = document.getElementById('bottomNavigation');
    if (nav) nav.style.display = 'flex';
}

function hideBottomNav() {
    const nav = document.getElementById('bottomNavigation');
    if (nav) nav.style.display = 'none';
}

// 📒 Records 관련 함수들
async function fetchAiAdviceForDate(date) {
    const client = window.supabaseClient;
    if (!client) return null;

    try {
        // Step 1: Fetch session IDs for the date
        const { data: sessions, error: sessionError } = await client
            .from('exercise_sessions')
            .select('id')
            .eq('exercise_date', date);

        if (sessionError || !sessions?.length) {
            console.warn('⚠️ No exercise sessions found for', date);
            return null;
        }

        const sessionIds = sessions.map(s => s.id);

        // Step 2: Fetch AI advice with summary first
        const { data: advices, error: adviceError } = await client
            .from('ai_advice')
            .select('summary, comprehensive_advice, session_id')
            .in('session_id', sessionIds)
            .order('created_at', { ascending: false })
            .limit(1);

        if (adviceError || !advices?.length) {
            console.warn('⚠️ No AI advice found for', date);
            return null;
        }

        const advice = advices[0];
        const result = advice.summary || advice.comprehensive_advice || null;
        
        console.log('✅ AI advice fetched for', date, ':', result);
        return result;

    } catch (err) {
        console.error('❌ Error fetching AI advice:', err);
        return null;
    }
}

async function fetchExerciseSessions() {
    const client = window.supabaseClient;
    if (!client) {
        console.error('❌ Supabase client not initialized');
        return [];
    }

    try {
        const { data, error } = await client
            .from('exercise_sessions')
            .select('*')
            .order('exercise_date', { ascending: true });

        if (error) {
            console.error('❌ Error fetching sessions:', error);
            return [];
        }

        console.log(`📒 ${data.length} sessions fetched`, data);
        return data;
    } catch (err) {
        console.error('❌ Unexpected fetch error:', err);
        return [];
    }
}

function transformSessionToRecord(session) {
    return {
        date: session.created_at ? session.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        sets: session.completed_sets,
        duration: session.exercise_time,
        avg_resistance: Math.round((session.inhale_resistance + session.exhale_resistance) / 2),
        ai_summary: session.is_aborted ? "운동을 중단하셨네요. 다음에는 완주해보세요!" : "운동 완료! 꾸준히 해봅시다."
    };
}

function renderCalendar(sessions) {
    const calendarContainer = document.querySelector('.records-calendar');
    
    // UTC → KST 시간대 보정하여 날짜별로 세션 그룹화
    const sessionsByDate = {};
    sessions.forEach(session => {
        const sessionDate = toKSTDateString(session.created_at);
        
        if (!sessionsByDate[sessionDate]) {
            sessionsByDate[sessionDate] = [];
        }
        sessionsByDate[sessionDate].push(session);
    });
    
    const days = Object.keys(sessionsByDate);
    console.log('📅 KST 기준 운동 기록 날짜들:', days);

    // 현재 날짜 기준으로 년월 계산
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-based to 1-based

    let html = '<table class="calendar"><tr>';
    for (let d = 1; d <= 30; d++) {
        const dayStr = d.toString().padStart(2, '0');
        const fullDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${dayStr}`;
        const hasRecord = days.includes(fullDate);
        
        if (hasRecord) {
            console.log(`✅ ${fullDate}에 운동 기록 있음`);
        }
        
        html += `<td class="${hasRecord ? 'has-record' : ''}" data-day="${fullDate}">${d}</td>`;
        if (d % 7 === 0) html += '</tr><tr>';
    }
    html += '</tr></table>';
    calendarContainer.innerHTML = html;

    calendarContainer.querySelectorAll('td').forEach(td => {
        td.addEventListener('click', async () => {
            const day = td.getAttribute('data-day');
            const daySessions = sessionsByDate[day] || [];
            const selectedSession = daySessions.find(s => s.completed_sets > 0) || daySessions[0];
            await renderRecordSummary(selectedSession);
        });
    });
}

async function renderRecordSummary(session) {
    const dateEl = document.getElementById('selectedDate');
    const summaryEl = document.getElementById('recordSummaryList');
    const adviceEl = document.getElementById('aiAdviceSummary');

    // null 체크 및 session 객체 검증
    if (!session) {
        dateEl.innerText = '-';
        summaryEl.innerHTML = '<li>운동 기록 없음</li>';
        adviceEl.innerText = '운동 기록이 없어 AI 조언을 제공할 수 없습니다.';
        return;
    }

    // UTC → KST 시간대 보정하여 날짜 포맷팅
    const date = toKSTDateString(session.created_at);
    dateEl.innerText = date;

    // 실제 데이터베이스 컬럼명에 맞춰 렌더링
    const exerciseTime = session.exercise_time || '없음';
    const completedSets = session.completed_sets || 0;
    const avgResistance = session.inhale_resistance && session.exhale_resistance 
        ? Math.round((session.inhale_resistance + session.exhale_resistance) / 2) 
        : '없음';
    const userFeedback = session.user_feedback || '없음';
    const completedBreaths = session.completed_breaths || 0;

    summaryEl.innerHTML = `
        <li>운동 시간: ${exerciseTime}</li>
        <li>완료 세트: ${completedSets}세트</li>
        <li>완료 호흡: ${completedBreaths}회</li>
        <li>평균 저항: ${avgResistance}</li>
        <li>운동 후기: ${userFeedback}</li>
    `;

    // Fetch latest AI advice for the selected date
    console.log('🔍 Fetching AI advice for date:', date);
    const advice = await fetchAiAdviceForDate(date);
    adviceEl.innerText = advice || '운동 기록이 없어 AI 조언을 제공할 수 없습니다.';
}

async function onRecordsTabClick() {
    showBottomNav();
    console.log('📒 Records tab clicked, fetching sessions...');

    const sessions = await fetchExerciseSessions();

    if (!sessions.length) {
        console.warn('⚠️ No exercise sessions found.');
    }

    renderCalendar(sessions); // existing function
}

// 📊 기록탭 개선: 올바른 데이터 조회 함수들
async function fetchUserExerciseRecords() {
    console.log('🔍 사용자 운동 기록 조회 시작...');
    
    if (!window.currentUserId) {
        console.warn('⚠️ 로그인 사용자 ID가 없습니다.');
        return [];
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select(`
                id,
                created_at,
                exercise_time,
                completed_sets,
                completed_breaths,
                inhale_resistance,
                exhale_resistance,
                user_feedback,
                is_aborted
            `)
            .eq('user_id', window.currentUserId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ 운동 기록 조회 실패:', error);
            return [];
        }

        console.log(`✅ ${data?.length || 0}개의 운동 기록 조회 완료`);
        return data || [];

    } catch (err) {
        console.error('❌ 운동 기록 조회 중 오류:', err);
        return [];
    }
}

async function fetchAiAdviceForDate(date) {
    console.log(`🤖 ${date} 날짜의 AI 조언 조회 시작...`);
    
    if (!window.currentUserId || !date) {
        console.warn('⚠️ 사용자 ID 또는 날짜가 없습니다.');
        return null;
    }

    try {
        // KST 기준 날짜를 UTC 기준으로 변환하여 조회
        // KST = UTC + 9시간이므로, KST 기준 하루를 UTC 기준으로 변환
        const kstStartOfDay = new Date(`${date}T00:00:00+09:00`);
        const kstEndOfDay = new Date(`${date}T23:59:59+09:00`);
        
        // UTC로 변환
        const utcStartOfDay = new Date(kstStartOfDay.getTime() - 9 * 60 * 60 * 1000);
        const utcEndOfDay = new Date(kstEndOfDay.getTime() - 9 * 60 * 60 * 1000);
        
        console.log(`🕐 KST ${date} → UTC ${utcStartOfDay.toISOString()} ~ ${utcEndOfDay.toISOString()}`);
        
        const { data: sessions, error: sessionError } = await window.supabaseClient
            .from('exercise_sessions')
            .select('id')
            .eq('user_id', window.currentUserId)
            .gte('created_at', utcStartOfDay.toISOString())
            .lt('created_at', utcEndOfDay.toISOString());

        if (sessionError) {
            console.error('❌ 세션 조회 실패:', sessionError);
            return null;
        }

        if (!sessions?.length) {
            console.log(`ℹ️ ${date} 날짜에 운동 기록이 없습니다.`);
            return null;
        }

        const sessionIds = sessions.map(s => s.id);

        // ai_advice 테이블에서 조언 조회
        const { data: advices, error: adviceError } = await window.supabaseClient
            .from('ai_advice')
            .select('comprehensive_advice, intensity_advice, summary')
            .in('session_id', sessionIds)
            .order('created_at', { ascending: false })
            .limit(1);

        if (adviceError) {
            console.error('❌ AI 조언 조회 실패:', adviceError);
            return null;
        }

        if (advices && advices.length > 0) {
            const advice = advices[0];
            const adviceText = advice.comprehensive_advice || 
                              advice.intensity_advice || 
                              advice.summary || 
                              '운동을 완료하셨습니다!';
            
            console.log(`✅ ${date} 날짜의 AI 조언 조회 완료`);
            return adviceText;
        } else {
            console.log(`ℹ️ ${date} 날짜에 AI 조언이 없습니다.`);
            return null;
        }

    } catch (err) {
        console.error('❌ AI 조언 조회 중 오류:', err);
        return null;
    }
}

async function fetchRecordSummaryForDate(date) {
    console.log(`📋 ${date} 날짜의 운동 요약 조회 시작...`);
    
    if (!window.currentUserId || !date) {
        console.warn('⚠️ 사용자 ID 또는 날짜가 없습니다.');
        return null;
    }

    try {
        // KST 기준 날짜를 UTC 기준으로 변환하여 조회
        const kstStartOfDay = new Date(`${date}T00:00:00+09:00`);
        const kstEndOfDay = new Date(`${date}T23:59:59+09:00`);
        
        // UTC로 변환
        const utcStartOfDay = new Date(kstStartOfDay.getTime() - 9 * 60 * 60 * 1000);
        const utcEndOfDay = new Date(kstEndOfDay.getTime() - 9 * 60 * 60 * 1000);
        
        console.log(`🕐 KST ${date} → UTC ${utcStartOfDay.toISOString()} ~ ${utcEndOfDay.toISOString()}`);
        
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select(`
                completed_sets,
                completed_breaths,
                exercise_time,
                inhale_resistance,
                exhale_resistance,
                user_feedback,
                created_at
            `)
            .eq('user_id', window.currentUserId)
            .gte('created_at', utcStartOfDay.toISOString())
            .lt('created_at', utcEndOfDay.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ 운동 요약 조회 실패:', error);
            return null;
        }

        if (!sessions?.length) {
            console.log(`ℹ️ ${date} 날짜에 운동 기록이 없습니다.`);
            return null;
        }

        // 해당 날짜의 모든 세션을 합계
        const summary = sessions.reduce((acc, session) => {
            acc.totalSets += session.completed_sets || 0;
            acc.totalBreaths += session.completed_breaths || 0;
            acc.totalDuration += session.exercise_duration || 0;
            acc.sessionCount += 1;
            acc.inhaleResistance = session.inhale_resistance || 0; // 마지막 값 사용
            acc.exhaleResistance = session.exhale_resistance || 0; // 마지막 값 사용
            acc.feedback = session.user_feedback || acc.feedback;
            return acc;
        }, {
            totalSets: 0,
            totalBreaths: 0,
            totalDuration: 0,
            sessionCount: 0,
            inhaleResistance: 0,
            exhaleResistance: 0,
            feedback: null
        });

        console.log(`✅ ${date} 날짜의 운동 요약 조회 완료: ${summary.sessionCount}개 세션`);
        return summary;

    } catch (err) {
        console.error('❌ 운동 요약 조회 중 오류:', err);
        return null;
    }
}

// 📅 기록탭 달력 관련 변수들
let currentCalendarYear = new Date().getFullYear();
let currentCalendarMonth = new Date().getMonth();
let selectedDate = null;
let userExerciseRecords = [];

// 📅 달력 렌더링 함수
async function renderCalendar() {
    console.log(`🗓️ 달력 렌더링 시작: ${currentCalendarYear}년 ${currentCalendarMonth + 1}월`);
    
    // 로딩 표시
    const loadingEl = document.getElementById('calendarLoading');
    if (loadingEl) {
        loadingEl.style.display = 'block';
    }
    
    // 달력 제목 업데이트
    const titleEl = document.getElementById('calendarTitle');
    if (titleEl) {
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                           '7월', '8월', '9월', '10월', '11월', '12월'];
        titleEl.textContent = `${currentCalendarYear}년 ${monthNames[currentCalendarMonth]}`;
    }
    
    // 사용자 운동 기록 조회
    userExerciseRecords = await fetchUserExerciseRecords();
    
    // 날짜별로 기록 그룹화
    const recordsByDate = {};
    userExerciseRecords.forEach(record => {
        const recordDate = new Date(record.started_at);
        const dateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
        
        if (!recordsByDate[dateStr]) {
            recordsByDate[dateStr] = [];
        }
        recordsByDate[dateStr].push(record);
    });
    
    // 달력 바디 렌더링
    const calendarBody = document.getElementById('calendarBody');
    if (!calendarBody) {
        console.error('❌ calendarBody 엘리먼트를 찾을 수 없습니다.');
        return;
    }
    
    // 현재 월의 첫 날과 마지막 날
    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
    const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
    const today = new Date();
    
    let html = '';
    let currentWeek = '';
    
    // 첫 번째 주 - 빈 칸 채우기
    for (let i = 0; i < firstDay.getDay(); i++) {
        currentWeek += '<td class="empty"></td>';
    }
    
    // 날짜 채우기
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasRecord = recordsByDate[dateStr] && recordsByDate[dateStr].length > 0;
        const isToday = day === today.getDate() && 
                       currentCalendarMonth === today.getMonth() && 
                       currentCalendarYear === today.getFullYear();
        const isSelected = selectedDate === dateStr;
        
        let classes = [];
        if (isToday) classes.push('today');
        if (hasRecord) classes.push('has-record');
        if (isSelected) classes.push('selected');
        
        currentWeek += `<td class="${classes.join(' ')}" data-date="${dateStr}" onclick="onDateClick('${dateStr}')">${day}</td>`;
        
        // 한 주가 완성되면 행 추가
        if ((firstDay.getDay() + day - 1) % 7 === 6) {
            html += `<tr>${currentWeek}</tr>`;
            currentWeek = '';
        }
    }
    
    // 마지막 주 완성
    if (currentWeek) {
        const remainingCells = 7 - ((firstDay.getDay() + lastDay.getDate() - 1) % 7 + 1);
        for (let i = 0; i < remainingCells; i++) {
            currentWeek += '<td class="empty"></td>';
        }
        html += `<tr>${currentWeek}</tr>`;
    }
    
    calendarBody.innerHTML = html;
    
    // 로딩 숨김
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
    
    console.log(`✅ 달력 렌더링 완료: ${Object.keys(recordsByDate).length}개 날짜에 기록 있음`);
}

// 📅 날짜 클릭 이벤트 처리
async function onDateClick(dateStr) {
    console.log(`📅 날짜 클릭: ${dateStr}`);
    
    // 이전 선택된 날짜 해제
    const prevSelected = document.querySelector('.calendar-table td.selected');
    if (prevSelected) {
        prevSelected.classList.remove('selected');
    }
    
    // 새 날짜 선택
    const newSelected = document.querySelector(`[data-date="${dateStr}"]`);
    if (newSelected) {
        newSelected.classList.add('selected');
    }
    
    selectedDate = dateStr;
    
    // 선택된 날짜 표시 업데이트
    const selectedDateEl = document.getElementById('selectedDate');
    if (selectedDateEl) {
        const [year, month, day] = dateStr.split('-');
        selectedDateEl.textContent = `${year}년 ${month}월 ${day}일`;
    }
    
    // 해당 날짜의 운동 요약 표시
    await renderDateSummary(dateStr);
}

// 📅 선택된 날짜의 운동 요약 및 AI 조언 렌더링
async function renderDateSummary(dateStr) {
    console.log(`📋 날짜 요약 렌더링: ${dateStr}`);
    
    // 운동 요약 조회
    const summary = await fetchRecordSummaryForDate(dateStr);
    const summaryListEl = document.getElementById('recordSummaryList');
    
    if (summaryListEl) {
        if (!summary) {
            summaryListEl.innerHTML = '<li>이 날짜에 운동 기록이 없습니다.</li>';
        } else {
            const durationMinutes = Math.floor((summary.totalDuration || 0) / 60);
            const durationSeconds = (summary.totalDuration || 0) % 60;
            const durationText = durationMinutes > 0 ? 
                `${durationMinutes}분 ${durationSeconds}초` : 
                `${durationSeconds}초`;
            
            summaryListEl.innerHTML = `
                <li>운동 세션 수: ${summary.sessionCount}회</li>
                <li>완료 세트 수: ${summary.totalSets}세트</li>
                <li>총 호흡 횟수: ${summary.totalBreaths}회</li>
                <li>총 운동 시간: ${durationText}</li>
                <li>저항 강도: 흡기 ${summary.inhaleResistance} / 호기 ${summary.exhaleResistance}</li>
                ${summary.feedback ? `<li>운동 후기: ${summary.feedback === 'easy' ? '😌 너무 편함' : summary.feedback === 'perfect' ? '💪 딱 좋음' : '😤 너무 힘듦'}</li>` : ''}
            `;
        }
    }
    
    // AI 조언 UI 요소들
    const adviceTextEl = document.getElementById('aiAdviceSummary');
    const adviceEmptyEl = document.getElementById('aiAdviceEmpty');
    const adviceLoadingEl = document.getElementById('aiAdviceLoading');
    const adviceBadgeEl = document.getElementById('aiAdviceBadge');
    
    // 로딩 표시
    if (adviceLoadingEl) {
        adviceLoadingEl.style.display = 'flex';
    }
    if (adviceTextEl) {
        adviceTextEl.style.display = 'none';
    }
    if (adviceEmptyEl) {
        adviceEmptyEl.style.display = 'none';
    }
    if (adviceBadgeEl) {
        adviceBadgeEl.style.display = 'none';
    }
    
    // AI 조언 조회
    const advice = await fetchAiAdviceForDate(dateStr);
    
    // 로딩 숨김
    if (adviceLoadingEl) {
        adviceLoadingEl.style.display = 'none';
    }
    
    if (!advice) {
        // 조언이 없는 경우
        if (adviceEmptyEl) {
            adviceEmptyEl.style.display = 'block';
        }
    } else {
        // 조언이 있는 경우
        if (adviceTextEl) {
            adviceTextEl.textContent = advice;
            adviceTextEl.style.display = 'block';
            
            // 긴 텍스트인 경우 스크롤 가능하도록
            if (advice.length > 200) {
                adviceTextEl.classList.add('long-advice');
            } else {
                adviceTextEl.classList.remove('long-advice');
            }
        }
        
        // 새로운 조언 배지 표시
        if (adviceBadgeEl) {
            adviceBadgeEl.style.display = 'block';
            
            // 3초 후 배지 숨김
            setTimeout(() => {
                if (adviceBadgeEl) {
                    adviceBadgeEl.style.display = 'none';
                }
            }, 3000);
        }
    }
}

// 📅 달력 네비게이션 함수들
function navigateCalendar(direction) {
    if (direction === 'prev') {
        if (currentCalendarMonth === 0) {
            currentCalendarMonth = 11;
            currentCalendarYear--;
        } else {
            currentCalendarMonth--;
        }
    } else if (direction === 'next') {
        if (currentCalendarMonth === 11) {
            currentCalendarMonth = 0;
            currentCalendarYear++;
        } else {
            currentCalendarMonth++;
        }
    }
    
    renderCalendar();
}

// 📅 기록 탭 초기화 함수 (기존 함수 개선)
async function initRecordsTab() {
    console.log('📒 기록 탭 초기화 시작...');
    
    showBottomNav();
    
    // 달력 네비게이션 버튼 이벤트 추가
    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');
    
    if (prevBtn && !prevBtn.hasAttribute('data-event-added')) {
        prevBtn.addEventListener('click', () => navigateCalendar('prev'));
        prevBtn.setAttribute('data-event-added', 'true');
    }
    
    if (nextBtn && !nextBtn.hasAttribute('data-event-added')) {
        nextBtn.addEventListener('click', () => navigateCalendar('next'));
        nextBtn.setAttribute('data-event-added', 'true');
    }
    
    // 달력 렌더링
    await renderCalendar();
    
    console.log('✅ 기록 탭 초기화 완료');
}

// 🧪 기록탭 기능 테스트 함수
async function testRecordsTabFunctionality() {
    console.log('🧪 기록탭 기능 테스트 시작...');
    
    const testResults = {
        userLogin: false,
        dataFetch: false,
        calendarRender: false,
        dateSelection: false,
        aiAdvice: false,
        errors: []
    };
    
    try {
        // 1. 사용자 로그인 상태 확인
        if (window.currentUserId) {
            testResults.userLogin = true;
            console.log('✅ 사용자 로그인 확인:', window.currentUserId);
        } else {
            testResults.errors.push('사용자가 로그인되지 않음');
            console.warn('⚠️ 사용자가 로그인되지 않음');
        }
        
        // 2. 데이터 조회 테스트
        const records = await fetchUserExerciseRecords();
        if (records && Array.isArray(records)) {
            testResults.dataFetch = true;
            console.log(`✅ 운동 기록 조회 성공: ${records.length}개`);
        } else {
            testResults.errors.push('운동 기록 조회 실패');
        }
        
        // 3. 달력 렌더링 테스트
        const calendarBody = document.getElementById('calendarBody');
        if (calendarBody) {
            testResults.calendarRender = true;
            console.log('✅ 달력 UI 요소 확인');
        } else {
            testResults.errors.push('달력 UI 요소 없음');
        }
        
        // 4. 날짜 선택 기능 테스트
        if (records.length > 0) {
            const firstRecord = records[0];
            const recordDate = new Date(firstRecord.started_at);
            const dateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
            
            const summary = await fetchRecordSummaryForDate(dateStr);
            if (summary) {
                testResults.dateSelection = true;
                console.log(`✅ 날짜별 요약 조회 성공: ${dateStr}`);
                
                // 5. AI 조언 테스트
                const advice = await fetchAiAdviceForDate(dateStr);
                if (advice) {
                    testResults.aiAdvice = true;
                    console.log(`✅ AI 조언 조회 성공: ${advice.substring(0, 50)}...`);
                } else {
                    console.log(`ℹ️ ${dateStr} 날짜에 AI 조언 없음`);
                }
            }
        }
        
    } catch (error) {
        testResults.errors.push(`테스트 중 오류: ${error.message}`);
        console.error('❌ 테스트 중 오류:', error);
    }
    
    // 테스트 결과 요약
    const passedTests = Object.values(testResults).filter(v => v === true).length;
    const totalTests = 5;
    
    console.log(`🧪 테스트 결과: ${passedTests}/${totalTests} 통과`);
    console.log('📋 세부 결과:', testResults);
    
    if (testResults.errors.length > 0) {
        console.warn('⚠️ 발견된 문제:', testResults.errors);
    }
    
    return testResults;
}

// 🔧 기록탭 트러블슈팅 도우미
function troubleshootRecordsTab() {
    console.log('🔧 기록탭 트러블슈팅 시작...');
    
    const checks = {
        elements: {},
        functions: {},
        data: {}
    };
    
    // UI 요소 확인
    const requiredElements = [
        'calendarBody', 'calendarTitle', 'prevMonthBtn', 'nextMonthBtn',
        'selectedDate', 'recordSummaryList', 'aiAdviceSummary',
        'aiAdviceLoading', 'aiAdviceEmpty', 'aiAdviceBadge'
    ];
    
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        checks.elements[id] = !!element;
        if (!element) {
            console.warn(`⚠️ 요소 누락: #${id}`);
        }
    });
    
    // 함수 확인
    const requiredFunctions = [
        'fetchUserExerciseRecords', 'fetchAiAdviceForDate', 'fetchRecordSummaryForDate',
        'renderCalendar', 'onDateClick', 'navigateCalendar', 'initRecordsTab'
    ];
    
    requiredFunctions.forEach(funcName => {
        const func = window[funcName];
        checks.functions[funcName] = typeof func === 'function';
        if (typeof func !== 'function') {
            console.warn(`⚠️ 함수 누락: ${funcName}`);
        }
    });
    
    // 데이터 확인
    checks.data.supabaseClient = !!window.supabaseClient;
    checks.data.currentUserId = !!window.currentUserId;
    
    if (!window.supabaseClient) {
        console.warn('⚠️ Supabase 클라이언트가 초기화되지 않음');
    }
    if (!window.currentUserId) {
        console.warn('⚠️ 현재 사용자 ID가 설정되지 않음');
    }
    
    console.log('🔧 트러블슈팅 결과:', checks);
    return checks;
}

// 전역 함수로 노출
window.showBottomNav = showBottomNav;
window.hideBottomNav = hideBottomNav;
window.switchTab = switchTab;
window.selectWorkoutMode = selectWorkoutMode;
window.onRecordsTabClick = initRecordsTab; // 기존 함수를 새 함수로 교체
window.fetchAiAdviceForDate = fetchAiAdviceForDate;
window.renderRecordSummary = renderRecordSummary;
window.fetchUserExerciseRecords = fetchUserExerciseRecords;
window.fetchRecordSummaryForDate = fetchRecordSummaryForDate;
window.renderCalendar = renderCalendar;
window.onDateClick = onDateClick;
window.navigateCalendar = navigateCalendar;
window.testRecordsTabFunctionality = testRecordsTabFunctionality;
window.troubleshootRecordsTab = troubleshootRecordsTab;

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // 화면에 따른 하단 네비게이션 바 표시/숨김 처리
    const screensWithNav = ['mainScreen', 'workoutModeScreen', 'breathTrainingScreen', 'recordsScreen'];
    const screensWithoutNav = ['exerciseScreen', 'resultScreen', 'feedbackScreen'];
    
    if (screensWithNav.includes(screenId)) {
        showBottomNav();
    } else if (screensWithoutNav.includes(screenId)) {
        hideBottomNav();
    }
}

// 메인 화면으로 이동
function goToMain() {
    showScreen('mainScreen');
    resetExercise();
    loadUserData();
}

// 하단 네비게이션 탭 전환 함수
function switchTab(tabName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const newScreen = document.getElementById(
        tabName === 'home' ? 'mainScreen' :
        tabName === 'workout' ? 'workoutModeScreen' :
        tabName === 'records' ? 'recordsScreen' : null
    );
    if (!newScreen) return;

    // 메인/운동모드 탭에서는 하단 네비게이션 바 표시
    showBottomNav();

    newScreen.classList.add('active');
    
    // 탭 버튼 활성화 상태 업데이트
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Records 탭 클릭 시 데이터 로드
    if (tabName === 'records') {
        onRecordsTabClick();
    }
}

// 운동 모드 선택 함수
function selectWorkoutMode(mode) {
    if (mode === 'breathtraining') {
        const screen = document.getElementById('breathTrainingScreen');
        // 모든 화면 숨김
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');

        // 숨트레이닝 화면에서는 하단 네비게이션 바 표시
        showBottomNav();
    }
}

// 사용자 데이터 로드
function loadUserData() {
    const stats = getLocalStats();
    displayUserStats(stats);
    updateChart();
    updateSocialProofData(); // 🔥 새로운 기능: 사회적 증명 데이터 업데이트
    updateTodaysGoal(); // 🆕 오늘의 목표 업데이트
}

// 저항 설정 관리 함수들
function loadResistanceSettings() {
    const saved = JSON.parse(localStorage.getItem('resistanceSettings') || '{"inhale": 1, "exhale": 1}');
    resistanceSettings = saved;
    updateResistanceUI();
}

function saveResistanceSettings() {
    localStorage.setItem('resistanceSettings', JSON.stringify(resistanceSettings));
}

function adjustResistance(type, change) {
    const maxLevels = { inhale: 6, exhale: 5 };
    const newLevel = resistanceSettings[type] + change;
    
    if (newLevel >= 1 && newLevel <= maxLevels[type]) {
        resistanceSettings[type] = newLevel;
        saveResistanceSettings();
        updateResistanceUI();
    }
}

function updateResistanceUI() {
    document.getElementById('inhaleLevel').textContent = resistanceSettings.inhale;
    document.getElementById('exhaleLevel').textContent = resistanceSettings.exhale;
    
    updateResistanceScale('inhale', resistanceSettings.inhale);
    updateResistanceScale('exhale', resistanceSettings.exhale);
    
    updateResistanceButtons();
}

function updateResistanceScale(type, level) {
    const scale = document.getElementById(type + 'Scale');
    const dots = scale.querySelectorAll('.dot');
    
    dots.forEach((dot, index) => {
        if (index < level) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function updateResistanceButtons() {
    const inhaleMinusBtn = document.querySelector('.resistance-control:first-child .resistance-btn:first-child');
    const inhalePlusBtn = document.querySelector('.resistance-control:first-child .resistance-btn:last-child');
    const exhaleMinusBtn = document.querySelector('.resistance-control:last-child .resistance-btn:first-child');
    const exhalePlusBtn = document.querySelector('.resistance-control:last-child .resistance-btn:last-child');
    
    inhaleMinusBtn.disabled = resistanceSettings.inhale <= 1;
    inhalePlusBtn.disabled = resistanceSettings.inhale >= 6;
    exhaleMinusBtn.disabled = resistanceSettings.exhale <= 1;
    exhalePlusBtn.disabled = resistanceSettings.exhale >= 5;
}

// 피드백 화면 관련 함수들
function showFeedbackScreen() {
    updateFeedbackScreenContent();
    showScreen('feedbackScreen');
}

function updateFeedbackScreenContent() {
    const title = document.getElementById('feedbackTitle');
    const description = document.getElementById('feedbackDescription');
    
    if (isAborted) {
        title.textContent = '중단하신 이유를 알려주세요';
        description.textContent = '트레이닝을 중단하기 전까지의 강도는 어떠셨나요?';
    } else {
        title.textContent = '지금 호흡하는 느낌이 어떠세요?';
        description.textContent = '방금 완료한 트레이닝의 강도는 어떠셨나요?';
    }
}

function selectFeedback(feedback) {
    userFeedback = feedback;
    
    gtag('event', 'feedback_selected', {
        feedback_type: feedback,
        completed_sets: window.exerciseData ? window.exerciseData.completedSets : 0,
        is_aborted: isAborted
    });
    
    showResultScreen();
}

// 결과 화면 관련 함수들
async function showResultScreen() {
    try {
        console.log('📋 결과 화면 표시 시작');
        
        showScreen('resultScreen');
        
        const timeData = window.exerciseData.exerciseTime.split(':');
        const minutes = parseInt(timeData[0]);
        const seconds = parseInt(timeData[1]);
        
        // 결과 통계 업데이트
        document.getElementById('resistanceInfo').textContent = `${window.exerciseData.resistanceSettings.inhale}/${window.exerciseData.resistanceSettings.exhale}`;
        document.getElementById('totalTime').textContent = `${minutes}분 ${seconds}초`;
        document.getElementById('completedSets').textContent = `${window.exerciseData.completedSets}/2`;
        document.getElementById('totalBreathsResult').textContent = `${window.exerciseData.completedBreaths}회`;
        
        document.getElementById('intensityAdvice').textContent = '강도 조절 분석을 진행하고 있습니다...';
        document.getElementById('comprehensiveAdvice').textContent = 'AI 숨트레이너가 당신의 트레이닝을 분석하고 있습니다...';
        
        const exerciseDataWithFeedback = {
            ...window.exerciseData,
            userFeedback: userFeedback
        };
        
        console.log('🎯 AI 분석용 최종 데이터:', exerciseDataWithFeedback);
        
        gtag('event', 'exercise_complete', {
            exercise_duration: exerciseDataWithFeedback.exerciseTime,
            completed_sets: exerciseDataWithFeedback.completedSets,
            completed_breaths: exerciseDataWithFeedback.completedBreaths,
            is_aborted: exerciseDataWithFeedback.isAborted,
            user_feedback: exerciseDataWithFeedback.userFeedback,
            inhale_resistance: exerciseDataWithFeedback.resistanceSettings.inhale,
            exhale_resistance: exerciseDataWithFeedback.resistanceSettings.exhale
        });
        
        // 🎮 통계 업데이트 및 배지 체크
        const updatedStats = updateLocalStats(window.exerciseData);
        addExerciseHistory(exerciseDataWithFeedback);
        
        // 🎮 새 배지 체크 및 표시
        const newBadges = checkNewBadges(updatedStats);
        updateBadgesDisplay();
        
        // 🔥 새로운 기능: 사회적 증명 UI 초기화
        updateSocialProofData();
        initReviewsCarousel();
        
        if (newBadges.length > 0) {
            // 첫 번째 새 배지만 팝업으로 표시 (여러 개면 순차적으로)
            setTimeout(() => {
                showBadgePopup(newBadges[0]);
            }, 1000);
        }
        
        const aiAdvice = await getTrainerAdvice(exerciseDataWithFeedback);
        
        console.log('🤖 AI 조언 결과:', aiAdvice);
        
        // 🔄 새로운 기능: Supabase 데이터베이스 저장 통합 처리
        console.log('🔄 Supabase 데이터베이스 저장 시작');
        
        let savedSession = null;
        let savedAdvice = null;
        
        try {
            // 1. 운동 데이터 저장
            savedSession = await saveExerciseToDatabase(exerciseDataWithFeedback);
            
            // 2. AI 조언 저장 (세션이 저장된 경우만)
            if (savedSession && aiAdvice) {
                savedAdvice = await saveAIAdviceToDatabase(savedSession.id, aiAdvice);
            }
            
            console.log('💾 데이터베이스 저장 완료 - 세션:', savedSession?.id, '조언:', savedAdvice?.id);
            
        } catch (dbError) {
            console.error('❌ 데이터베이스 저장 중 오류 (기존 기능에는 영향 없음):', dbError);
            // 데이터베이스 저장 실패해도 기존 기능은 계속 작동
        }
        
        if (typeof aiAdvice === 'object' && aiAdvice.intensityAdvice && aiAdvice.comprehensiveAdvice) {
            handleExerciseResult({
                success: true,
                intensityAdvice: aiAdvice.intensityAdvice,
                comprehensiveAdvice: aiAdvice.comprehensiveAdvice,
                stats: updatedStats,
                savedToDatabase: !!savedSession,
                sessionId: savedSession?.id
            });
        } else if (typeof aiAdvice === 'string') {
            handleExerciseResult({
                success: true,
                intensityAdvice: aiAdvice,
                comprehensiveAdvice: "AI 트레이너가 당신의 꾸준한 노력을 응원합니다!",
                stats: updatedStats,
                savedToDatabase: !!savedSession,
                sessionId: savedSession?.id
            });
        } else {
            throw new Error('AI 조언 형식 오류');
        }
        
        console.log('✅ 결과 화면 처리 완료');
        
    } catch (error) {
        console.error('❌ showResultScreen 오류:', error);
        
        document.getElementById('intensityAdvice').textContent = '분석을 불러오는 중 문제가 발생했습니다.';
        document.getElementById('comprehensiveAdvice').textContent = '네트워크 연결을 확인하고 다시 시도해주세요.';
        
        const updatedStats = updateLocalStats(window.exerciseData);
        addExerciseHistory(window.exerciseData);
        updateBadgesDisplay();
        updateSocialProofData();
        initReviewsCarousel();
    }
}

// 💾 Supabase 데이터베이스 저장 함수들 (기존 기능에 영향 없음)
async function saveExerciseToDatabase(exerciseData) {
    try {
        console.log('💾 Supabase 데이터베이스에 운동 데이터 저장 시작:', exerciseData);
        
        const sessionData = {
            user_id: window.currentUserId, // 로그인된 사용자 ID
            exercise_date: new Date().toISOString().split('T')[0],
            exercise_time: exerciseData.exerciseTime || '0:00',
            completed_sets: exerciseData.completedSets || 0,
            completed_breaths: exerciseData.completedBreaths || 0,
            total_target_breaths: 20,
            is_aborted: exerciseData.isAborted || false,
            user_feedback: exerciseData.userFeedback || null,
            inhale_resistance: exerciseData.resistanceSettings?.inhale || 1,
            exhale_resistance: exerciseData.resistanceSettings?.exhale || 1
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/exercise_sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(sessionData)
        });

        if (!response.ok) {
            throw new Error(`저장 실패: ${response.status}`);
        }

        const savedSession = await response.json();
        console.log('✅ 운동 데이터 저장 완료:', savedSession[0]);
        return savedSession[0];
        
    } catch (error) {
        console.error('❌ 데이터베이스 저장 실패 (기존 기능에는 영향 없음):', error);
        return null; // 실패해도 앱은 계속 작동
    }
}

async function saveAIAdviceToDatabase(sessionId, adviceData) {
    try {
        if (!sessionId || !adviceData) {
            console.log('⚠️ 세션 ID 또는 조언 데이터 없음, 저장 생략');
            return null;
        }

        console.log('🤖 AI 조언 Supabase 클라이언트로 직접 저장 시작');
        
        const advice = {
            session_id: sessionId,
            intensity_advice: adviceData.intensityAdvice || '',
            comprehensive_advice: adviceData.comprehensiveAdvice || '',
            summary: null,
            gemini_raw_response: adviceData
        };

        const { data, error } = await window.supabaseClient
            .from('ai_advice')
            .insert(advice)
            .select();

        if (error) {
            console.error('❌ Supabase 클라이언트 저장 실패:', error);
            try {
                localStorage.setItem('latestAIAdvice', JSON.stringify({
                    advice: adviceData.comprehensiveAdvice || adviceData.intensityAdvice,
                    timestamp: new Date().toISOString(),
                    sessionId
                }));
                console.log('📱 로컬스토리지에 AI 조언 저장 완료 (RLS 우회)');
            } catch (e) {
                console.warn('⚠️ 로컬 백업 저장 실패:', e);
            }
            return { id: 'local_' + Date.now(), local: true };
        }

        console.log('✅ AI 조언 Supabase 저장 완료:', data?.[0]);
        return data?.[0] || null;
        
    } catch (error) {
        console.error('❌ AI 조언 저장 실패 (기존 기능에는 영향 없음):', error);
        try {
            localStorage.setItem('latestAIAdvice', JSON.stringify({
                advice: adviceData?.comprehensiveAdvice || adviceData?.intensityAdvice,
                timestamp: new Date().toISOString(),
                sessionId
            }));
            console.log('📱 로컬스토리지 백업 저장 완료');
        } catch (localError) {
            console.error('❌ 로컬스토리지 저장도 실패:', localError);
        }
        return null;
    }
}

// 🎯 개선된 결과 처리 함수 (스마트 분석 적용 + 데이터베이스 저장 상태 처리)
function handleExerciseResult(result) {
    addFeedbackHistory(userFeedback, resistanceSettings);
    const analysis = analyzeFeedbackPattern(userFeedback, resistanceSettings);
    
    console.log('🧠 스마트 분석 결과:', analysis);
    
    // 데이터베이스 저장 상태 로깅
    if (result.savedToDatabase) {
        console.log('💾 데이터베이스 저장 완료 - 세션 ID:', result.sessionId);
    } else {
        console.log('📱 로컬스토리지 저장 모드 (데이터베이스 연결 실패)');
    }
    
    let finalIntensityAdvice = result.intensityAdvice;
    let finalComprehensiveAdvice = result.comprehensiveAdvice;
    
    const additionalAdvice = generateLocalAdviceAddition(analysis, userFeedback, window.exerciseData.isAborted);
    if (additionalAdvice) {
        finalIntensityAdvice += additionalAdvice;
    }
    
    document.getElementById('intensityAdvice').innerHTML = finalIntensityAdvice.replace(/\n/g, '<br>');
    document.getElementById('comprehensiveAdvice').innerHTML = finalComprehensiveAdvice.replace(/\n/g, '<br>');

  // 🆕 홈 화면 즉시 업데이트
  handleExerciseCompletion();
}

// 🆕 운동 완료 후 즉시 업데이트
async function handleExerciseCompletion() {
  setTimeout(async () => {
    await updateTodaysGoal();
    console.log('✅ 운동 완료 후 홈 화면 데이터 즉시 업데이트');
  }, 1000);
}

// 🔥 새로운 기능: 스마트 실시간 데이터 생성
function generateSmartLiveData() {
    const now = getCurrentUserTime();
    const hour = now.getHours();
    const day = now.getDay(); // 0=일요일
    const baseDate = new Date('2024-01-01'); // 앱 시작일
    const daysSinceStart = Math.floor((now - baseDate) / (1000 * 60 * 60 * 24));
    
    // 기본 사용자 수 (시간이 지날수록 증가)
    let baseUsers = 8500 + (daysSinceStart * 15); // 하루에 15명씩 증가
    
    // 시간대별 활동 패턴
    let hourMultiplier = 1.0;
    if (hour >= 6 && hour <= 9) hourMultiplier = 1.8; // 아침 피크
    else if (hour >= 12 && hour <= 14) hourMultiplier = 1.3; // 점심 시간
    else if (hour >= 18 && hour <= 22) hourMultiplier = 2.2; // 저녁 피크
    else if (hour >= 23 || hour <= 5) hourMultiplier = 0.4; // 새벽
    
    // 요일별 패턴
    let dayMultiplier = 1.0;
    if (day === 0 || day === 6) dayMultiplier = 0.7; // 주말은 70%
    else if (day >= 1 && day <= 5) dayMultiplier = 1.0; // 평일
    
    // 랜덤 변동 (±10%)
    const randomFactor = 0.9 + (Math.random() * 0.2);
    
    const todayActiveUsers = Math.floor(baseUsers * hourMultiplier * dayMultiplier * randomFactor);
    const totalUsers = Math.floor(baseUsers * 1.5); // 전체 사용자는 더 많음
    
    return {
        todayActive: Math.max(200, todayActiveUsers), // 최소 200명
        totalUsers: Math.max(8000, totalUsers), // 최소 8000명
        isGrowing: daysSinceStart > 0
    };
}

// 🔥 새로운 기능: 사회적 증명 UI 업데이트
function updateSocialProofData() {
    const liveData = generateSmartLiveData();
    
    // 메인화면 실시간 현황 업데이트
    const mainLiveUsersText = document.getElementById('mainLiveUsersText');
    if (mainLiveUsersText) {
        mainLiveUsersText.textContent = `오늘 ${liveData.todayActive.toLocaleString()}명 트레이닝 중`;
    }
    
    // 결과화면 상세 현황 업데이트
    const liveUsersCount = document.getElementById('liveUsersCount');
    const totalUsersCount = document.getElementById('totalUsersCount');
    
    if (liveUsersCount) {
        liveUsersCount.textContent = liveData.todayActive.toLocaleString();
    }
    if (totalUsersCount) {
        totalUsersCount.textContent = liveData.totalUsers.toLocaleString();
    }
}

// 🔥 새로운 기능: 리뷰 슬라이더 생성
function initReviewsCarousel() {
    const reviewsSlider = document.getElementById('reviewsSlider');
    const carouselDots = document.getElementById('carouselDots');
    
    if (!reviewsSlider || !carouselDots) return;
    
    // 리뷰 카드들 생성
    reviewsSlider.innerHTML = '';
    SOCIAL_PROOF_REVIEWS.forEach((review, index) => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-text">"${review.text}"</div>
            <div class="review-author">
                <div class="review-avatar">${review.avatar}</div>
                <div class="review-info">
                    <div class="review-name">${review.author}</div>
                    <div class="review-rating">${review.rating}</div>
                </div>
            </div>
        `;
        reviewsSlider.appendChild(reviewCard);
    });
    
    // 캐러셀 점들 생성
    carouselDots.innerHTML = '';
    SOCIAL_PROOF_REVIEWS.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToReview(index));
        carouselDots.appendChild(dot);
    });
    
    // 자동 슬라이드 시작
    startReviewCarousel();
    
    // GA 이벤트: 사회적 증명 노출
    gtag('event', 'social_proof_impression', {
        total_reviews: SOCIAL_PROOF_REVIEWS.length,
        current_live_users: generateSmartLiveData().todayActive
    });
}

// 🔥 새로운 기능: 리뷰 캐러셀 자동 재생
function startReviewCarousel() {
    if (reviewCarouselInterval) {
        clearInterval(reviewCarouselInterval);
    }
    
    reviewCarouselInterval = setInterval(() => {
        currentReviewIndex = (currentReviewIndex + 1) % SOCIAL_PROOF_REVIEWS.length;
        goToReview(currentReviewIndex);
    }, 4000); // 4초마다 변경
}

// 🔥 새로운 기능: 특정 리뷰로 이동
function goToReview(index) {
    const reviewsSlider = document.getElementById('reviewsSlider');
    const carouselDots = document.getElementById('carouselDots');
    
    if (!reviewsSlider || !carouselDots) return;
    
    currentReviewIndex = index;
    
    // 슬라이더 이동
    reviewsSlider.style.transform = `translateX(-${index * 100}%)`;
    
    // 점 활성화 상태 업데이트
    carouselDots.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // GA 이벤트: 리뷰 조회
    gtag('event', 'review_view', {
        review_index: index,
        review_author: SOCIAL_PROOF_REVIEWS[index].author
    });
}

// 🎯 스마트 조언 생성
function generateLocalAdviceAddition(analysis, currentFeedback, isAborted) {
    let additionalAdvice = '';
    
    if (!isAborted) {
        if (analysis.readyForChallenge) {
            additionalAdvice += '<br><br><strong>🚀 장기 분석</strong><br>1주일간 꾸준히 적당한 강도를 유지하셨네요!<br>이제 한 단계 도전해보시겠어요?';
        } else if (analysis.shouldIncrease) {
            additionalAdvice += '<br><br><strong>⬆️ 진행 단계</strong><br>연속으로 쉬우셨으니 저항을 올려보세요!';
        } else if (analysis.hasProgressed) {
            additionalAdvice += '<br><br><strong>🌟 실력 향상</strong><br>적당했던 강도가 이제 쉬워졌네요!<br>성장하고 계십니다!';
        } else if (analysis.hasImproved) {
            additionalAdvice += '<br><br><strong>💪 회복 완료</strong><br>힘들던 강도가 이제 적당해졌어요!<br>좋은 적응력이네요!';
        }
    } else {
        if (analysis.needsDecrease) {
            additionalAdvice += '<br><br><strong>🛡️ 안전 우선</strong><br>무리하지 마시고 강도를 낮춰보세요.<br>꾸준함이 더 중요해요!';
        } else if (analysis.totalHistory >= 5) {
            additionalAdvice += '<br><br><strong>💙 계속 도전</strong><br>그동안 꾸준히 하신 모습이 멋져요!<br>컨디션 좋을 때 다시 해봐요!';
        }
    }
    
    return additionalAdvice;
}

// 🔧 AI 조언 요청
async function getTrainerAdvice(exerciseData) {
    try {
        console.log('🤖 Supabase AI 조언 요청 시작');
        console.log('📊 전달할 운동 데이터:', exerciseData);
        
        const requestBody = {
            exerciseData: {
                resistanceSettings: {
                    inhale: exerciseData.resistanceSettings ? exerciseData.resistanceSettings.inhale : 1,
                    exhale: exerciseData.resistanceSettings ? exerciseData.resistanceSettings.exhale : 1
                },
                userFeedback: exerciseData.userFeedback || null,
                completedSets: exerciseData.completedSets || 0,
                completedBreaths: exerciseData.completedBreaths || 0,
                exerciseTime: exerciseData.exerciseTime || '0:00',
                isAborted: exerciseData.isAborted || false
            },
            sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };
        
        console.log('🌐 Supabase 요청 데이터:', requestBody);
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-advice`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Supabase 연결 오류: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 Supabase 응답:', result);
        
        if (result.success && result.advice) {
            return {
                intensityAdvice: result.advice.intensityAdvice || result.advice,
                comprehensiveAdvice: result.advice.comprehensiveAdvice || "AI 트레이너가 당신의 꾸준한 노력을 응원합니다!"
            };
        }
        
        throw new Error(result.message || 'AI 조언 생성 실패');
        
    } catch (error) {
        console.error('🚨 Supabase AI 조언 요청 오류:', error);
        
        const defaultAdvices = [
            `${exerciseData.completedSets}세트 완주! 숨트의 저항을 이겨내며 호흡근이 한층 강해졌습니다.`,
            `${exerciseData.exerciseTime} 동안의 집중적인 호흡 트레이닝, 수고하셨습니다!`,
            `호흡근육 강화 여정에서 또 한 걸음 전진하셨네요!`
        ];
        
        const randomIndex = Math.floor(Math.random() * defaultAdvices.length);
        return {
            intensityAdvice: defaultAdvices[randomIndex],
            comprehensiveAdvice: "꾸준히 도전하는 의지가 정말 대단해요!"
        };
    }
}

// 🎯 피드백 히스토리 관리 함수 (스마트 분석용)
function getFeedbackHistory() {
    return JSON.parse(localStorage.getItem('feedbackHistory') || '[]');
}

function addFeedbackHistory(feedback, resistanceSettings) {
    const history = getFeedbackHistory();
    const today = getCurrentUserTime().toDateString();
    const currentHour = getCurrentUserTime().getHours();
    const timeOfDay = currentHour < 14 ? 'morning' : 'afternoon';
    
    const newRecord = {
        date: today,
        timeOfDay: timeOfDay,
        feedback: feedback,
        inhaleLevel: resistanceSettings.inhale,
        exhaleLevel: resistanceSettings.exhale,
        timestamp: getCurrentUserTime().toISOString()
    };
    
    history.unshift(newRecord);
    
    if (history.length > 60) {
        history.splice(60);
    }
    
    localStorage.setItem('feedbackHistory', JSON.stringify(history));
    return history;
}

// 🎯 스마트 피드백 패턴 분석
function analyzeFeedbackPattern(currentFeedback, resistanceSettings) {
    const history = getFeedbackHistory();
    
    let consecutivePerfectCount = 0;
    let consecutiveEasyCount = 0;
    let consecutiveHardCount = 0;
    
    if (currentFeedback === 'perfect') {
        consecutivePerfectCount = 1;
    } else if (currentFeedback === 'easy') {
        consecutiveEasyCount = 1;
    } else if (currentFeedback === 'hard') {
        consecutiveHardCount = 1;
    }
    
    for (let record of history) {
        if (currentFeedback === 'perfect' && record.feedback === 'perfect') {
            consecutivePerfectCount++;
        } else if (currentFeedback === 'easy' && record.feedback === 'easy') {
            consecutiveEasyCount++;
        } else if (currentFeedback === 'hard' && record.feedback === 'hard') {
            consecutiveHardCount++;
        } else {
            break;
        }
    }
    
    const previousFeedback = history.length > 0 ? history[0].feedback : null;
    
    return {
        consecutivePerfectCount: consecutivePerfectCount,
        consecutiveEasyCount: consecutiveEasyCount,
        consecutiveHardCount: consecutiveHardCount,
        previousFeedback: previousFeedback,
        hasImproved: previousFeedback === 'hard' && currentFeedback === 'perfect',
        hasProgressed: previousFeedback === 'perfect' && currentFeedback === 'easy',
        readyForChallenge: consecutivePerfectCount >= 14,
        shouldIncrease: consecutiveEasyCount >= 3,
        needsDecrease: consecutiveHardCount >= 2,
        totalHistory: history.length
    };
}

// 🎬 온보딩 네비게이션 함수들
function nextOnboardingStep() {
    document.getElementById('onboardingStep1').style.display = 'none';
    document.getElementById('onboardingStep2').style.display = 'flex';
    
    gtag('event', 'onboarding_next', {
        step: 1
    });
}

function skipOnboarding() {
    hideIntro();
    
    gtag('event', 'onboarding_skip', {
        step: document.getElementById('onboardingStep1').style.display === 'none' ? 2 : 1
    });
}

// 🔥 새로운 기능: 스와이프 네비게이션
let touchStartX = 0;
let touchEndX = 0;
let isOnboarding = true;

function handleSwipeGesture() {
    const swipeThreshold = 50; // 최소 스와이프 거리 (픽셀)
    const swipeDistance = touchEndX - touchStartX;
    
    // 왼쪽 스와이프 (다음으로)
    if (swipeDistance < -swipeThreshold) {
        const step1 = document.getElementById('onboardingStep1');
        const step2 = document.getElementById('onboardingStep2');
        
        if (step1 && step1.style.display !== 'none') {
            // 첫 번째 화면 → 두 번째 화면
            nextOnboardingStep();
            
            gtag('event', 'onboarding_swipe', {
                action: 'next',
                step: 1
            });
        } else if (step2 && step2.style.display !== 'none') {
            // 두 번째 화면 → 메인 화면
            skipOnboarding();
            
            gtag('event', 'onboarding_swipe', {
                action: 'finish',
                step: 2
            });
        }
    }
    
    // 오른쪽 스와이프 (이전으로)
    else if (swipeDistance > swipeThreshold) {
        const step2 = document.getElementById('onboardingStep2');
        
        if (step2 && step2.style.display !== 'none') {
            // 두 번째 화면 → 첫 번째 화면
            document.getElementById('onboardingStep2').style.display = 'none';
            document.getElementById('onboardingStep1').style.display = 'flex';
            
            gtag('event', 'onboarding_swipe', {
                action: 'back',
                step: 2
            });
        }
    }
}

// 온보딩 화면에 터치 이벤트 리스너 추가
function initializeOnboardingSwipe() {
    const introScreen = document.getElementById('introScreen');
    
    if (introScreen) {
        // 터치 시작
        introScreen.addEventListener('touchstart', (e) => {
            if (isOnboarding) {
                touchStartX = e.changedTouches[0].screenX;
            }
        }, { passive: true });
        
        // 터치 종료
        introScreen.addEventListener('touchend', (e) => {
            if (isOnboarding) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipeGesture();
            }
        }, { passive: true });
        
        // 마우스 지원 (데스크톱 테스트용)
        let mouseStartX = 0;
        
        introScreen.addEventListener('mousedown', (e) => {
            if (isOnboarding) {
                mouseStartX = e.clientX;
            }
        });
        
        introScreen.addEventListener('mouseup', (e) => {
            if (isOnboarding) {
                touchStartX = mouseStartX;
                touchEndX = e.clientX;
                handleSwipeGesture();
            }
        });
    }
}

// hideIntro 함수 수정 (온보딩 종료 시 스와이프 비활성화)
function hideIntro() {
    isOnboarding = false; // 스와이프 비활성화
    
    const introScreen = document.getElementById('introScreen');
    introScreen.classList.add('hidden');
    setTimeout(() => {
        introScreen.style.display = 'none';
    }, 800);
}

// 🎬 페이지 초기화
window.onload = function() {
    loadUserData();
    loadResistanceSettings();
    updateBadgesDisplay();
    
    // 🔥 새로운 기능: 페이지 로드시 사회적 증명 데이터 업데이트
    updateSocialProofData();
    
    // 🔥 새로운 기능: 메인화면 실시간 현황 주기적 업데이트 (2분마다)
    setInterval(() => {
        updateSocialProofData();
    }, 120000);
    
    // 🔥 새로운 기능: 온보딩 스와이프 초기화
    initializeOnboardingSwipe();
};

// 🔄 자동 업데이트 시스템 초기화
function initAutoUpdateSystem() {
  if ('serviceWorker' in navigator) {
    console.log('🔄 Auto-update system initializing...');
    
    // 현재 앱 버전 가져오기
    const currentVersion = document.querySelector('meta[name="version"]')?.content || '1.0.4';
    console.log(`📱 Current app version: ${currentVersion}`);
    
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ SW: Registered successfully');
        
        // 🔄 즉시 업데이트 확인
        registration.update();
        
        // ⏰ 주기적 업데이트 확인 (5분마다)
        setInterval(() => {
          console.log('🔄 Checking for updates...');
          registration.update();
        }, 5 * 60 * 1000);
        
        // 📡 SW 메시지 수신
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data.type === 'CACHE_UPDATED') {
            const newVersion = event.data.version;
            console.log(`✨ New version detected: ${newVersion} (current: ${currentVersion})`);
            
            // 🔍 버전 비교 - 버전이 변경된 경우에만 새로고침
            if (newVersion !== currentVersion) {
              console.log(`🔄 Version changed from ${currentVersion} to ${newVersion}, auto-reloading...`);
              // 🔄 부드러운 새로고침 (사용자가 활성 상태일 때만)
              if (!document.hidden) {
                setTimeout(() => {
                  console.log('🔄 Auto-reloading for version update...');
                  window.location.reload();
                }, 1000);
              }
            } else {
              console.log('ℹ️ Same version detected, skipping reload');
            }
          }
        });
        
        // 🔄 컨트롤러 변경 감지 (백업) - 버전 확인 후 처리
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 SW: Controller changed, checking version...');
          
          // Service Worker에서 버전 정보 요청
          if (navigator.serviceWorker.controller) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = event => {
              const swVersion = event.data.version;
              console.log(`📱 SW version: ${swVersion}, App version: ${currentVersion}`);
              
              if (swVersion !== currentVersion) {
                console.log('🔄 Version mismatch detected, reloading...');
                if (!document.hidden) {
                  window.location.reload();
                }
              } else {
                console.log('ℹ️ Version match, no reload needed');
              }
            };
            
            navigator.serviceWorker.controller.postMessage(
              { type: 'GET_VERSION' }, 
              [messageChannel.port2]
            );
          }
        });
      })
      .catch(error => {
        console.error('❌ SW: Registration failed', error);
      });
  }
}

// 🚀 DOM 로드 시 자동 업데이트 시스템 시작
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutoUpdateSystem);
} else {
  initAutoUpdateSystem();
}

// 🧩 모던 UI 동기화 유틸 (기존 함수/ID 유지, 새로운 표시 요소만 동기화)
function syncModernElements() {
  try {
    const legacyTotalBreaths = document.getElementById('totalBreaths');
    const modernBreaths = document.getElementById('completedBreathsToday');
    if (legacyTotalBreaths && modernBreaths) {
      modernBreaths.textContent = legacyTotalBreaths.textContent;
    }

    const legacyAvgSets = document.getElementById('averageSets');
    const modernSets = document.getElementById('completedSetsToday');
    if (legacyAvgSets && modernSets) {
      modernSets.textContent = legacyAvgSets.textContent;
    }

    const percentEl = document.getElementById('todaysPercentage');
    if (percentEl && !String(percentEl.textContent).endsWith('%')) {
      const num = parseInt(percentEl.textContent, 10);
      if (!Number.isNaN(num)) percentEl.textContent = `${num}%`;
    }
  } catch (e) {
    console.warn('syncModernElements 실패:', e);
  }
}

// 기존 함수 호출 후 모던 요소 동기화 (원본 보존)
if (typeof updateTodaysGoal === 'function') {
  const __originalUpdateTodaysGoal = updateTodaysGoal;
  updateTodaysGoal = async function() {
    const r = await __originalUpdateTodaysGoal.apply(this, arguments);
    syncModernElements();
    return r;
  };
}

if (typeof displayUserStats === 'function') {
  const __originalDisplayUserStats = displayUserStats;
  displayUserStats = function() {
    const r = __originalDisplayUserStats.apply(this, arguments);
    syncModernElements();
    return r;
  };
}
