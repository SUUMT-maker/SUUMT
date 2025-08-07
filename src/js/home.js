// 홈 탭 관련 기능

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
