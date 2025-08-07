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

// AISummaryCard 컴포넌트 관리
async function loadAISummaryCard() {
    if (!window.currentUserId) return;
    
    try {
        // 가장 최근 AI 조언 조회
        const { data: aiAdvice, error } = await window.supabaseClient
            .from('ai_advice')
            .select(`
                summary,
                advice_type,
                created_at
            `)
            .eq('user_id', window.currentUserId)
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (error) throw error;
        
        if (aiAdvice && aiAdvice.length > 0) {
            updateAISummaryCard(aiAdvice[0]);
        } else {
            // AI 조언이 없는 경우
            updateAISummaryCard(null);
        }
        
    } catch (error) {
        console.error('❌ AISummaryCard 로드 실패:', error);
        updateAISummaryCard(null);
    }
}

// AISummaryCard UI 업데이트
function updateAISummaryCard(aiAdvice) {
    const aiSummaryCard = document.getElementById('aiSummaryCard');
    const aiSummaryIcon = document.getElementById('aiSummaryIcon');
    const aiSummaryMessage = document.getElementById('aiSummaryMessage');
    const aiSummaryDate = document.getElementById('aiSummaryDate');
    
    if (!aiSummaryCard || !aiSummaryIcon || !aiSummaryMessage || !aiSummaryDate) return;
    
    if (!aiAdvice) {
        // AI 조언이 없는 경우 - 기본 상태
        aiSummaryCard.className = 'ai-summary-card card';
        aiSummaryIcon.textContent = '🤖';
        aiSummaryMessage.textContent = '아직 AI 숨트레이너의 조언이 없어요. 오늘도 숨을 쉬며 시작해볼까요?';
        aiSummaryDate.textContent = '분석 날짜: -';
        return;
    }
    
    // AI 조언이 있는 경우 - 데이터 업데이트
    const adviceType = aiAdvice.advice_type || 'encourage';
    const summary = aiAdvice.summary || 'AI 숨트레이너의 조언을 확인해보세요.';
    const createdAt = aiAdvice.created_at;
    
    // 카드 스타일 업데이트
    aiSummaryCard.className = `ai-summary-card card ${adviceType}`;
    
    // 아이콘 업데이트
    const iconMap = {
        'encourage': '👍',
        'caution': '⚠️',
        'motivate': '🔥'
    };
    aiSummaryIcon.textContent = iconMap[adviceType] || '🤖';
    
    // 메시지 업데이트
    aiSummaryMessage.textContent = summary;
    
    // 날짜 업데이트 (UTC → KST)
    const analysisDate = formatAnalysisDate(createdAt);
    aiSummaryDate.textContent = `분석 날짜: ${analysisDate}`;
}

// 분석 날짜 포맷팅 (UTC → KST)
function formatAnalysisDate(utcTimeString) {
    try {
        const utcDate = new Date(utcTimeString);
        const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
        
        const year = kstDate.getFullYear();
        const month = kstDate.getMonth() + 1;
        const day = kstDate.getDate();
        
        return `${year}년 ${month}월 ${day}일`;
    } catch (error) {
        console.error('날짜 포맷팅 오류:', error);
        return '날짜 정보 없음';
    }
}

// WeeklyTrendCard 컴포넌트 관리
async function loadWeeklyTrendCard() {
    if (!window.currentUserId) return;
    
    try {
        // 최근 7일 데이터 조회
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6); // 7일 전부터
        
        // KST 기준 날짜를 UTC 기준으로 변환
        const kstEndDate = toKSTDateString(endDate.toISOString());
        const kstStartDate = toKSTDateString(startDate.toISOString());
        
        const utcStartDate = new Date(`${kstStartDate}T00:00:00+09:00`);
        const utcEndDate = new Date(`${kstEndDate}T23:59:59+09:00`);
        
        const utcStart = new Date(utcStartDate.getTime() - 9 * 60 * 60 * 1000);
        const utcEnd = new Date(utcEndDate.getTime() - 9 * 60 * 60 * 1000);
        
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select(`
                completed_breaths,
                completed_sets,
                inhale_resistance,
                exhale_resistance,
                created_at
            `)
            .eq('user_id', window.currentUserId)
            .gte('created_at', utcStart.toISOString())
            .lt('created_at', utcEnd.toISOString());
        
        if (error) throw error;
        
        updateWeeklyTrendCard(sessions, kstStartDate, kstEndDate);
        
    } catch (error) {
        console.error('❌ WeeklyTrendCard 로드 실패:', error);
        updateWeeklyTrendCard([], '', '');
    }
}

// WeeklyTrendCard UI 업데이트
function updateWeeklyTrendCard(sessions, startDate, endDate) {
    const weeklyTrendCard = document.getElementById('weeklyTrendCard');
    const weeklyDateRange = document.getElementById('weeklyDateRange');
    const weeklyInsufficientData = document.getElementById('weeklyInsufficientData');
    const weeklyTrendData = document.getElementById('weeklyTrendData');
    
    if (!weeklyTrendCard || !weeklyDateRange || !weeklyInsufficientData || !weeklyTrendData) return;
    
    // 날짜 범위 업데이트
    const dateRangeText = formatWeeklyDateRange(startDate, endDate);
    weeklyDateRange.textContent = dateRangeText;
    
    // 세션이 1개 이하인 경우
    if (!sessions || sessions.length <= 1) {
        weeklyInsufficientData.style.display = 'block';
        weeklyTrendData.style.display = 'none';
        return;
    }
    
    // 충분한 데이터가 있는 경우
    weeklyInsufficientData.style.display = 'none';
    weeklyTrendData.style.display = 'block';
    
    // 주간 데이터 처리
    const weeklyData = processWeeklyData(sessions, startDate);
    
    // 차트 생성
    createWeeklyChart(weeklyData);
    
    // 통계 업데이트
    updateWeeklyStats(sessions);
    
    // AI 코멘트 업데이트
    updateWeeklyAIComment(sessions.length);
}

// 주간 날짜 범위 포맷팅
function formatWeeklyDateRange(startDate, endDate) {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const startMonth = start.getMonth() + 1;
        const startDay = start.getDate();
        const endMonth = end.getMonth() + 1;
        const endDay = end.getDate();
        
        return `${startMonth}월 ${startDay}일 ~ ${endMonth}월 ${endDay}일 기준`;
    } catch (error) {
        console.error('날짜 범위 포맷팅 오류:', error);
        return '최근 7일 기준';
    }
}

// 주간 데이터 처리
function processWeeklyData(sessions, startDate) {
    const weeklyData = [];
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 7일간 데이터 초기화
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        weeklyData.push({
            date: toKSTDateString(date.toISOString()),
            weekday: weekdays[date.getDay()],
            breaths: 0,
            sessions: 0
        });
    }
    
    // 세션 데이터 매핑
    sessions.forEach(session => {
        const sessionDate = toKSTDateString(session.created_at);
        const dayIndex = weeklyData.findIndex(day => day.date === sessionDate);
        
        if (dayIndex !== -1) {
            weeklyData[dayIndex].breaths += session.completed_breaths || 0;
            weeklyData[dayIndex].sessions += 1;
        }
    });
    
    return weeklyData;
}

// 주간 차트 생성
function createWeeklyChart(weeklyData) {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    
    // 기존 차트 제거
    if (window.weeklyChart) {
        window.weeklyChart.destroy();
    }
    
    const labels = weeklyData.map(day => day.weekday);
    const data = weeklyData.map(day => day.breaths);
    
    window.weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '호흡 수',
                data: data,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `호흡 수: ${context.parsed.y}회`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 10
                        },
                        callback: function(value) {
                            return value + '회';
                        }
                    }
                }
            }
        }
    });
}

// 주간 통계 업데이트
function updateWeeklyStats(sessions) {
    const totalSessions = sessions.length;
    const totalBreaths = sessions.reduce((sum, session) => sum + (session.completed_breaths || 0), 0);
    
    // 평균 저항 강도 계산
    const validResistanceSessions = sessions.filter(session => 
        session.inhale_resistance && session.exhale_resistance
    );
    
    let avgResistance = '기록 없음';
    if (validResistanceSessions.length > 0) {
        const totalResistance = validResistanceSessions.reduce((sum, session) => {
            return sum + ((session.inhale_resistance + session.exhale_resistance) / 2);
        }, 0);
        const avg = totalResistance / validResistanceSessions.length;
        
        if (avg <= 2) {
            avgResistance = '쉬움';
        } else if (avg <= 4) {
            avgResistance = '적정';
        } else {
            avgResistance = '힘듦';
        }
    }
    
    // UI 업데이트
    const totalSessionsEl = document.getElementById('weeklyTotalSessions');
    const totalBreathsEl = document.getElementById('weeklyTotalBreaths');
    const avgResistanceEl = document.getElementById('weeklyAvgResistance');
    
    if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
    if (totalBreathsEl) totalBreathsEl.textContent = totalBreaths;
    if (avgResistanceEl) avgResistanceEl.textContent = avgResistance;
}

// 주간 AI 코멘트 업데이트
function updateWeeklyAIComment(sessionCount) {
    const aiCommentEl = document.getElementById('weeklyAIComment');
    if (!aiCommentEl) return;
    
    let comment = '';
    
    if (sessionCount >= 5) {
        comment = '이번 주 정말 열심히 하셨어요!';
    } else if (sessionCount <= 2) {
        comment = '이번 주는 몸을 쉬었군요. 다시 시작해봐요!';
    } else {
        comment = '꾸준히 잘하고 있어요. 다음 주도 기대돼요!';
    }
    
    aiCommentEl.textContent = comment;
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
    
    // 로딩 상태 표시
    showHomeLoading();
    
    try {
        // 사용자 데이터 확인
        if (!window.currentUserId) {
            console.warn('⚠️ 로그인된 사용자가 없습니다.');
            hideHomeLoading();
            return;
        }
        
        // 모든 컴포넌트 데이터 로드
        await Promise.all([
            loadGreetingCard(),
            loadAISummaryCard(),
            loadWeeklyTrendCard()
        ]);
        
        // AI 메시지 업데이트
        updateAiMessage();
        
        // NoSessionCard 초기화
        initNoSessionCard();
        
        // 로딩 상태 숨김
        hideHomeLoading();
        
        console.log('✅ 홈 탭 초기화 완료');
        
    } catch (error) {
        console.error('❌ 홈 탭 초기화 실패:', error);
        hideHomeLoading();
        showHomeError();
    }
}

// HomeTab 로딩 상태 표시
function showHomeLoading() {
    const homeTabContent = document.getElementById('homeTabContent');
    if (!homeTabContent) return;
    
    homeTabContent.innerHTML = `
        <div class="home-loading">
            <span>Loading...</span>
        </div>
    `;
}

// HomeTab 로딩 상태 숨김
function hideHomeLoading() {
    const homeTabContent = document.getElementById('homeTabContent');
    if (!homeTabContent) return;
    
    // 원래 컨텐츠 복원
    restoreHomeTabContent();
}

// HomeTab 에러 상태 표시
function showHomeError() {
    const homeTabContent = document.getElementById('homeTabContent');
    if (!homeTabContent) return;
    
    homeTabContent.innerHTML = `
        <div class="home-error">
            <div class="error-icon">⚠️</div>
            <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
            <button onclick="initHomeTab()" class="retry-btn">다시 시도</button>
        </div>
    `;
}

// HomeTab 컨텐츠 복원
function restoreHomeTabContent() {
    const homeTabContent = document.getElementById('homeTabContent');
    if (!homeTabContent) return;
    
    // 원래 HTML 구조로 복원
    homeTabContent.innerHTML = `
        <!-- GreetingCard 컴포넌트 -->
        <div class="greeting-card card mb-4">
            <div class="greeting-content">
                <div class="greeting-header">
                    <h2 id="greetingTitle">안녕하세요! 👋</h2>
                </div>
                <div class="greeting-message">
                    <p id="greetingMessage">오늘도 건강한 호흡을 만들어보세요</p>
                </div>
                <div class="greeting-goal">
                    <p id="greetingGoal">목표: 2회 중 0회 완료</p>
                </div>
            </div>
        </div>

        <!-- GoalProgressCard 컴포넌트 -->
        <div class="goal-progress-card card mb-4">
            <div class="goal-progress-content">
                <div class="goal-progress-header">
                    <h3>오늘의 목표</h3>
                </div>
                <div class="goal-progress-bar">
                    <div class="progress-blocks">
                        <!-- JS로 동적 생성 -->
                    </div>
                </div>
                <div class="goal-progress-text">
                    <p id="goalProgressText">2회 중 0회 완료했어요</p>
                </div>
                <div class="goal-progress-feedback">
                    <p id="goalProgressFeedback">첫 번째 운동을 시작해보세요! 🚀</p>
                </div>
            </div>
        </div>

        <!-- TodaySummaryCard 컴포넌트 (조건부 렌더링) -->
        <div id="todaySummaryCard" class="today-summary-card card mb-4" style="display: none;">
            <div class="today-summary-content">
                <div class="today-summary-header">
                    <h3>오늘의 운동 요약</h3>
                </div>
                <div class="today-summary-body">
                    <div class="summary-item">
                        <span class="summary-icon">⏱️</span>
                        <span class="summary-label">운동 시간</span>
                        <span class="summary-value" id="todayExerciseTime">-</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-icon">🔄</span>
                        <span class="summary-label">세트 수</span>
                        <span class="summary-value" id="todaySets">-</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-icon">🫁</span>
                        <span class="summary-label">호흡 수</span>
                        <span class="summary-value" id="todayBreaths">-</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-icon">💪</span>
                        <span class="summary-label">평균 저항</span>
                        <span class="summary-value" id="todayResistance">-</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-icon">😊</span>
                        <span class="summary-label">내 느낌</span>
                        <span class="summary-value" id="todayFeedback">-</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- DailySessionSlider 컴포넌트 (조건부 렌더링) -->
        <div id="dailySessionSlider" class="daily-session-slider card mb-4" style="display: none;">
            <div class="daily-session-header">
                <h3>오늘의 운동 세션</h3>
            </div>
            <div class="session-slider-container">
                <div class="session-slider-wrapper">
                    <div id="sessionSlider" class="session-slider">
                        <!-- JS로 동적 생성 -->
                    </div>
                </div>
                <div class="slider-indicators">
                    <!-- JS로 동적 생성 -->
                </div>
            </div>
        </div>

        <!-- NoSessionCard 컴포넌트 (조건부 렌더링) -->
        <div id="noSessionCard" class="no-session-card card mb-4" style="display: none;">
            <div class="no-session-content">
                <div class="no-session-icon">🫁</div>
                <div class="no-session-header">
                    <h3>오늘은 아직 호흡 운동을 안 하셨어요</h3>
                </div>
                <div class="no-session-message">
                    <p>📈 꾸준함이 건강한 폐를 만듭니다!</p>
                </div>
                <div class="no-session-action">
                    <button id="startTrainingBtn" class="primary-btn">
                        지금 바로 시작하기
                    </button>
                </div>
            </div>
        </div>

        <!-- AISummaryCard 컴포넌트 -->
        <div id="aiSummaryCard" class="ai-summary-card card mb-4">
            <div class="ai-summary-content">
                <div class="ai-summary-header">
                    <div class="ai-summary-icon" id="aiSummaryIcon">🤖</div>
                    <h3>AI 숨트레이너의 한마디</h3>
                </div>
                <div class="ai-summary-message">
                    <p id="aiSummaryMessage">아직 AI 숨트레이너의 조언이 없어요. 오늘도 숨을 쉬며 시작해볼까요?</p>
                </div>
                <div class="ai-summary-date">
                    <p id="aiSummaryDate">분석 날짜: -</p>
                </div>
            </div>
        </div>

        <!-- WeeklyTrendCard 컴포넌트 -->
        <div id="weeklyTrendCard" class="weekly-trend-card card mb-4">
            <div class="weekly-trend-content">
                <div class="weekly-trend-header">
                    <h3>이번 주 숨트 레포트</h3>
                    <p id="weeklyDateRange" class="weekly-date-range">날짜 범위 로딩 중...</p>
                </div>
                
                <!-- 세션이 1개 이하일 경우 표시할 메시지 -->
                <div id="weeklyInsufficientData" class="weekly-insufficient-data" style="display: none;">
                    <div class="insufficient-icon">📊</div>
                    <p>이번 주 기록이 아직 부족해요. 매일 꾸준히 한 번씩 도전해보세요!</p>
                </div>
                
                <!-- 충분한 데이터가 있을 경우 표시할 내용 -->
                <div id="weeklyTrendData" class="weekly-trend-data" style="display: none;">
                    <!-- 미니 막대 그래프 -->
                    <div class="weekly-chart-container">
                        <canvas id="weeklyChart" class="weekly-chart"></canvas>
                    </div>
                    
                    <!-- 요약 통계 -->
                    <div class="weekly-stats">
                        <div class="weekly-stat-item">
                            <span class="weekly-stat-label">총 세션 수</span>
                            <span class="weekly-stat-value" id="weeklyTotalSessions">-</span>
                        </div>
                        <div class="weekly-stat-item">
                            <span class="weekly-stat-label">총 호흡 수</span>
                            <span class="weekly-stat-value" id="weeklyTotalBreaths">-</span>
                        </div>
                        <div class="weekly-stat-item">
                            <span class="weekly-stat-label">평균 저항 강도</span>
                            <span class="weekly-stat-value" id="weeklyAvgResistance">-</span>
                        </div>
                    </div>
                    
                    <!-- AI 코멘트 -->
                    <div class="weekly-ai-comment">
                        <p id="weeklyAIComment">AI 코멘트 로딩 중...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
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
