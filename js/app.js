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
  
  const testLoginBtn = document.getElementById('testLoginBtn');
  if (testLoginBtn) {
    testLoginBtn.onclick = skipLogin;
  }
});

function skipLogin() {
    window.currentUserId = 'test_user';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
    
    setTimeout(() => {
        if (typeof clearGreetingCache === 'function') clearGreetingCache();
        if (typeof updateGreetingCard === 'function') updateGreetingCard();
        if (typeof updateGoalCard === 'function') updateGoalCard();
        if (typeof updateChart === 'function') updateChart();
    }, 500);
}

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
        clearGreetingCache(); // 사용자 변경시 캐시 클리어
        updateGreetingCard();
        updateGoalCard(); // ✅ 이 줄 추가
        updateChart(); // ✅ 이 줄 추가
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
        clearGreetingCache(); // 사용자 변경시 캐시 클리어
        updateGreetingCard();
        updateGoalCard(); // ✅ 이 줄 추가
        updateChart(); // ✅ 이 줄 추가
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
async function goToMain() {
    showScreen('mainScreen');
    resetExercise();
    await loadUserData(); // async 호출
}

// 하단 네비게이션 탭 전환 함수
function switchTab(tabName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const newScreen = document.getElementById(
        tabName === 'home' ? 'mainScreen' :
        tabName === 'workout' ? 'workoutModeScreen' :
        tabName === 'records' ? 'recordsScreen' :
        tabName === 'profile' ? 'profileScreen' : null
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
    
    // 프로필 탭으로 이동 시 초기화
    if (tabName === 'profile') {
        setTimeout(() => {
            if (typeof window.initProfileTab === 'function') {
                window.initProfileTab();
            }
        }, 300);
    }
    
    // 홈 탭으로 이동 시 인삿말 업데이트
    if (tabName === 'home') {
        setTimeout(() => {
            updateGreetingCardSmart(); // 캐싱 기반 스마트 호출
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
async function loadUserData() {
    const stats = getLocalStats();
    await updateChart(); // async 호출
    
    // 🔄 profile.js 의존성 체크 및 커뮤니티 데이터 업데이트
    if (typeof window.getCommunityStats === 'function') {
        updateSocialProofData(); // profile.js 로드됨
    } else {
        console.log('⏳ profile.js 로드 대기 중...');
        // 기본값 표시 후 profile.js 로드 대기
        const element = document.getElementById('mainLiveUsersText');
        if (element) {
            element.textContent = '오늘 1,247명 트레이닝 중';
        }
        
        // profile.js 로드 체크 (최대 10초)
        let checkCount = 0;
        const checkInterval = setInterval(() => {
            checkCount++;
            if (typeof window.getCommunityStats === 'function') {
                clearInterval(checkInterval);
                console.log('✅ profile.js 로드 완료, 커뮤니티 데이터 업데이트');
                updateSocialProofData();
            } else if (checkCount >= 20) { // 10초 후 타임아웃
                clearInterval(checkInterval);
                console.warn('⚠️ profile.js 로드 타임아웃');
            }
        }, 500);
    }
    
    updateGreetingCardSmart(); // 🎯 캐싱 기반 스마트 호출
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
    // 피드백 화면 초기화
    resetFeedbackScreen();
    
    updateFeedbackScreenContent();
    showScreen('feedbackScreen');
}

// 피드백 화면 초기화 함수
function resetFeedbackScreen() {
    try {
        console.log('🔧 피드백 화면 초기화 시작');
        
        // 1. userFeedback 변수 초기화
        userFeedback = null;
        console.log('🔧 userFeedback 초기화됨:', userFeedback);
        
        // 2. 모든 피드백 옵션의 CSS 클래스 초기화
        const feedbackOptions = document.querySelectorAll('.feedback-option');
        if (feedbackOptions.length > 0) {
            feedbackOptions.forEach(option => {
                option.classList.remove('selected', 'dimmed');
            });
            console.log('🔧 피드백 옵션 CSS 클래스 초기화 완료:', feedbackOptions.length, '개');
        } else {
            console.warn('⚠️ 피드백 옵션을 찾을 수 없습니다');
        }
        
        // 3. AI 조언 섹션 숨기기
        const aiAdviceSection = document.getElementById('aiAdviceSection');
        if (aiAdviceSection) {
            aiAdviceSection.style.display = 'none';
            console.log('🔧 AI 조언 섹션 숨김 완료');
        } else {
            console.warn('⚠️ aiAdviceSection 요소를 찾을 수 없습니다');
        }
        
        // 4. 기존 반응 버튼들 제거
        const existingButtons = document.getElementById('aiResponseButtons');
        if (existingButtons) {
            existingButtons.remove();
            console.log('🔧 기존 반응 버튼 제거 완료');
        } else {
            console.log('🔧 제거할 반응 버튼이 없습니다');
        }
        
        console.log('🔧 피드백 화면 초기화 완료');
    } catch (error) {
        console.error('❌ 피드백 화면 초기화 중 오류 발생:', error);
    }
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
    console.log('🎯 [디버그] selectFeedback 호출됨 - feedback:', feedback);
    console.log('🎯 [디버그] 호출 전 userFeedback:', userFeedback);
    
    // 기존 userFeedback 설정 유지
    userFeedback = feedback;
    
    console.log('🎯 [디버그] 설정 후 userFeedback:', userFeedback);
    console.log('🎯 [디버그] typeof userFeedback:', typeof userFeedback);
    
    // 1. 선택된 카드 스타일 적용
    document.querySelectorAll('.feedback-option').forEach(option => {
        option.classList.remove('selected');
        option.classList.add('dimmed');
    });
    
    const selectedOption = document.querySelector(`.feedback-option.${feedback}`);
    selectedOption.classList.remove('dimmed');
    selectedOption.classList.add('selected');
    
    console.log('🔧 피드백 옵션 스타일 적용 완료:', feedback);
    
    // 2. AI 조언 표시
    showAIAdvice(feedback);
}

// AI 조언 표시 함수
function showAIAdvice(feedback) {
    console.log('🔧 showAIAdvice 호출됨:', feedback);
    
    const adviceTexts = {
        // 운동 완료 시
        completed: {
            easy: "저항을 거의 못 느꼈다면 다음엔 조금 더 도전해봐요!",
            perfect: "이 정도 저항감이 근육 성장에 가장 효과적이에요! 👍",
            hard: "무리하지 마세요. 천천히 강도를 높여가는 게 중요해요!"
        },
        // 운동 중단 시  
        aborted: {
            easy: "저항이 부족해서 지루하셨나요? 다음엔 조금 더 도전적으로 해봐요!",
            perfect: "강도는 좋았는데 다른 이유가 있으셨군요. 괜찮아요, 무리하지 마세요!",
            hard: "너무 힘드셨군요. 무리하지 않고 중단한 게 현명한 판단이에요!"
        }
    };
    
    const situation = isAborted ? 'aborted' : 'completed';
    const adviceText = adviceTexts[situation][feedback];
    
    console.log('🔧 AI 조언 상황:', situation, '피드백:', feedback);
    console.log('🔧 AI 조언 텍스트:', adviceText);
    
    document.getElementById('aiAdviceText').textContent = adviceText;
    document.getElementById('aiAdviceSection').style.display = 'block';
    
    // 대화형 반응 버튼 2개 추가
    const buttonTexts = getResponseButtons(feedback);
    
    const buttonsHTML = `
        <div id="aiResponseButtons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;">
            <button onclick="proceedToNextStep()" style="background: rgba(102, 126, 234, 0.1); border: 1px solid #667eea; border-radius: 16px; padding: 12px 16px; color: #667eea; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">${buttonTexts[0]}</button>
            <button onclick="proceedToNextStep()" style="background: rgba(102, 126, 234, 0.1); border: #667eea; border-radius: 16px; padding: 12px 16px; color: #667eea; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">${buttonTexts[1]}</button>
        </div>
    `;
    
    document.getElementById('aiAdviceCard').insertAdjacentHTML('afterend', buttonsHTML);
    
    console.log('🔧 AI 조언 및 반응 버튼 표시 완료');
}

// 상황별 버튼 텍스트 반환 함수
function getResponseButtons(feedback) {
    const situation = isAborted ? 'aborted' : 'completed';
    
    const buttonTexts = {
        completed: {
            easy: ["네, 다음엔 더 도전할게요!", "알겠어요!"],
            perfect: ["정말요? 좋네요!", "계속 이렇게 할게요!"],
            hard: ["네, 천천히 할게요!", "조심할게요!"]
        },
        aborted: {
            easy: ["네, 다음엔 더 도전할게요!", "알겠어요!"],
            perfect: ["네, 알겠어요!", "고마워요!"],
            hard: ["네, 무리하지 않을게요!", "고마워요!"]
        }
    };
    
    return buttonTexts[situation][feedback];
}

// 다음 단계 진행 함수 (기존 로직 유지)
function proceedToNextStep() {
    gtag('event', 'feedback_selected', {
        feedback_type: userFeedback,
        completed_sets: window.exerciseData ? window.exerciseData.completedSets : 0,
        is_aborted: isAborted
    });
    
    showResultScreen();
}

// 🔥 정리된 showResultScreen 함수 - 사용자 요청 방식
async function showResultScreen() {
    console.log('🎯 결과 화면 표시 시작');
    
    try {
        // 1. 화면 전환
        showScreen('resultScreen');
        
        // 2. 통계 데이터 업데이트 (UI)
        updateResultStats();
        
        // 3. userFeedback을 exerciseData에 포함 (디버깅용)
        if (window.exerciseData) {
            console.log('💾 [디버그] 저장 전 userFeedback:', userFeedback);
            console.log('💾 [디버그] 저장 전 window.exerciseData.userFeedback:', window.exerciseData.userFeedback);
            
            window.exerciseData.userFeedback = userFeedback;
            
            console.log('💾 [디버그] 설정 후 window.exerciseData.userFeedback:', window.exerciseData.userFeedback);
            console.log('💾 [디버그] 전체 exerciseData:', window.exerciseData);
            
            // 🚨 운동 데이터 즉시 Supabase 저장 (새로 추가)
            const savedData = await saveExerciseToSupabase(window.exerciseData);
            
            if (savedData) {
                console.log('✅ 운동 데이터 백엔드 저장 완료');
                window.exerciseData.sessionId = savedData.id; // ✅ 이미 있음
                
                // 새로 추가: 전역 변수에도 저장
                window.currentSessionId = savedData.id;
                console.log('💾 [디버그] 저장된 sessionId:', window.currentSessionId);
            } else {
                console.warn('⚠️ 백엔드 저장 실패, 로컬 저장으로 백업');
            }
        }
        
        // 🏆 운동 완료 배지 처리 (퀴즈와 동일한 방식)
        try {
            // 통계 데이터 업데이트
            const updatedStats = updateLocalStats(window.exerciseData);
            addExerciseHistory(window.exerciseData);
            
            // 새로운 배지 체크
            const newBadges = checkNewBadges(updatedStats);
            updateBadgesDisplay();
            
            // 새로운 배지가 있으면 즉시 팝업 표시
            if (newBadges && newBadges.length > 0) {
                setTimeout(() => {
                    showBadgePopup(newBadges[0]);
                }, 1000);
            }
            
            console.log('🏆 운동 완료 배지 체크 완료, 새 배지:', newBadges?.length || 0);
        } catch (error) {
            console.error('❌ 운동 배지 체크 중 오류:', error);
        }
        
        // 🎯 주간활동 그래프 실시간 업데이트
        try {
            if (typeof updateChart === 'function') {
                await updateChart(); // async 호출
                console.log('✅ 주간활동 그래프 실시간 업데이트 완료');
            } else {
                console.log('⚠️ updateChart 함수를 찾을 수 없음');
            }
        } catch (error) {
            console.error('❌ 주간활동 그래프 업데이트 중 오류:', error);
        }
        
        // 4. AI 분석 섹션 초기화
        resetAIAnalysisSection();
        
        console.log('✅ 결과 화면 로드 완료');
        
    } catch (error) {
        console.error('❌ 결과 화면 로드 중 오류:', error);
    }
}

// 통계 데이터 업데이트 함수
function updateResultStats() {
    try {
        const timeData = window.exerciseData.exerciseTime.split(':');
        const minutes = parseInt(timeData[0]);
        const seconds = parseInt(timeData[1]);
        
        // 결과 통계 업데이트
        document.getElementById('resistanceInfo').textContent = `${window.exerciseData.resistanceSettings.inhale}/${window.exerciseData.resistanceSettings.exhale}`;
        document.getElementById('totalTime').textContent = `${minutes}분 ${seconds}초`;
        document.getElementById('resultCompletedSets').textContent = `${window.exerciseData.completedSets}/2`;
        document.getElementById('totalBreathsResult').textContent = `${window.exerciseData.completedBreaths}회`;
        
    } catch (error) {
        console.error('❌ 통계 데이터 업데이트 중 오류 발생:', error);
    }
}

// AI 평가 요청 함수
async function requestAIAdvice() {
    try {
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
        
        // 🔥 백엔드에서 AI 조언 요청 (데이터는 이미 showResultScreen()에서 저장됨)
        console.log('🤖 백엔드 AI 조언 요청 시작');
        
        const aiAdvice = await getTrainerAdvice(exerciseDataWithFeedback);
        
        console.log('🤖 AI 조언 응답:', aiAdvice);
        
        if (typeof aiAdvice === 'object' && aiAdvice.comprehensiveAdvice) {
            handleExerciseResult({
                success: true,
                comprehensiveAdvice: aiAdvice.comprehensiveAdvice,
                stats: null // 이미 저장된 통계 사용
            });
        } else if (typeof aiAdvice === 'string') {
            handleExerciseResult({
                success: true,
                comprehensiveAdvice: aiAdvice,
                stats: null // 이미 저장된 통계 사용
            });
        } else {
            throw new Error('AI 조언 형식 오류');
        }
        
    } catch (aiError) {
        console.error('❌ AI 조언 요청 실패:', aiError);
        
        // AI 조언 실패 시 기본 메시지 표시
        document.getElementById('intensityAdvice').textContent = '분석을 불러오는 중 문제가 발생했습니다.';
        document.getElementById('comprehensiveAdvice').textContent = '네트워크 연결을 확인하고 다시 시도해주세요.';
        
        console.log('⚠️ AI 조언 실패로 기본 메시지 표시');
    }
}

// 💾 운동 데이터를 Supabase에 저장하는 함수 (실제 테이블 구조 반영)
async function saveExerciseToSupabase(exerciseData) {
    try {
        console.log('💾 Supabase에 운동 데이터 저장 시작:', exerciseData);
        
        // Supabase 클라이언트 및 사용자 ID 확인
        if (!window.supabaseClient || !window.currentUserId) {
            throw new Error('Supabase 클라이언트 또는 사용자 ID가 없습니다.');
        }
        
        // ✅ 실제 테이블 컬럼명에 맞춘 데이터 구성
        const exerciseRecord = {
            user_id: window.currentUserId,
            exercise_date: new Date().toISOString().split('T')[0],  // YYYY-MM-DD 형식
            exercise_time: exerciseData.exerciseTime || '0:00',     // MM:SS 형식 그대로
            completed_sets: exerciseData.completedSets || 0,
            completed_breaths: exerciseData.completedBreaths || 0,
            total_target_breaths: 20,  // 기본값 (2세트 × 10호흡)
            is_aborted: exerciseData.isAborted || false,
            user_feedback: exerciseData.userFeedback || null,
            inhale_resistance: exerciseData.resistanceSettings?.inhale || 1,
            exhale_resistance: exerciseData.resistanceSettings?.exhale || 1,
            created_at: new Date().toISOString()
        };
        
        console.log('📝 저장할 데이터:', exerciseRecord);
        
        // Supabase에 INSERT
        const { data, error } = await window.supabaseClient
            .from('exercise_sessions')
            .insert([exerciseRecord])
            .select();
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Supabase 저장 성공:', data[0]);
        return data[0];
        
    } catch (error) {
        console.error('❌ Supabase 저장 실패:', error);
        
        // 에러가 발생해도 로컬 저장은 시도
        console.log('🔄 로컬 저장으로 백업 시도');
        return null;
    }
}



// 🎯 결과 화면 AI 분석 요청 함수
function requestResultAIAnalysis() {
    console.log('🤖 결과 화면에서 AI 분석 요청');
    
    const contentEl = document.getElementById('aiAnalysisContent');
    const badgeEl = document.getElementById('aiAnalysisBadge');
    
    if (contentEl) {
        contentEl.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; color: #6B7280; padding: 32px 0;">
                <div style="width: 24px; height: 24px; border: 3px solid #667eea; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <span>AI가 방금 운동을 분석하고 있습니다...</span>
            </div>
        `;
    }
    
    if (badgeEl) {
        badgeEl.textContent = '분석 중...';
    }
    
    // 기존 AI 요청 로직 실행
    requestAIAdvice();
}

// 🎯 AI 분석 섹션 초기화 함수
function resetAIAnalysisSection() {
    console.log('🔄 AI 분석 섹션 초기화');
    
    const contentEl = document.getElementById('aiAnalysisContent');
    const badgeEl = document.getElementById('aiAnalysisBadge');
    
    // 배지 초기화
    if (badgeEl) {
        badgeEl.textContent = '분석 대기';
    }
    
    // 콘텐츠를 초기 버튼 상태로 리셋
    if (contentEl) {
        contentEl.innerHTML = `
            <div style="text-align: center; padding: 32px 0;">
                <img src="icons/coach-avatar.png" style="width: 32px; height: 32px; border-radius: 50%; margin-bottom: 16px;" alt="AI">
                <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                    방금 완료한 운동을 AI가 분석해서<br>
                    개인화된 조언을 받아보세요
                </p>
                <button onclick="requestResultAIAnalysis()" style="background: rgba(102, 126, 234, 0.1); border: 1px solid #667eea; border-radius: 12px; padding: 12px 24px; color: #667eea; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                    AI 운동 분석 받기
                </button>
            </div>
        `;
    }
    
    console.log('✅ AI 분석 섹션 초기화 완료');
}

// 🎯 AI 분석 결과 표시 함수
function showAIAnalysisResult(analysisData) {
    const contentEl = document.getElementById('aiAnalysisContent');
    const badgeEl = document.getElementById('aiAnalysisBadge');
    
    if (contentEl) {
        contentEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <img src="icons/coach-avatar.png" style="width: 32px; height: 32px; border-radius: 50%;" alt="AI">
                <div style="font-size: 14px; font-weight: 600; color: #374151;">AI 숨트레이너</div>
            </div>
            <div style="color: #374151; line-height: 1.6; font-size: 15px;">
                ${analysisData.advice || '훌륭한 운동이었어요! 계속 이런 식으로 꾸준히 해보세요.'}
            </div>
        `;
    }
    
    if (badgeEl) {
        badgeEl.textContent = '분석 완료';
    }
}





// 🎯 개선된 결과 처리 함수 (데이터베이스 저장 로직 제거)
function handleExerciseResult(result) {
    addFeedbackHistory(userFeedback, resistanceSettings);
    const analysis = analyzeFeedbackPattern(userFeedback, resistanceSettings);
    
    console.log('🧠 스마트 분석 결과:', analysis);
    
    let finalComprehensiveAdvice = result.comprehensiveAdvice;
    
    const additionalAdvice = generateLocalAdviceAddition(analysis, userFeedback, window.exerciseData.isAborted);
    if (additionalAdvice) {
        finalComprehensiveAdvice += additionalAdvice;
    }
    
    // 🎯 결과 화면 AI 분석 결과 표시
    showAIAnalysisResult({
        advice: finalComprehensiveAdvice
    });
    
    // 🎯 운동 완료 후 인사말 업데이트
    setTimeout(() => {
        clearGreetingCache(); // 운동 데이터 변경으로 캐시 무효화
        updateGreetingCard();
    }, 1000);
}



// 🔥 새로운 기능: 사회적 증명 UI 업데이트
function updateSocialProofData() {
    // profile.js 의존성 체크
    if (typeof window.getCommunityStats !== 'function') {
        console.warn('profile.js가 로드되지 않음');
        return;
    }
    
    const stats = window.getCommunityStats();
    const element = document.getElementById('mainLiveUsersText');
    if (element) {
        element.textContent = `오늘 ${stats.todayActive.toLocaleString()}명 트레이닝 중`;
    }
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

// 🔧 AI 조언 요청 함수 (유지 - 백엔드 호출만)
async function getTrainerAdvice(exerciseData) {
    try {
        if (!exerciseData) {
            throw new Error('운동 데이터가 필요합니다');
        }
        
        console.log('🤖 Supabase AI 조언 요청 시작');
        console.log('📊 전달할 운동 데이터:', exerciseData);
        
        const requestData = {
            exerciseData: {
                resistanceSettings: {
                    inhale: exerciseData.resistanceSettings ? exerciseData.resistanceSettings.inhale : 1,
                    exhale: exerciseData.resistanceSettings ? exerciseData.resistanceSettings.exhale : 1
                },
                userFeedback: exerciseData.userFeedback || null,
                completedSets: exerciseData.completedSets || 0,
                completedBreaths: exerciseData.completedBreaths || 0,
                exerciseTime: exerciseData.exerciseTime || '0:00',
                isAborted: exerciseData.isAborted || false,
                userId: window.currentUserId || null
            },
            sessionId: window.currentSessionId || null
        };
        
        console.log('🤖 [디버그] Edge Function에 전달할 데이터:', requestData);
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-advice`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`Supabase 연결 오류: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 Supabase 응답:', result);
        
        if (result.success && result.advice) {
            return {
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
            comprehensiveAdvice: defaultAdvices[randomIndex] + " 꾸준히 도전하는 의지가 정말 대단해요!"
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
window.onload = async function() {
    await loadUserData(); // async 호출
    loadResistanceSettings();
    updateBadgesDisplay();
    
    // ✅ 로그인 상태 확인 후 목표 카드 업데이트 추가
    if (window.currentUserId) {
        updateGoalCard();
        updateChart(); // ✅ 이 줄 추가
    }
    
    // 🔥 새로운 기능: 온보딩 스와이프 초기화
    initializeOnboardingSwipe();
    
    // 🔄 profile.js 로드 후 주기적 업데이트 시스템 초기화
    setTimeout(() => {
        if (typeof window.getCommunityStats === 'function') {
            console.log('✅ profile.js 로드 완료, 주기적 업데이트 시스템 시작');
            // 메인화면 실시간 현황 주기적 업데이트 (2분마다)
            setInterval(() => {
                updateSocialProofData();
            }, 120000);
        } else {
            console.warn('⚠️ profile.js 로드 실패, 주기적 업데이트 시스템 비활성화');
        }
    }, 2000); // 2초 후 체크
};

// 간단한 업데이트 체크 시스템
async function initSimpleUpdateSystem() {
    if (!('serviceWorker' in navigator)) return;
    
    try {
        console.log('업데이트 시스템 초기화...');
        
        // Service Worker 등록
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker 등록 완료');
        
        // 앱 시작 시 한 번만 업데이트 체크
        await registration.update();
        
        // 업데이트 메시지 리스너
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data.type === 'CACHE_UPDATED') {
                const newVersion = event.data.version;
                const currentVersion = window.versionManager?.currentVersion || '3.0.0';
                
                if (newVersion !== currentVersion && window.updateManager) {
                    window.updateManager.performUpdate(newVersion, currentVersion);
                }
            }
        });
        
    } catch (error) {
        console.error('Service Worker 등록 실패:', error);
    }
}

// 🚀 DOM 로드 시 간단한 업데이트 시스템 시작
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSimpleUpdateSystem);
} else {
  initSimpleUpdateSystem();
}

// 🚀 인삿말 캐싱 시스템
let greetingCache = {
    lastUpdate: null,
    data: null,
    validFor: 10 * 60 * 1000, // 10분
    userInfo: null,
    motivationData: null
};

// 🎯 단순화된 인삿말 시스템: 메시지 객체
const SIMPLE_GREETINGS = {
    first_time: "처음 오셨네요! 반가워요 😊",
    
    comeback: [
        "며칠 쉬었어도 괜찮아요. 오늘부터 다시 시작!",
        "쉬는 것도 필요해요. 이제 천천히 해봐요",
        "오랜만이네요! 가볍게 시작하면 돼요",
        "잠깐 쉬었다가 돌아왔네요. 반가워요",
        "며칠 쉬었지만 몸이 기억하고 있을 거예요",
        "휴식도 운동의 일부예요. 오늘은 가볍게!",
        "쉬고 나면 더 좋아져요. 다시 시작해봐요",
        "몇 일 쉬었어도 금방 돌아올 거예요",
        "오랜만의 운동이네요. 무리하지 마세요",
        "쉬었던 만큼 더 건강해질 거예요"
    ],
    
    streak_1: [
        "어제에 이어 오늘도! 좋은 시작이에요",
        "이틀째네요. 벌써 습관이 되어가요",
        "연속 이틀! 몸이 좋아할 거예요",
        "어제 했으니 오늘도 해봐요",
        "두 번째 운동이에요. 멋져요",
        "이틀 연속! 꾸준함이 보여요",
        "어제보다 오늘이 더 쉬울 거예요",
        "연속으로 하니까 기분 좋죠?",
        "이틀째 만나네요. 반가워요",
        "습관의 씨앗이 싹트고 있어요"
    ],
    
    streak_2_3: [
        "벌써 며칠째! 정말 꾸준하시네요 😊",
        "몸이 기억하고 있을 거예요. 좋아요",
        "이제 진짜 습관이 되어가네요",
        "꾸준함이 최고예요. 멋져요",
        "며칠째 하시는 모습이 보기 좋아요",
        "이렇게 꾸준히 하면 확실히 달라져요",
        "규칙적인 운동이 몸에 베어가네요",
        "매일 만나서 반가워요",
        "꾸준한 분은 다르네요",
        "이런 리듬이 딱 좋아요"
    ],
    
    streak_4_6: [
        "정말 꾸준하시네요! 대단해요 👏",
        "이제 완전히 습관이 됐네요",
        "며칠째 하시는 모습이 정말 멋져요",
        "꾸준함의 힘이 보여요",
        "매일 하시는 게 쉽지 않은데 대단해요",
        "이런 꾸준함이 건강을 만들어요",
        "확실히 달라지고 있어요",
        "규칙적인 운동의 힘이에요",
        "정말 성실하시네요",
        "이제 진짜 운동하는 사람이에요"
    ],
    
    streak_7_plus: [
        "정말 대단해요! 꾸준함의 힘이네요 🌟",
        "벌써 일주일 넘게! 놀라워요",
        "이제 마스터 수준이에요",
        "꾸준히 하시는 모습이 정말 멋져요",
        "이런 분은 정말 드물어요",
        "완전히 습관이 됐네요. 최고예요",
        "정말 성실한 분이시네요",
        "이 정도면 운동 고수예요",
        "꾸준함이 이런 거구나 싶어요",
        "정말 존경스러워요"
    ],
    
    default_morning: [
        "좋은 아침이에요 ☀️",
        "상쾌한 아침 운동 시작!",
        "아침 호흡으로 하루를 여세요",
        "새로운 하루가 시작됐어요",
        "아침 운동으로 활기 충전!",
        "상쾌한 아침이네요",
        "좋은 하루의 시작이에요",
        "아침 공기가 맑아요",
        "건강한 하루 시작해봐요",
        "오늘도 좋은 하루 되세요"
    ],
    
    default_afternoon: [
        "오늘도 건강하게 💪", 
        "오후 운동으로 활력 충전!",
        "바쁜 하루 중 잠깐 쉬어가요",
        "몸과 마음을 정리하는 시간이에요",
        "오후에도 건강 챙기세요",
        "잠깐 호흡 운동 어때요?",
        "하루 중 가장 좋은 시간이에요",
        "몸이 좀 피곤하죠? 잠깐 쉬어가요",
        "오후 운동으로 기분 전환!",
        "건강한 오후 보내세요"
    ],
    
    default_evening: [
        "편안한 호흡으로 마무리해봐요 🌙",
        "하루 수고했어요. 이제 쉬어가요",
        "저녁 운동으로 하루를 정리해봐요",
        "편안한 저녁 시간이네요",
        "오늘 하루도 고생했어요",
        "저녁 호흡으로 마음을 정리해봐요",
        "하루 마무리 운동 시간이에요",
        "편안한 밤 되세요",
        "오늘도 수고 많았어요",
        "좋은 밤 되시길 바라요"
    ]
};

function shouldUpdateGreeting() {
    // 캐시가 없으면 업데이트 필요
    if (!greetingCache.lastUpdate || !greetingCache.data) {
        console.log('🔄 캐시 없음 - 업데이트 필요');
        return true;
    }
    
    // 10분 경과시 업데이트 필요
    const elapsed = Date.now() - greetingCache.lastUpdate;
    if (elapsed > greetingCache.validFor) {
        console.log('⏰ 캐시 만료 - 업데이트 필요');
        return true;
    }
    
    // 날짜가 바뀌었으면 업데이트 필요 (연속일 계산 변경)
    const today = getCurrentUserTime().toDateString();
    const cacheDate = greetingCache.lastUpdate ? new Date(greetingCache.lastUpdate).toDateString() : null;
    if (today !== cacheDate) {
        console.log('📅 날짜 변경 - 업데이트 필요');
        return true;
    }
    
    console.log('✅ 캐시 유효 - 업데이트 불필요');
    return false;
}

function clearGreetingCache() {
    console.log('🗑️ 인삿말 캐시 클리어');
    greetingCache.lastUpdate = null;
    greetingCache.data = null;
    greetingCache.userInfo = null;
    greetingCache.motivationData = null;
}

function updateGreetingCardSmart() {
    console.log('🧠 스마트 인삿말 업데이트 호출');
    
    // 캐시가 유효하면 기존 데이터 사용
    if (!shouldUpdateGreeting() && greetingCache.data) {
        console.log('📋 캐시 데이터 사용');
        
        // UI 업데이트만 수행
        const greeting = greetingCache.data;
        const prefixEl = document.getElementById('greetingPrefix');
        const userNameEl = document.getElementById('userName');
        const messageEl = document.getElementById('greetingMessage');
        
        if (prefixEl) prefixEl.textContent = greeting.prefix;
        if (userNameEl) userNameEl.textContent = greeting.userName;
        if (messageEl) {
            messageEl.textContent = greeting.message;
            messageEl.className = `greeting-message ${greeting.messageType || ''}`;
        }
        
        return;
    }
    
    // 캐시가 무효하면 새로 계산
    updateGreetingCard();
}

// 🎯 단순화된 인삿말 카드 업데이트 함수
async function updateGreetingCard() {
    try {
        console.log('🎯 단순화된 인삿말 시스템 시작');
        
        const userInfo = await getUserInfo();
        console.log('👤 사용자 정보:', userInfo);
        
        const motivationData = getSimpleLocalData();
        console.log('📊 로컬 데이터:', motivationData);
        
        const greeting = generateSimpleGreeting(userInfo, motivationData);
        console.log('💬 생성된 인삿말:', greeting);
        
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
        
        // 🚀 캐시에 결과 저장
        greetingCache.lastUpdate = Date.now();
        greetingCache.data = greeting;
        greetingCache.userInfo = userInfo;
        greetingCache.motivationData = motivationData;
        
        console.log('✅ 인삿말 카드 업데이트 완료 (캐시 저장됨)');
        
    } catch (error) {
        console.error('⚠️ 인삿말 업데이트 실패:', error);
        setDefaultGreeting();
    }
}

// 🎯 단순화된 로컬 데이터 조회 함수
function getSimpleLocalData() {
    const history = getExerciseHistory();
    const today = getCurrentUserTime();
    
    const totalSessions = history.length;
    
    // 연속 운동일 계산
    let consecutiveDays = 0;
    for (let i = 0; i < history.length; i++) {
        const recordDate = new Date(history[i].date);
        const daysDiff = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
            consecutiveDays++;
        } else {
            break;
        }
    }
    
    // 마지막 운동일로부터 며칠 지났는지
    const daysSinceLastExercise = history.length > 0 ? 
        Math.floor((today - new Date(history[0].date)) / (1000 * 60 * 60 * 24)) : 999;
    
    return {
        totalSessions,
        consecutiveDays,
        daysSinceLastExercise,
        source: 'local_simple'
    };
}

// 🎯 단순화된 인삿말 생성 함수
function generateSimpleGreeting(userInfo, motivationData) {
    const { nickname, isLoggedIn } = userInfo;
    const { totalSessions, consecutiveDays, daysSinceLastExercise } = motivationData;
    const currentHour = getCurrentUserTime().getHours();
    
    // 시간대별 인삿말 prefix
    let timeBasedPrefix = '안녕하세요,';
    if (currentHour >= 5 && currentHour < 12) {
        timeBasedPrefix = '좋은 아침이에요,';
    } else if (currentHour >= 18 && currentHour < 22) {
        timeBasedPrefix = '수고하셨어요,';
    }
    
    // 사용자명 설정
    let displayName;
    if (isLoggedIn && nickname && nickname !== '트레이너') {
        displayName = `${nickname}님`;
    } else {
        displayName = 'AI 숨트레이너';
    }
    
    // 메시지 선택 (4단계 로직)
    let message;
    
    if (totalSessions === 0) {
        message = SIMPLE_GREETINGS.first_time;
    }
    else if (daysSinceLastExercise >= 4) {
        const comebackMessages = SIMPLE_GREETINGS.comeback;
        message = comebackMessages[Math.floor(Math.random() * comebackMessages.length)];
    }
    else if (consecutiveDays >= 7) {
        const streakMessages = SIMPLE_GREETINGS.streak_7_plus;
        message = streakMessages[Math.floor(Math.random() * streakMessages.length)];
    }
    else if (consecutiveDays >= 4) {
        const streakMessages = SIMPLE_GREETINGS.streak_4_6;
        message = streakMessages[Math.floor(Math.random() * streakMessages.length)];
    }
    else if (consecutiveDays === 1) {
        const streakMessages = SIMPLE_GREETINGS.streak_1;
        message = streakMessages[Math.floor(Math.random() * streakMessages.length)];
    }
    else if (consecutiveDays >= 2 && consecutiveDays <= 3) {
        const streakMessages = SIMPLE_GREETINGS.streak_2_3;
        message = streakMessages[Math.floor(Math.random() * streakMessages.length)];
    }
    else {
        if (currentHour >= 5 && currentHour < 12) {
            const morningMessages = SIMPLE_GREETINGS.default_morning;
            message = morningMessages[Math.floor(Math.random() * morningMessages.length)];
        } else if (currentHour >= 18 && currentHour < 22) {
            const eveningMessages = SIMPLE_GREETINGS.default_evening;
            message = eveningMessages[Math.floor(Math.random() * eveningMessages.length)];
        } else {
            const afternoonMessages = SIMPLE_GREETINGS.default_afternoon;
            message = afternoonMessages[Math.floor(Math.random() * afternoonMessages.length)];
        }
    }
    
    return {
        prefix: '',
        userName: `${timeBasedPrefix} ${displayName}`,
        message: message,
        messageType: ''
    };
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



// 🎯 기본 인삿말 설정 (폴백용)
function setDefaultGreeting() {
    document.getElementById('userName').textContent = '안녕하세요, AI 숨트레이너';
    document.getElementById('greetingMessage').textContent = '오늘도 깊은 호흡으로 하루를 시작해보세요.';
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

// 🎯 원형 프로그레스 업데이트 (강화된 버전)
function updateGoalProgress(data) {
    const { percentage, isCompleted } = data;
    
    // 프로그레스 서클 요소
    const progressCircle = document.getElementById('progressCircle');
    const celebrationCircle = document.getElementById('celebrationCircle');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressLabel = document.getElementById('progressLabel');
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
        // 일일미션 40회 달성 시 경험치 지급
        if (typeof window.awardDailyExp === 'function') {
            console.log('🎯 일일미션 40회 달성! 경험치 지급 시작...');
            window.awardDailyExp().then(success => {
                if (success) {
                    console.log('✅ 일일미션 경험치 50 EXP 지급 성공!');
                } else {
                    console.log('ℹ️ 일일미션 경험치 지급 완료 (이미 오늘 받음)');
                }
            }).catch(error => {
                console.error('❌ 일일미션 경험치 지급 실패:', error);
            });
        } else {
            console.warn('⚠️ 일일미션 경험치 지급 함수를 찾을 수 없습니다.');
        }

        setTimeout(() => {
            // 1. 진행률 색상 변경 (파란색 → 초록색)
            progressCircle.style.stroke = '#22c55e';
            
            // 2. 텍스트 스타일 변경
            progressPercentage.classList.add('completed');
            progressLabel.classList.add('completed');
            progressLabel.textContent = '완료!';
            
            // 3. 축하 원 표시
            if (celebrationCircle) {
                celebrationCircle.style.display = 'block';
                celebrationCircle.style.strokeDashoffset = '0';
            }
            
            // 4. 카드 전체 축하 이펙트
            goalCard.classList.add('achievement');
            
            // 5. 프로그레스 원 살짝 커지는 효과
            progressCircle.style.transform = 'scale(1.05)';
            setTimeout(() => {
                progressCircle.style.transform = 'scale(1)';
            }, 400);
            
            console.log('🎉 목표 달성 축하 이펙트 실행');
            
        }, 800);
        
        // 6. 3초 후 이펙트 제거
        setTimeout(() => {
            goalCard.classList.remove('achievement');
        }, 3500);
        
    } else {
        // 미달성 시 기본 색상
        progressCircle.style.stroke = '#667eea';
        progressCircle.style.transform = 'scale(1)';
        progressPercentage.classList.remove('completed');
        progressLabel.classList.remove('completed');
        progressLabel.textContent = '달성률';
        
        if (celebrationCircle) {
            celebrationCircle.style.display = 'none';
        }
    }
}

// 🎯 목표 통계 카드 업데이트 (기존 함수명 유지)
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

// 🎯 기본 목표 카드 설정 (기존 함수명 유지)
function setDefaultGoalCard() {
    // ✅ 결과 화면에서는 completedSets를 0으로 설정하지 않음
    if (document.getElementById('resultScreen').classList.contains('active')) {
        console.log('🔒 결과 화면에서는 기본값 설정 건너뜀');
        return;
    }
    
    const progressPercentage = document.getElementById('progressPercentage');
    const progressLabel = document.getElementById('progressLabel');
    const targetEl = document.getElementById('targetBreaths');
    const completedEl = document.getElementById('completedBreaths');
    const setsEl = document.getElementById('completedSets');
    
    if (progressPercentage) progressPercentage.textContent = '0%';
    if (progressLabel) {
        progressLabel.textContent = '달성률';
        progressLabel.classList.remove('completed');
    }
    if (targetEl) targetEl.textContent = '40';
    if (completedEl) completedEl.textContent = '0';
    if (setsEl) setsEl.textContent = '0';
}

// 🚨 전역 에러 핸들러 추가
window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 처리되지 않은 Promise 에러:', event.reason);
    
    // 운동 데이터가 있다면 로컬에라도 저장
    if (window.exerciseData && !window.exerciseDataSaved) {
        console.log('🔄 긴급 로컬 저장 실행');
        addExerciseHistory(window.exerciseData);
        window.exerciseDataSaved = true;
    }
});

// 🔄 기록탭에서 Supabase 데이터 다시 불러오기
async function refreshExerciseRecords() {
    console.log('🔄 운동 기록 새로고침');
    
    try {
        await fetchExerciseSessions();
        renderCalendar();
        console.log('✅ 기록 새로고침 완료');
    } catch (error) {
        console.error('❌ 기록 새로고침 실패:', error);
    }
}
