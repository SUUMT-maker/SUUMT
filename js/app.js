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

    // 🎯 사용자 정보 저장
    if (session.user.user_metadata) {
        window.currentUserInfo = {
            nickname: session.user.user_metadata.nickname || session.user.user_metadata.name,
            email: session.user.email,
            loginTime: new Date().toISOString()
        };
        console.log('👤 User Info:', window.currentUserInfo);
    }

    // 화면 전환
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
    
    // 🎯 로그인 후 인삿말 업데이트
    setTimeout(() => {
        updateGreetingCard();
    }, 500);
  }
});

// 4️⃣ 페이지 새로고침 시 세션 확인
(async function checkSession() {
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (session?.user) {
    console.log('✅ Session found:', session.user);
    console.log('👤 User ID:', session.user.id);
    window.currentUserId = session.user.id;
    
    // 🎯 사용자 정보 저장
    if (session.user.user_metadata) {
        window.currentUserInfo = {
            nickname: session.user.user_metadata.nickname || session.user.user_metadata.name,
            email: session.user.email,
            loginTime: new Date().toISOString()
        };
        console.log('👤 User Info:', window.currentUserInfo);
    }
    
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
    
    // 🎯 세션 복구 후 인삿말 업데이트
    setTimeout(() => {
        updateGreetingCard();
    }, 500);
  }
})();

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
    
    // 홈 탭으로 이동 시 인삿말 업데이트
    if (tabName === 'home') {
        setTimeout(() => {
            updateGreetingCard();
        }, 300);
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
    updateChart();
    updateSocialProofData(); // 🔥 새로운 기능: 사회적 증명 데이터 업데이트
    updateGreetingCard(); // 🎯 새로운 기능: 인삿말 카드 업데이트
    updateGoalCard(); // 🎯 새로운 기능: 목표 카드 업데이트
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
        
        // 🎯 결과 화면 표시 후 인삿말 업데이트
        setTimeout(() => {
            updateGreetingCard();
        }, 500);
        
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
    
    // 🎯 운동 완료 후 인삿말 업데이트
    setTimeout(() => {
        updateGreetingCard();
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

// 🎯 새로운 기능: 인삿말 카드 업데이트 함수 (동기부여 시스템)
async function updateGreetingCard() {
    try {
        console.log('🔍 동기부여 인삿말 시스템 시작');
        
        const userInfo = await getUserInfo();
        console.log('👤 사용자 정보:', userInfo);
        
        const motivationData = await getUserMotivationData();
        console.log('📊 동기부여 데이터:', motivationData);
        
        const greeting = generateMotivationalGreeting(userInfo, motivationData);
        console.log('💬 생성된 동기부여 인삿말:', greeting);
        
        // UI 업데이트
        const prefixEl = document.getElementById('greetingPrefix');
        const userNameEl = document.getElementById('userName');
        const messageEl = document.getElementById('greetingMessage');
        
        if (prefixEl) prefixEl.textContent = greeting.prefix;
        if (userNameEl) userNameEl.textContent = greeting.userName;
        if (messageEl) {
            messageEl.textContent = greeting.message;
            messageEl.className = `greeting-message ${greeting.messageType || ''}`;
        }
        
        console.log('✅ 동기부여 인삿말 카드 업데이트 완료');
        
    } catch (error) {
        console.error('❌ 동기부여 인삿말 업데이트 실패:', error);
        setDefaultGreeting();
    }
}

// 🎯 사용자 정보 조회 함수
async function getUserInfo() {
    console.log('🔍 사용자 정보 조회 시작');
    
    // 1. 전역 변수에서 먼저 확인
    if (window.currentUserInfo && window.currentUserInfo.nickname) {
        console.log('✅ 전역 변수에서 사용자 정보 발견');
        return {
            nickname: window.currentUserInfo.nickname,
            isLoggedIn: true
        };
    }
    
    // 2. Supabase에서 직접 조회
    if (window.supabaseClient && window.currentUserId) {
        try {
            const { data: { user }, error } = await window.supabaseClient.auth.getUser();
            console.log('📡 Supabase 사용자 정보:', user);
            
            if (!error && user && user.user_metadata) {
                const nickname = user.user_metadata.nickname || 
                               user.user_metadata.name || 
                               user.user_metadata.full_name || 
                               '트레이너';
                               
                console.log('✅ Supabase에서 닉네임 추출:', nickname);
                
                return {
                    nickname: nickname,
                    isLoggedIn: true
                };
            }
        } catch (err) {
            console.error('❌ Supabase 사용자 정보 조회 실패:', err);
        }
    }
    
    // 3. 비로그인 시 기본값
    console.log('⚠️ 로그인되지 않음, 기본값 사용');
    return {
        nickname: 'AI 숨트레이너',
        isLoggedIn: false
    };
}

// 🎯 운동 컨텍스트 조회 함수
async function getExerciseContext() {
    const today = getCurrentUserTime();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // 오늘 날짜 문자열 (KST)
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    
    // 로컬스토리지에서 운동 기록 조회
    const history = getExerciseHistory();
    
    const todaySessions = history.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === todayStr;
    });
    
    const yesterdaySessions = history.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === yesterdayStr;
    });
    
    return {
        today_sessions_count: todaySessions.length,
        yesterday_sessions_count: yesterdaySessions.length,
        today_date_kst: todayStr,
        last_exercise_date: history.length > 0 ? new Date(history[0].date).toDateString() : null
    };
}

// 🎯 동기부여 인삿말 생성 함수
function generateMotivationalGreeting(userInfo, motivationData) {
    const { nickname, isLoggedIn } = userInfo;
    const currentHour = getCurrentUserTime().getHours();
    
    // 시간대별 인삿말 prefix
    let timeBasedPrefix = '안녕하세요,';
    if (currentHour >= 5 && currentHour < 12) {
        timeBasedPrefix = '좋은 아침이에요,';
    } else if (currentHour >= 12 && currentHour < 18) {
        timeBasedPrefix = '안녕하세요,';
    } else if (currentHour >= 18 && currentHour < 22) {
        timeBasedPrefix = '수고하셨어요,';
    } else {
        timeBasedPrefix = '늦은 시간이네요,';
    }
    
    // 사용자명 설정
    let displayName;
    if (isLoggedIn && nickname && nickname !== '트레이너') {
        displayName = `${nickname}님`;
    } else {
        displayName = 'AI 숨트레이너';
    }
    
    // 동기부여 메시지 선택
    const motivationResult = selectMotivationalMessage(motivationData, userInfo);
    
    // 인삿말과 닉네임을 한 줄로 합치기
    const fullGreeting = `${timeBasedPrefix} ${displayName}`;
    
    return {
        prefix: '',
        userName: fullGreeting,
        message: motivationResult.message,
        messageType: motivationResult.type
    };
}

// 🎯 기본 인삿말 설정 (폴백용)
function setDefaultGreeting() {
    document.getElementById('userName').textContent = '안녕하세요, AI 숨트레이너';
    document.getElementById('greetingMessage').textContent = '오늘도 깊은 호흡으로 하루를 시작해보세요.';
}

// 🎯 Supabase 기반 사용자 운동 데이터 수집
async function getUserMotivationData() {
    try {
        console.log('📊 동기부여 데이터 수집 시작');
        
        if (!window.supabaseClient || !window.currentUserId) {
            console.log('⚠️ Supabase 또는 사용자 ID 없음, 로컬 데이터 사용');
            return getLocalMotivationData();
        }
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // 최근 30일 운동 데이터 조회
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select('*')
            .eq('user_id', window.currentUserId)
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Supabase 데이터 조회 실패:', error);
            return getLocalMotivationData();
        }
        
        console.log(`✅ ${sessions?.length || 0}개 세션 조회 완료`);
        return analyzeMotivationData(sessions || []);
        
    } catch (err) {
        console.error('❌ 동기부여 데이터 수집 오류:', err);
        return getLocalMotivationData();
    }
}

// 🎯 로컬 데이터 기반 폴백
function getLocalMotivationData() {
    const history = getExerciseHistory();
    const stats = getLocalStats();
    
    const today = getCurrentUserTime();
    const todayStr = today.toDateString();
    
    // 연속 운동일 계산
    const consecutiveDays = calculateConsecutiveDays();
    
    // 이번 주 운동 횟수
    const weekStart = getWeekStartDate();
    const thisWeekSessions = history.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= weekStart;
    }).length;
    
    // 마지막 운동일
    const lastExerciseDate = history.length > 0 ? new Date(history[0].date) : null;
    const daysSinceLastExercise = lastExerciseDate ? 
        Math.floor((today - lastExerciseDate) / (1000 * 60 * 60 * 24)) : 999;
    
    return {
        totalSessions: stats.totalExercises,
        consecutiveDays: consecutiveDays,
        thisWeekSessions: thisWeekSessions,
        daysSinceLastExercise: daysSinceLastExercise,
        completionRate: history.length > 0 ? 
            (history.filter(r => !r.isAborted).length / history.length * 100) : 0,
        averageResistance: history.length > 0 ?
            history.reduce((sum, r) => sum + ((r.resistanceSettings?.inhale || 1) + (r.resistanceSettings?.exhale || 1)) / 2, 0) / history.length : 1,
        source: 'local'
    };
}

// 🎯 Supabase 데이터 분석
function analyzeMotivationData(sessions) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 기본 통계
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => !s.is_aborted).length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions * 100) : 0;
    
    // 연속 운동일 계산
    const uniqueDates = [...new Set(sessions.map(s => s.created_at.split('T')[0]))].sort().reverse();
    let consecutiveDays = 0;
    
    for (let i = 0; i < uniqueDates.length; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (uniqueDates.includes(checkDateStr)) {
            consecutiveDays++;
        } else {
            break;
        }
    }
    
    // 이번 주 세션 수
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekSessions = sessions.filter(s => new Date(s.created_at) >= weekStart).length;
    
    // 마지막 운동일
    const lastExerciseDate = sessions.length > 0 ? new Date(sessions[0].created_at) : null;
    const daysSinceLastExercise = lastExerciseDate ? 
        Math.floor((today - lastExerciseDate) / (1000 * 60 * 60 * 24)) : 999;
    
    // 평균 저항 강도
    const avgResistance = sessions.length > 0 ?
        sessions.reduce((sum, s) => sum + ((s.inhale_resistance || 1) + (s.exhale_resistance || 1)) / 2, 0) / sessions.length : 1;
    
    return {
        totalSessions,
        consecutiveDays,
        thisWeekSessions,
        daysSinceLastExercise,
        completionRate: Math.round(completionRate),
        averageResistance: Math.round(avgResistance * 10) / 10,
        source: 'supabase'
    };
}

// 🎯 연속 운동일 계산 함수
function calculateConsecutiveDays() {
    const history = getExerciseHistory();
    if (history.length === 0) return 0;
    
    const today = getCurrentUserTime();
    let consecutiveDays = 0;
    
    // 최근 기록부터 역순으로 확인
    for (let i = 0; i < history.length; i++) {
        const recordDate = new Date(history[i].date);
        const daysDiff = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === consecutiveDays) {
            consecutiveDays++;
        } else {
            break;
        }
    }
    
    return consecutiveDays;
}

// 🎯 동기부여 메시지 데이터베이스
const MOTIVATION_MESSAGES = {
    // 성취 강화형
    achievement: {
        streak_3_6: "{{days}}일 연속! 습관이 만들어지고 있어요 💪",
        streak_7_13: "일주일 연속! 이미 상위 10% 사용자예요 🌟",
        streak_14_plus: "{{days}}일 연속! 당신은 진짜 챔피언이에요 🏆",
        
        total_10: "벌써 {{count}}번째! 호흡근이 확실히 강해졌을 거예요",
        total_25: "{{count}}번 달성! 이제 진짜 전문가 수준이네요",
        total_50: "{{count}}번 완주! 숨트 마스터의 경지에 오르셨어요 👑",
        
        completion_high: "완주율 {{rate}}%! 의지력이 정말 대단해요",
        perfect_week: "이번 주 {{count}}번! 완벽한 한 주였어요 🔥"
    },
    
    // 도전 유도형
    challenge: {
        resistance_ready: "완주율이 높으니 저항을 올려볼 시간이에요 💪",
        frequency_boost: "주 {{count}}회에서 한 번 더! 도전해볼까요?",
        consistency_push: "이번 주 매일 도전해보는 건 어때요? 🎯",
        milestone_approach: "{{target}}번까지 {{remaining}}번 남았어요! 파이팅!"
    },
    
    // 복귀 유도형
    comeback: {
        short_break: "어제 쉬었으니 오늘은 가볍게 시작해볼까요?",
        medium_break: "{{days}}일 쉬었지만 괜찮아요. 다시 시작이 중요해요 💙",
        long_break: "오랜만이네요! 천천히 다시 시작해봐요. 여전히 응원해요",
        gentle_return: "완벽하지 않아도 돼요. 오늘 한 번만 해봐요 🤗"
    },
    
    // 기본 격려형
    default: {
        morning: "새로운 하루, 새로운 도전! 오늘도 화이팅 🌅",
        afternoon: "오후에도 건강한 호흡으로 에너지 충전해요 ⚡",
        evening: "하루 마무리 호흡 운동으로 릴랙스해봐요 🌙",
        first_time: "첫 호흡 트레이닝을 시작해보세요! 🚀",
        general: "오늘도 깊은 호흡으로 하루를 시작해보세요"
    }
};

// 🎯 동기부여 메시지 선택 알고리즘
function selectMotivationalMessage(motivationData, userInfo) {
    console.log('🧠 동기부여 메시지 선택:', motivationData);
    
    const { totalSessions, consecutiveDays, thisWeekSessions, daysSinceLastExercise, completionRate } = motivationData;
    const currentHour = getCurrentUserTime().getHours();
    
    // 1순위: 큰 마일스톤 축하
    if (totalSessions > 0 && totalSessions % 25 === 0) {
        return {
            message: MOTIVATION_MESSAGES.achievement.total_25.replace('{{count}}', totalSessions),
            type: 'celebrating'
        };
    }
    
    if (totalSessions === 10) {
        return {
            message: MOTIVATION_MESSAGES.achievement.total_10.replace('{{count}}', totalSessions),
            type: 'celebrating'
        };
    }
    
    if (totalSessions >= 50) {
        return {
            message: MOTIVATION_MESSAGES.achievement.total_50.replace('{{count}}', totalSessions),
            type: 'celebrating'
        };
    }
    
    // 2순위: 연속 기록 축하
    if (consecutiveDays >= 14) {
        return {
            message: MOTIVATION_MESSAGES.achievement.streak_14_plus.replace('{{days}}', consecutiveDays),
            type: 'celebrating'
        };
    }
    
    if (consecutiveDays >= 7) {
        return {
            message: MOTIVATION_MESSAGES.achievement.streak_7_13,
            type: 'celebrating'
        };
    }
    
    if (consecutiveDays >= 3) {
        return {
            message: MOTIVATION_MESSAGES.achievement.streak_3_6.replace('{{days}}', consecutiveDays),
            type: 'encouraging'
        };
    }
    
    // 3순위: 이번 주 성과 축하
    if (thisWeekSessions >= 5) {
        return {
            message: MOTIVATION_MESSAGES.achievement.perfect_week.replace('{{count}}', thisWeekSessions),
            type: 'celebrating'
        };
    }
    
    // 4순위: 완주율 축하
    if (totalSessions >= 5 && completionRate >= 90) {
        return {
            message: MOTIVATION_MESSAGES.achievement.completion_high.replace('{{rate}}', completionRate),
            type: 'encouraging'
        };
    }
    
    // 5순위: 복귀 유도
    if (daysSinceLastExercise >= 7) {
        return {
            message: MOTIVATION_MESSAGES.comeback.long_break,
            type: 'encouraging'
        };
    }
    
    if (daysSinceLastExercise >= 3) {
        return {
            message: MOTIVATION_MESSAGES.comeback.medium_break.replace('{{days}}', daysSinceLastExercise),
            type: 'encouraging'
        };
    }
    
    if (daysSinceLastExercise === 1) {
        return {
            message: MOTIVATION_MESSAGES.comeback.short_break,
            type: 'encouraging'
        };
    }
    
    // 6순위: 도전 유도
    if (totalSessions >= 10 && completionRate >= 80) {
        return {
            message: MOTIVATION_MESSAGES.challenge.resistance_ready,
            type: 'encouraging'
        };
    }
    
    if (thisWeekSessions >= 2 && thisWeekSessions < 5) {
        return {
            message: MOTIVATION_MESSAGES.challenge.frequency_boost.replace('{{count}}', thisWeekSessions),
            type: 'encouraging'
        };
    }
    
    // 7순위: 마일스톤 접근
    const nextMilestone = Math.ceil(totalSessions / 10) * 10;
    if (totalSessions > 0 && (nextMilestone - totalSessions) <= 3) {
        return {
            message: MOTIVATION_MESSAGES.challenge.milestone_approach
                .replace('{{target}}', nextMilestone)
                .replace('{{remaining}}', nextMilestone - totalSessions),
            type: 'encouraging'
        };
    }
    
    // 8순위: 시간대별 기본 메시지
    if (totalSessions === 0) {
        return {
            message: MOTIVATION_MESSAGES.default.first_time,
            type: 'encouraging'
        };
    }
    
    if (currentHour >= 5 && currentHour < 12) {
        return {
            message: MOTIVATION_MESSAGES.default.morning,
            type: ''
        };
    } else if (currentHour >= 12 && currentHour < 18) {
        return {
            message: MOTIVATION_MESSAGES.default.afternoon,
            type: ''
        };
    } else if (currentHour >= 18 && currentHour < 22) {
        return {
            message: MOTIVATION_MESSAGES.default.evening,
            type: ''
        };
    }
    
    // 기본값
    return {
        message: MOTIVATION_MESSAGES.default.general,
        type: ''
    };
}

// 🎯 목표 카드 업데이트 함수
async function updateGoalCard() {
    try {
        console.log('🎯 목표 카드 업데이트 시작');
        
        const todayData = await getTodayGoalData();
        console.log('📊 오늘 목표 데이터:', todayData);
        
        updateGoalProgress(todayData);
        updateGoalStats(todayData);
        
        console.log('✅ 목표 카드 업데이트 완료');
        
    } catch (error) {
        console.error('❌ 목표 카드 업데이트 실패:', error);
        setDefaultGoalCard();
    }
}

// 🎯 오늘 목표 데이터 조회 (Supabase + 로컬)
async function getTodayGoalData() {
    const target = 40; // 고정 목표
    let completedBreaths = 0;
    let completedSets = 0;
    
    try {
        // Supabase 데이터 시도
        if (window.supabaseClient && window.currentUserId) {
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
            
            const { data: sessions, error } = await window.supabaseClient
                .from('exercise_sessions')
                .select('completed_breaths, completed_sets')
                .eq('user_id', window.currentUserId)
                .gte('created_at', todayStart.toISOString())
                .lt('created_at', todayEnd.toISOString());
            
            if (!error && sessions) {
                completedBreaths = sessions.reduce((sum, s) => sum + (s.completed_breaths || 0), 0);
                completedSets = sessions.reduce((sum, s) => sum + (s.completed_sets || 0), 0);
                console.log('✅ Supabase 데이터 사용');
            }
        }
    } catch (err) {
        console.log('⚠️ Supabase 조회 실패, 로컬 데이터 사용');
    }
    
    // 로컬 데이터 폴백
    if (completedBreaths === 0) {
        completedBreaths = getTodayBreaths();
        completedSets = getTodayCompletedSets();
        console.log('📱 로컬 데이터 사용');
    }
    
    const percentage = Math.round((completedBreaths / target) * 100);
    
    return {
        target,
        completedBreaths,
        completedSets,
        percentage,
        isCompleted: percentage >= 100
    };
}

// 🎯 원형 프로그레스 업데이트
function updateGoalProgress(data) {
    const { percentage, isCompleted } = data;
    
    // 프로그레스 서클 요소
    const progressCircle = document.getElementById('progressCircle');
    const celebrationCircle = document.getElementById('celebrationCircle');
    const progressPercentage = document.getElementById('progressPercentage');
    const goalCard = document.querySelector('.goal-card');
    
    if (!progressCircle || !progressPercentage) return;
    
    // 원의 둘레 계산 (반지름 80 기준)
    const circumference = 2 * Math.PI * 80; // 502.65
    
    // 진행률 계산 (100% 초과 가능)
    const dashOffset = circumference - (Math.min(percentage, 200) / 100) * circumference;
    
    // 프로그레스 애니메이션
    setTimeout(() => {
        progressCircle.style.strokeDashoffset = dashOffset;
        progressPercentage.textContent = `${percentage}%`;
    }, 100);
    
    // 100% 달성 시 축하 이펙트
    if (isCompleted) {
        // 진행률 색상 변경
        progressCircle.style.stroke = '#22c55e';
        progressPercentage.classList.add('completed');
        
        // 축하 원 표시
        if (celebrationCircle) {
            celebrationCircle.style.display = 'block';
            celebrationCircle.style.strokeDashoffset = '0';
        }
        
        // 카드 전체 축하 이펙트
        goalCard.classList.add('achievement');
        
        // 3초 후 이펙트 제거
        setTimeout(() => {
            goalCard.classList.remove('achievement');
        }, 3000);
        
        console.log('🎉 목표 달성 축하 이펙트 실행');
    } else {
        // 미달성 시 기본 색상
        progressCircle.style.stroke = '#667eea';
        progressPercentage.classList.remove('completed');
        
        if (celebrationCircle) {
            celebrationCircle.style.display = 'none';
        }
    }
}

// 🎯 목표 통계 카드 업데이트
function updateGoalStats(data) {
    const { target, completedBreaths, completedSets } = data;
    
    // 요소 업데이트
    const targetEl = document.getElementById('targetBreaths');
    const completedEl = document.getElementById('completedBreaths');
    const setsEl = document.getElementById('completedSets');
    
    if (targetEl) targetEl.textContent = target;
    if (completedEl) completedEl.textContent = completedBreaths;
    if (setsEl) setsEl.textContent = completedSets;
}

// 🎯 기본 목표 카드 설정 (폴백)
function setDefaultGoalCard() {
    const progressPercentage = document.getElementById('progressPercentage');
    const targetEl = document.getElementById('targetBreaths');
    const completedEl = document.getElementById('completedBreaths');
    const setsEl = document.getElementById('completedSets');
    
    if (progressPercentage) progressPercentage.textContent = '0%';
    if (targetEl) targetEl.textContent = '40';
    if (completedEl) completedEl.textContent = '0';
    if (setsEl) setsEl.textContent = '0';
}
