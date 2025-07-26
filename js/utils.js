// 숨트레이너 - 유틸리티 함수들

// 🕐 사용자 위치 기반 시간대 자동 설정
function getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function getCurrentUserTime() {
    return new Date();
}

function formatDateForUser(date) {
    return date.toLocaleDateString('ko-KR', {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
        timeZone: getUserTimezone()
    });
}

function getWeekStartDate() {
    const now = getCurrentUserTime();
    const dayOfWeek = now.getDay(); // 0 = 일요일
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
}

function getWeekEndDate() {
    const startDate = getWeekStartDate();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
}

function isDateInCurrentWeek(date) {
    const checkDate = new Date(date);
    const weekStart = getWeekStartDate();
    const weekEnd = getWeekEndDate();
    return checkDate >= weekStart && checkDate <= weekEnd;
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

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 온보딩 관련 함수들
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

function hideIntro() {
    const introScreen = document.getElementById('introScreen');
    introScreen.classList.add('hidden');
    setTimeout(() => {
        introScreen.style.display = 'none';
    }, 800);
}

// 모달 관련 함수들
function showStopModal() {
    document.getElementById('confirmModal').classList.add('show');
}

function hideModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

// 🔧 AI 조언 요청
async function getTrainerAdvice(exerciseData) {
    try {
        console.log('🤖 AI 조언 요청 시작');
        console.log('📊 전달할 운동 데이터:', exerciseData);
        
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8iRnFGheIKcPUBkmSqOUAJ4_jPhSFRR593Ukfk1j6Da1oIPOkUlAboDdqr-CA2u29rw/exec';
        
        const params = new URLSearchParams({
            function: 'getAIAdvice',
            exerciseTime: exerciseData.exerciseTime,
            completedSets: exerciseData.completedSets.toString(),
            completedBreaths: exerciseData.completedBreaths.toString(),
            isAborted: exerciseData.isAborted.toString(),
            userFeedback: exerciseData.userFeedback || '',
            inhaleResistance: exerciseData.resistanceSettings ? exerciseData.resistanceSettings.inhale.toString() : '1',
            exhaleResistance: exerciseData.resistanceSettings ? exerciseData.resistanceSettings.exhale.toString() : '1'
        });
        
        console.log('🌐 요청 파라미터:', params.toString());
        
        const response = await fetch(`${SCRIPT_URL}?${params}`);
        
        if (!response.ok) {
            throw new Error(`연결 오류: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📦 Apps Script 응답:', result);
        
        if (result.success) {
            if (result.advice && typeof result.advice === 'object') {
                return {
                    intensityAdvice: result.advice.intensityAdvice || result.advice,
                    comprehensiveAdvice: result.advice.comprehensiveAdvice || "AI 트레이너가 당신의 꾸준한 노력을 응원합니다!"
                };
            } else if (typeof result.advice === 'string') {
                return {
                    intensityAdvice: result.advice,
                    comprehensiveAdvice: "AI 트레이너가 당신의 꾸준한 노력을 응원합니다!"
                };
            }
        } 
        
        throw new Error(result.message || 'AI 조언 생성 실패');
        
    } catch (error) {
        console.error('🚨 AI 조언 요청 오류:', error);
        
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
