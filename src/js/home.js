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
        
        // 4. GoalProgressCard UI 업데이트
        updateGoalProgressCard(todayCount);
        
        // 5. TodaySummaryCard 로드
        await loadTodaySummaryCard();
        
    } catch (error) {
        console.error('❌ GreetingCard 로드 실패:', error);
        // 기본값으로 설정
        updateGreetingCard('사용자', 0, 0);
        updateGoalProgressCard(0);
        updateTodaySummaryCard(null);
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

// GoalProgressCard 컴포넌트 관리
function updateGoalProgressCard(todayCount) {
    const targetSessions = 2; // 목표 세션 수
    const totalBlocks = 10; // 총 블록 수
    const blocksPerSession = totalBlocks / targetSessions; // 세션당 블록 수
    
    // 진행 바 블록 생성
    renderProgressBlocks(todayCount, totalBlocks, blocksPerSession);
    
    // 진행률 텍스트 업데이트
    updateProgressText(todayCount, targetSessions);
    
    // 감성 피드백 업데이트
    updateProgressFeedback(todayCount, targetSessions);
}

// 진행 바 블록 렌더링
function renderProgressBlocks(todayCount, totalBlocks, blocksPerSession) {
    const progressBlocksContainer = document.querySelector('.progress-blocks');
    if (!progressBlocksContainer) return;
    
    let html = '';
    const filledBlocks = Math.floor(todayCount * blocksPerSession);
    
    for (let i = 0; i < totalBlocks; i++) {
        const isFilled = i < filledBlocks;
        html += `<div class="progress-block ${isFilled ? 'filled' : 'empty'}"></div>`;
    }
    
    progressBlocksContainer.innerHTML = html;
}

// 진행률 텍스트 업데이트
function updateProgressText(todayCount, targetSessions) {
    const progressText = document.getElementById('goalProgressText');
    if (!progressText) return;
    
    progressText.textContent = `${targetSessions}회 중 ${todayCount}회 완료했어요`;
}

// 감성 피드백 업데이트
function updateProgressFeedback(todayCount, targetSessions) {
    const progressFeedback = document.getElementById('goalProgressFeedback');
    if (!progressFeedback) return;
    
    let feedbackMessage = '';
    
    if (todayCount === 0) {
        feedbackMessage = '첫 번째 운동을 시작해보세요! 🚀';
    } else if (todayCount === 1) {
        feedbackMessage = '한 번 더 하면 목표 달성이에요! 💪';
    } else if (todayCount >= targetSessions) {
        feedbackMessage = '오늘 목표를 완벽하게 달성했어요! 🎉';
    } else {
        feedbackMessage = '꾸준히 잘 하고 있어요! 🌟';
    }
    
    progressFeedback.textContent = feedbackMessage;
}

// TodaySummaryCard 컴포넌트 관리
async function loadTodaySummaryCard() {
    if (!window.currentUserId) return;
    
    try {
        // 오늘 날짜 기준으로 가장 최근 세션 조회
        const todayStr = toKSTDateString(new Date().toISOString());
        
        // KST 기준 날짜를 UTC 기준으로 변환
        const todayStart = new Date(`${todayStr}T00:00:00+09:00`);
        const todayEnd = new Date(`${todayStr}T23:59:59+09:00`);
        
        const utcTodayStart = new Date(todayStart.getTime() - 9 * 60 * 60 * 1000);
        const utcTodayEnd = new Date(todayEnd.getTime() - 9 * 60 * 60 * 1000);
        
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select(`
                exercise_time,
                completed_sets,
                completed_breaths,
                inhale_resistance,
                exhale_resistance,
                user_feedback,
                created_at
            `)
            .eq('user_id', window.currentUserId)
            .gte('created_at', utcTodayStart.toISOString())
            .lt('created_at', utcTodayEnd.toISOString())
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (error) throw error;
        
        if (sessions && sessions.length > 0) {
            updateTodaySummaryCard(sessions[0]);
        } else {
            // 오늘 운동 기록이 없는 경우
            updateTodaySummaryCard(null);
        }
        
    } catch (error) {
        console.error('❌ TodaySummaryCard 로드 실패:', error);
        updateTodaySummaryCard(null);
    }
}

// TodaySummaryCard UI 업데이트
function updateTodaySummaryCard(session) {
    const todaySummaryCard = document.getElementById('todaySummaryCard');
    const noSessionCard = document.getElementById('noSessionCard');
    const dailySessionSlider = document.getElementById('dailySessionSlider');
    
    if (!session) {
        // 운동 기록이 없는 경우 - NoSessionCard 표시
        if (todaySummaryCard) todaySummaryCard.style.display = 'none';
        if (dailySessionSlider) dailySessionSlider.style.display = 'none';
        if (noSessionCard) noSessionCard.style.display = 'block';
        return;
    }
    
    // 운동 기록이 있는 경우 - TodaySummaryCard 표시
    if (todaySummaryCard) todaySummaryCard.style.display = 'block';
    if (dailySessionSlider) dailySessionSlider.style.display = 'none';
    if (noSessionCard) noSessionCard.style.display = 'none';
    
    const exerciseTimeEl = document.getElementById('todayExerciseTime');
    const setsEl = document.getElementById('todaySets');
    const breathsEl = document.getElementById('todayBreaths');
    const resistanceEl = document.getElementById('todayResistance');
    const feedbackEl = document.getElementById('todayFeedback');
    
    // 운동 시간 포맷팅
    const exerciseTime = session.exercise_time ? formatTime(parseInt(session.exercise_time)) : '기록 없음';
    exerciseTimeEl.textContent = exerciseTime;
    
    // 세트 수
    const sets = session.completed_sets || 0;
    setsEl.textContent = `${sets}세트`;
    
    // 호흡 수
    const breaths = session.completed_breaths || 0;
    breathsEl.textContent = `${breaths}회`;
    
    // 평균 저항 강도
    const avgResistance = calculateAverageResistance(session.inhale_resistance, session.exhale_resistance);
    resistanceEl.textContent = avgResistance;
    
    // 내 느낌
    const feedback = session.user_feedback || '기록 없음';
    feedbackEl.textContent = feedback;
}

// DailySessionSlider 컴포넌트 관리
async function loadDailySessionSlider() {
    if (!window.currentUserId) return;
    
    try {
        // 오늘 날짜 기준으로 모든 세션 조회
        const todayStr = toKSTDateString(new Date().toISOString());
        
        // KST 기준 날짜를 UTC 기준으로 변환
        const todayStart = new Date(`${todayStr}T00:00:00+09:00`);
        const todayEnd = new Date(`${todayStr}T23:59:59+09:00`);
        
        const utcTodayStart = new Date(todayStart.getTime() - 9 * 60 * 60 * 1000);
        const utcTodayEnd = new Date(todayEnd.getTime() - 9 * 60 * 60 * 1000);
        
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select(`
                id,
                exercise_time,
                completed_sets,
                completed_breaths,
                inhale_resistance,
                exhale_resistance,
                effort_level,
                user_feedback,
                created_at
            `)
            .eq('user_id', window.currentUserId)
            .gte('created_at', utcTodayStart.toISOString())
            .lt('created_at', utcTodayEnd.toISOString())
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (sessions && sessions.length > 0) {
            updateDailySessionSlider(sessions);
        } else {
            // 오늘 운동 기록이 없는 경우
            updateDailySessionSlider(null);
        }
        
    } catch (error) {
        console.error('❌ DailySessionSlider 로드 실패:', error);
        updateDailySessionSlider(null);
    }
}

// DailySessionSlider UI 업데이트
function updateDailySessionSlider(sessions) {
    const todaySummaryCard = document.getElementById('todaySummaryCard');
    const noSessionCard = document.getElementById('noSessionCard');
    const dailySessionSlider = document.getElementById('dailySessionSlider');
    
    if (!sessions || sessions.length === 0) {
        // 운동 기록이 없는 경우 - NoSessionCard 표시
        if (todaySummaryCard) todaySummaryCard.style.display = 'none';
        if (dailySessionSlider) dailySessionSlider.style.display = 'none';
        if (noSessionCard) noSessionCard.style.display = 'block';
        return;
    }
    
    if (sessions.length === 1) {
        // 세션이 1개인 경우 - TodaySummaryCard 표시
        if (todaySummaryCard) todaySummaryCard.style.display = 'block';
        if (dailySessionSlider) dailySessionSlider.style.display = 'none';
        if (noSessionCard) noSessionCard.style.display = 'none';
        
        // TodaySummaryCard 업데이트
        updateTodaySummaryCard(sessions[0]);
        return;
    }
    
    // 세션이 2개 이상인 경우 - DailySessionSlider 표시
    if (todaySummaryCard) todaySummaryCard.style.display = 'none';
    if (dailySessionSlider) dailySessionSlider.style.display = 'block';
    if (noSessionCard) noSessionCard.style.display = 'none';
    
    // 슬라이더 렌더링
    renderSessionSlider(sessions);
}

// 세션 슬라이더 렌더링
function renderSessionSlider(sessions) {
    const sessionSlider = document.getElementById('sessionSlider');
    const sliderIndicators = document.querySelector('.slider-indicators');
    
    if (!sessionSlider || !sliderIndicators) return;
    
    // 세션 카드 HTML 생성
    let sessionCardsHTML = '';
    let indicatorsHTML = '';
    
    sessions.forEach((session, index) => {
        sessionCardsHTML += generateSessionCardHTML(session, index);
        indicatorsHTML += `<div class="slider-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`;
    });
    
    sessionSlider.innerHTML = sessionCardsHTML;
    sliderIndicators.innerHTML = indicatorsHTML;
    
    // 인디케이터 이벤트 리스너 추가
    initSliderIndicators();
}

// 세션 카드 HTML 생성
function generateSessionCardHTML(session, index) {
    // 세션 시작 시간 (KST 변환)
    const sessionTime = formatSessionTime(session.created_at);
    
    // 운동 시간 포맷팅
    const exerciseTime = session.exercise_time ? formatExerciseTime(session.exercise_time) : '기록 없음';
    
    // 세트 수
    const sets = session.completed_sets || 0;
    
    // 호흡 수
    const breaths = session.completed_breaths || 0;
    
    // 평균 저항 강도
    const avgResistance = calculateAverageResistance(session.inhale_resistance, session.exhale_resistance);
    
    // effort_level UX 문장 변환
    const effortText = convertEffortLevelToUX(session.effort_level);
    
    // 사용자 피드백
    const feedback = session.user_feedback || '기록 없음';
    
    return `
        <div class="session-card" data-index="${index}">
            <div class="session-time">
                <span class="session-time-icon">🕒</span>
                <span>${sessionTime}</span>
            </div>
            <div class="session-details">
                <div class="session-detail-item">
                    <div class="session-detail-label">
                        <span class="session-detail-icon">⏱️</span>
                        <span>운동 시간</span>
                    </div>
                    <div class="session-detail-value">${exerciseTime}</div>
                </div>
                <div class="session-detail-item">
                    <div class="session-detail-label">
                        <span class="session-detail-icon">🔄</span>
                        <span>세트 수</span>
                    </div>
                    <div class="session-detail-value">${sets}세트</div>
                </div>
                <div class="session-detail-item">
                    <div class="session-detail-label">
                        <span class="session-detail-icon">🫁</span>
                        <span>호흡 수</span>
                    </div>
                    <div class="session-detail-value">${breaths}회</div>
                </div>
                <div class="session-detail-item">
                    <div class="session-detail-label">
                        <span class="session-detail-icon">💪</span>
                        <span>저항 강도</span>
                    </div>
                    <div class="session-detail-value">${avgResistance}</div>
                </div>
            </div>
            <div class="session-effort">
                <div class="session-effort-label">운동 강도</div>
                <div class="session-effort-text">${effortText}</div>
            </div>
            <div class="session-feedback">
                <div class="session-feedback-label">내 느낌</div>
                <div class="session-feedback-text">${feedback}</div>
            </div>
        </div>
    `;
}

// 세션 시간 포맷팅 (UTC → KST)
function formatSessionTime(utcTimeString) {
    try {
        const utcDate = new Date(utcTimeString);
        const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
        
        const hours = kstDate.getHours();
        const minutes = kstDate.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        
        return `${ampm} ${displayHours}:${displayMinutes}`;
    } catch (error) {
        console.error('시간 포맷팅 오류:', error);
        return '시간 정보 없음';
    }
}

// 운동 시간 포맷팅
function formatExerciseTime(timeString) {
    try {
        const totalSeconds = parseInt(timeString);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        if (minutes === 0) {
            return `${seconds}초`;
        } else if (seconds === 0) {
            return `${minutes}분`;
        } else {
            return `${minutes}분 ${seconds}초`;
        }
    } catch (error) {
        console.error('운동 시간 포맷팅 오류:', error);
        return '기록 없음';
    }
}

// effort_level을 UX 문장으로 변환
function convertEffortLevelToUX(effortLevel) {
    switch (effortLevel) {
        case 'easy':
            return '너무 쉬웠어요';
        case 'medium':
            return '적당히 힘들고 딱 좋아요';
        case 'hard':
            return '오늘은 꽤 힘들었어요';
        default:
            return '적당한 강도였어요';
    }
}

// 슬라이더 인디케이터 초기화
function initSliderIndicators() {
    const indicators = document.querySelectorAll('.slider-indicator');
    const sliderWrapper = document.querySelector('.session-slider-wrapper');
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            // 모든 인디케이터 비활성화
            indicators.forEach(ind => ind.classList.remove('active'));
            
            // 클릭된 인디케이터 활성화
            indicator.classList.add('active');
            
            // 해당 카드로 스크롤
            const targetCard = document.querySelector(`.session-card[data-index="${index}"]`);
            if (targetCard && sliderWrapper) {
                targetCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
            }
        });
    });
}

// 평균 저항 강도 계산 및 텍스트 변환
function calculateAverageResistance(inhaleResistance, exhaleResistance) {
    if (!inhaleResistance || !exhaleResistance) {
        return '기록 없음';
    }
    
    const avg = (inhaleResistance + exhaleResistance) / 2;
    
    // 저항 강도별 텍스트 변환 (토스 라이팅 원칙)
    if (avg <= 2) {
        return '쉬움';
    } else if (avg <= 4) {
        return '적정';
    } else {
        return '힘듦';
    }
}

// NoSessionCard 관련 함수
function initNoSessionCard() {
    const startTrainingBtn = document.getElementById('startTrainingBtn');
    if (startTrainingBtn) {
        startTrainingBtn.addEventListener('click', () => {
            console.log('🏃‍♂️ 훈련 화면으로 이동');
            navigateTo('training');
        });
    }
}

// 화면 이동 함수
function navigateTo(screen) {
    console.log(`🔄 화면 이동: ${screen}`);
    // TODO: 실제 화면 이동 로직 구현
    alert('훈련 화면이 준비 중입니다...');
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
    
    // 5. DailySessionSlider 로드 (TodaySummaryCard 대신)
    await loadDailySessionSlider();
    
    // 6. NoSessionCard 초기화
    initNoSessionCard();
    
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
