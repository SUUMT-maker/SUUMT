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

// 3️⃣ 로그인 상태 감지
window.supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    console.log('✅ Kakao user signed in:', session.user);
    console.log('👤 User ID:', session.user.id);
    window.currentUserId = session.user.id;

    // 화면 전환
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
  }
});

// 4️⃣ 페이지 새로고침 시 세션 확인
(async function checkSession() {
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (session?.user) {
    console.log('✅ Session found:', session.user);
    console.log('👤 User ID:', session.user.id);
    window.currentUserId = session.user.id;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
  }
})();

// 🏠 메인 앱 관련 함수들

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
        date: session.exercise_date,
        sets: session.completed_sets,
        duration: session.exercise_time,
        avg_resistance: Math.round((session.inhale_resistance + session.exhale_resistance) / 2),
        ai_summary: session.is_aborted ? "운동을 중단하셨네요. 다음에는 완주해보세요!" : "운동 완료! 꾸준히 해봅시다."
    };
}

function renderCalendar(sessions) {
    const calendarContainer = document.querySelector('.records-calendar');
    const records = sessions.map(transformSessionToRecord);
    const days = [...new Set(records.map(r => r.date))];

    let html = '<table class="calendar"><tr>';
    for (let d = 1; d <= 30; d++) {
        const dayStr = d.toString().padStart(2, '0');
        const fullDate = `2025-08-${dayStr}`; // FIXME: month dynamic
        const hasRecord = days.includes(fullDate);
        html += `<td class="${hasRecord ? 'has-record' : ''}" data-day="${fullDate}">${d}</td>`;
        if (d % 7 === 0) html += '</tr><tr>';
    }
    html += '</tr></table>';
    calendarContainer.innerHTML = html;

    calendarContainer.querySelectorAll('td').forEach(td => {
        td.addEventListener('click', async () => {
            const day = td.getAttribute('data-day');
            const selected = records.filter(r => r.date === day && r.sets > 0);
            await renderRecordSummary(selected[0]);
        });
    });
}

async function renderRecordSummary(record) {
    const dateEl = document.getElementById('selectedDate');
    const summaryEl = document.getElementById('recordSummaryList');
    const adviceEl = document.getElementById('aiAdviceSummary');

    if (!record) {
        dateEl.innerText = '-';
        summaryEl.innerHTML = '<li>운동 기록 없음</li>';
        adviceEl.innerText = '운동 기록이 없어 AI 조언을 제공할 수 없습니다.';
        return;
    }

    dateEl.innerText = record.date;
    summaryEl.innerHTML = `
        <li>운동 세트 수: ${record.sets}</li>
        <li>총 운동 시간: ${record.duration}</li>
        <li>평균 저항 강도: ${record.avg_resistance}</li>
    `;

    // Fetch latest AI advice for the selected date
    console.log('🔍 Fetching AI advice for date:', record.date);
    const advice = await fetchAiAdviceForDate(record.date);
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
                started_at,
                completed_at,
                exercise_duration,
                completed_sets,
                completed_breaths,
                inhale_resistance,
                exhale_resistance,
                user_feedback,
                is_aborted
            `)
            .eq('user_id', window.currentUserId)
            .not('completed_at', 'is', null)
            .order('started_at', { ascending: false });

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
        // 해당 날짜의 세션들 먼저 찾기 
        const startOfDay = `${date}T00:00:00Z`;
        const endOfDay = `${date}T23:59:59Z`;
        
        const { data: sessions, error: sessionError } = await window.supabaseClient
            .from('exercise_sessions')
            .select('id, ai_advice')
            .eq('user_id', window.currentUserId)
            .gte('started_at', startOfDay)
            .lt('started_at', endOfDay)
            .not('completed_at', 'is', null);

        if (sessionError) {
            console.error('❌ 세션 조회 실패:', sessionError);
            return null;
        }

        if (!sessions?.length) {
            console.log(`ℹ️ ${date} 날짜에 운동 기록이 없습니다.`);
            return null;
        }

        // AI 조언이 있는 세션 찾기 (ai_advice 컬럼 직접 사용)
        const sessionWithAdvice = sessions.find(s => s.ai_advice);
        
        if (sessionWithAdvice?.ai_advice) {
            const advice = sessionWithAdvice.ai_advice;
            // JSON 객체에서 텍스트 추출
            const adviceText = advice.comprehensive_advice || 
                              advice.intensity_analysis || 
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
        const startOfDay = `${date}T00:00:00Z`;
        const endOfDay = `${date}T23:59:59Z`;
        
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select(`
                completed_sets,
                completed_breaths,
                exercise_duration,
                inhale_resistance,
                exhale_resistance,
                user_feedback,
                started_at,
                completed_at
            `)
            .eq('user_id', window.currentUserId)
            .gte('started_at', startOfDay)
            .lt('started_at', endOfDay)
            .not('completed_at', 'is', null)
            .order('started_at', { ascending: false });

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

// 전역 함수로 노출
window.showBottomNav = showBottomNav;
window.hideBottomNav = hideBottomNav;
window.switchTab = switchTab;
window.selectWorkoutMode = selectWorkoutMode;
window.onRecordsTabClick = onRecordsTabClick;
window.fetchAiAdviceForDate = fetchAiAdviceForDate;
window.renderRecordSummary = renderRecordSummary;
window.fetchUserExerciseRecords = fetchUserExerciseRecords;
window.fetchRecordSummaryForDate = fetchRecordSummaryForDate;

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

        console.log('🤖 AI 조언 데이터베이스 저장 시작');
        
        const advice = {
            session_id: sessionId,
            intensity_advice: adviceData.intensityAdvice || '',
            comprehensive_advice: adviceData.comprehensiveAdvice || '',
            summary: null, // 추후 구현
            gemini_raw_response: adviceData // 전체 응답 저장
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/ai_advice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(advice)
        });

        if (!response.ok) {
            throw new Error(`AI 조언 저장 실패: ${response.status}`);
        }

        const savedAdvice = await response.json();
        console.log('✅ AI 조언 저장 완료:', savedAdvice[0]);
        return savedAdvice[0];
        
    } catch (error) {
        console.error('❌ AI 조언 저장 실패 (기존 기능에는 영향 없음):', error);
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

// Service Worker 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('✅ ServiceWorker 등록 성공:', registration.scope);
                registration.update();
            })
            .catch(function(error) {
                console.log('❌ ServiceWorker 등록 실패:', error);
            });
    });
}
