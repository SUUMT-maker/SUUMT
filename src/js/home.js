// 홈 탭 관련 기능

// GreetingCard 컴포넌트 관리
async function loadGreetingCard() {
    if (!window.currentUserId) return;
    
    try {
        // 1. 사용자 닉네임 가져오기
        const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
        if (userError) throw userError;
        
        const nickname = user?.user_metadata?.nickname || '사용자';
        
        // 2. 어제와 오늘 세션 수 조회
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = toKSTDateString(yesterday.toISOString());
        
        const todayStr = toKSTDateString(new Date().toISOString());
        
        // KST 기준 날짜를 UTC 기준으로 변환
        const yesterdayStart = new Date(`${yesterdayStr}T00:00:00+09:00`);
        const yesterdayEnd = new Date(`${yesterdayStr}T23:59:59+09:00`);
        const todayStart = new Date(`${todayStr}T00:00:00+09:00`);
        const todayEnd = new Date(`${todayStr}T23:59:59+09:00`);
        
        const utcYesterdayStart = new Date(yesterdayStart.getTime() - 9 * 60 * 60 * 1000);
        const utcYesterdayEnd = new Date(yesterdayEnd.getTime() - 9 * 60 * 60 * 1000);
        const utcTodayStart = new Date(todayStart.getTime() - 9 * 60 * 60 * 1000);
        const utcTodayEnd = new Date(todayEnd.getTime() - 9 * 60 * 60 * 1000);
        
        // 어제 세션 수 조회
        const { data: yesterdaySessions, error: yesterdayError } = await window.supabaseClient
            .from('exercise_sessions')
            .select('id')
            .eq('user_id', window.currentUserId)
            .gte('created_at', utcYesterdayStart.toISOString())
            .lt('created_at', utcYesterdayEnd.toISOString());
        
        if (yesterdayError) throw yesterdayError;
        
        // 오늘 세션 수 조회
        const { data: todaySessions, error: todayError } = await window.supabaseClient
            .from('exercise_sessions')
            .select('id')
            .eq('user_id', window.currentUserId)
            .gte('created_at', utcTodayStart.toISOString())
            .lt('created_at', utcTodayEnd.toISOString());
        
        if (todayError) throw todayError;
        
        const yesterdayCount = yesterdaySessions?.length || 0;
        const todayCount = todaySessions?.length || 0;
        
        // 3. GreetingCard UI 업데이트
        updateGreetingCard(nickname, yesterdayCount, todayCount);
        
    } catch (error) {
        console.error('❌ GreetingCard 로드 실패:', error);
        // 기본값으로 설정
        updateGreetingCard('사용자', 0, 0);
    }
}

// GreetingCard UI 업데이트
function updateGreetingCard(nickname, yesterdayCount, todayCount) {
    const greetingTitle = document.getElementById('greetingTitle');
    const greetingMessage = document.getElementById('greetingMessage');
    const greetingGoal = document.getElementById('greetingGoal');
    
    if (!greetingTitle || !greetingMessage || !greetingGoal) return;
    
    // 인삿말 설정
    greetingTitle.textContent = `안녕하세요, ${nickname}님! 👋`;
    
    // 메시지 설정 (어제 운동 여부에 따라)
    if (yesterdayCount >= 1) {
        greetingMessage.textContent = '어제도 운동을 이어갔어요. 오늘도 파이팅! 💪';
    } else {
        greetingMessage.textContent = '다시 시작해볼까요? 오늘은 특별히 좋은 하루가 될 거예요! 🌟';
    }
    
    // 목표 설정 (오늘 세션 수 기반)
    const targetSessions = 2; // 목표 세션 수
    greetingGoal.textContent = `목표: ${targetSessions}회 중 ${todayCount}회 완료`;
}

// AI 메시지 관리
const aiMessages = {
    // 기본 메시지들
    default: [
        "오늘의 호흡 운동을 시작해보세요! 🫁",
        "건강한 호흡이 건강한 몸을 만듭니다 💪",
        "차근차근 호흡법을 연습해보세요 😌",
        "호흡 운동으로 스트레스를 날려보세요 🌬️"
    ],
    
    // 시간대별 메시지
    morning: [
        "상쾌한 아침, 호흡 운동으로 하루를 시작해보세요! 🌅",
        "아침 호흡 운동으로 활력 넘치는 하루를 만들어보세요 ☀️",
        "새로운 하루, 건강한 호흡으로 시작해보세요 🌟"
    ],
    
    afternoon: [
        "점심 시간, 잠깐의 호흡 운동으로 에너지를 충전해보세요 🍃",
        "오후의 피로를 호흡 운동으로 날려보세요 💨",
        "차분한 호흡으로 오후를 보내보세요 😊"
    ],
    
    evening: [
        "하루의 마무리, 편안한 호흡 운동으로 마음을 정리해보세요 🌙",
        "저녁 호흡 운동으로 하루의 스트레스를 풀어보세요 🌿",
        "차분한 호흡으로 하루를 마무리해보세요 ✨"
    ]
};

// AI 메시지 업데이트
function updateAiMessage() {
    const aiMessageEl = document.getElementById('aiMessage');
    if (!aiMessageEl) return;
    
    const now = new Date();
    const hour = now.getHours();
    
    let messageArray;
    
    if (hour >= 5 && hour < 12) {
        messageArray = aiMessages.morning;
    } else if (hour >= 12 && hour < 18) {
        messageArray = aiMessages.afternoon;
    } else {
        messageArray = aiMessages.evening;
    }
    
    // 랜덤 메시지 선택
    const randomMessage = messageArray[Math.floor(Math.random() * messageArray.length)];
    aiMessageEl.textContent = randomMessage;
}

// 오늘의 운동 요약 데이터 가져오기
async function fetchTodaySummary() {
    if (!window.currentUserId) {
        console.warn('⚠️ 로그인된 사용자가 없습니다.');
        return null;
    }
    
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // KST 기준으로 오늘 날짜 계산
        const kstToday = toKSTDateString(new Date().toISOString());
        
        console.log('📊 오늘 운동 요약 조회:', kstToday);
        
        // KST 기준 날짜를 UTC 기준으로 변환하여 조회
        const kstStartOfDay = new Date(`${kstToday}T00:00:00+09:00`);
        const kstEndOfDay = new Date(`${kstToday}T23:59:59+09:00`);
        
        // UTC로 변환
        const utcStartOfDay = new Date(kstStartOfDay.getTime() - 9 * 60 * 60 * 1000);
        const utcEndOfDay = new Date(kstEndOfDay.getTime() - 9 * 60 * 60 * 1000);
        
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select(`
                completed_sets,
                completed_breaths,
                exercise_time,
                created_at
            `)
            .eq('user_id', window.currentUserId)
            .gte('created_at', utcStartOfDay.toISOString())
            .lt('created_at', utcEndOfDay.toISOString());
        
        if (error) {
            console.error('❌ 오늘 운동 요약 조회 실패:', error);
            return null;
        }
        
        if (!sessions?.length) {
            console.log('ℹ️ 오늘 운동 기록이 없습니다.');
            return {
                totalSets: 0,
                totalBreaths: 0,
                totalTime: 0,
                sessionCount: 0
            };
        }
        
        // 요약 데이터 계산
        const summary = sessions.reduce((acc, session) => {
            acc.totalSets += session.completed_sets || 0;
            acc.totalBreaths += session.completed_breaths || 0;
            acc.totalTime += parseInt(session.exercise_time) || 0;
            acc.sessionCount += 1;
            return acc;
        }, {
            totalSets: 0,
            totalBreaths: 0,
            totalTime: 0,
            sessionCount: 0
        });
        
        console.log('✅ 오늘 운동 요약:', summary);
        return summary;
        
    } catch (error) {
        console.error('❌ 오늘 운동 요약 조회 중 오류:', error);
        return null;
    }
}

// 목표 달성률 계산
function calculateGoalProgress(summary) {
    if (!summary) return 0;
    
    // 목표: 하루 3세트, 60회 호흡
    const targetSets = 3;
    const targetBreaths = 60;
    
    const setProgress = Math.min((summary.totalSets / targetSets) * 100, 100);
    const breathProgress = Math.min((summary.totalBreaths / targetBreaths) * 100, 100);
    
    // 평균 달성률
    return Math.round((setProgress + breathProgress) / 2);
}

// UI 업데이트
function updateHomeUI(summary) {
    // 목표 달성률 업데이트
    const goalProgressEl = document.getElementById('goalProgress');
    if (goalProgressEl) {
        const progress = calculateGoalProgress(summary);
        goalProgressEl.textContent = `${progress}%`;
        
        // 색상 변경 (달성률에 따라)
        if (progress >= 80) {
            goalProgressEl.style.color = '#28a745'; // 녹색
        } else if (progress >= 50) {
            goalProgressEl.style.color = '#ffc107'; // 노란색
        } else {
            goalProgressEl.style.color = '#dc3545'; // 빨간색
        }
    }
    
    // 운동 시간 업데이트
    const exerciseTimeEl = document.getElementById('exerciseTime');
    if (exerciseTimeEl && summary) {
        const minutes = Math.floor(summary.totalTime / 60);
        exerciseTimeEl.textContent = `${minutes}분`;
    }
}

// 홈 탭 초기화
async function initHomeTab() {
    console.log('🏠 홈 탭 초기화 시작...');
    
    // GreetingCard 로드
    await loadGreetingCard();
    
    // AI 메시지 업데이트
    updateAiMessage();
    
    // 오늘의 운동 요약 가져오기
    const summary = await fetchTodaySummary();
    
    // UI 업데이트
    updateHomeUI(summary);
    
    console.log('✅ 홈 탭 초기화 완료');
}

// 운동 시작 버튼 이벤트
function initStartExerciseButton() {
    const startBtn = document.getElementById('startExerciseBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            console.log('🏃‍♂️ 운동 시작 버튼 클릭');
            alert('운동 기능이 준비 중입니다...');
            // TODO: 운동 화면으로 이동
        });
    }
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    initStartExerciseButton();
    console.log('✅ 홈 탭 이벤트 리스너 등록 완료');
});
