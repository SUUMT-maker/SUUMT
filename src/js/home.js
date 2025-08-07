// 홈 탭 관련 기능

// 홈 탭 초기화 (HomeTab 컴포넌트 사용)
async function initHomeTab() {
    console.log('🏠 홈 탭 초기화 시작...');
    
    try {
        // HomeTab 컴포넌트 초기화
        await window.homeTab.init(window.currentUserId, window.supabaseClient);
        
        console.log('✅ 홈 탭 초기화 완료');
        
    } catch (error) {
        console.error('❌ 홈 탭 초기화 실패:', error);
    }
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
