/**
 * HomeTab 컴포넌트
 * 사용자의 호흡 운동 습관을 강화하고 동기부여를 제공하는 메인 홈 탭
 */

class HomeTab {
    constructor() {
        this.currentUserId = null;
        this.supabaseClient = null;
        this.isInitialized = false;
        this.components = {};
    }

    /**
     * HomeTab 초기화
     * @param {string} userId - 현재 로그인된 사용자 ID
     * @param {object} supabaseClient - Supabase 클라이언트 인스턴스
     */
    async init(userId, supabaseClient) {
        try {
            console.log('🏠 HomeTab 초기화 시작...');
            
            this.currentUserId = userId;
            this.supabaseClient = supabaseClient;
            
            // 로딩 상태 표시
            this.showLoading();
            
            // 모든 컴포넌트 데이터 로드
            await Promise.all([
                this.loadGreetingCard(),
                this.loadGoalProgressCard(),
                this.loadTodaySummaryCard(),
                this.loadAISummaryCard(),
                this.loadWeeklyTrendCard()
            ]);
            
            // 이벤트 리스너 등록
            this.initEventListeners();
            
            // 로딩 상태 숨김
            this.hideLoading();
            
            this.isInitialized = true;
            console.log('✅ HomeTab 초기화 완료');
            
        } catch (error) {
            console.error('❌ HomeTab 초기화 실패:', error);
            this.showError();
        }
    }

    /**
     * 로딩 상태 표시
     */
    showLoading() {
        const homeTabContent = document.getElementById('homeTabContent');
        if (!homeTabContent) return;
        
        homeTabContent.innerHTML = `
            <div class="home-loading">
                <span>Loading...</span>
            </div>
        `;
    }

    /**
     * 로딩 상태 숨김
     */
    hideLoading() {
        const homeTabContent = document.getElementById('homeTabContent');
        if (!homeTabContent) return;
        
        // 원래 컨텐츠 복원
        this.restoreContent();
    }

    /**
     * 에러 상태 표시
     */
    showError() {
        const homeTabContent = document.getElementById('homeTabContent');
        if (!homeTabContent) return;
        
        homeTabContent.innerHTML = `
            <div class="home-error">
                <div class="error-icon">⚠️</div>
                <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
                <button onclick="homeTab.init(window.currentUserId, window.supabaseClient)" class="retry-btn">다시 시도</button>
            </div>
        `;
    }

    /**
     * 컨텐츠 복원
     */
    restoreContent() {
        const homeTabContent = document.getElementById('homeTabContent');
        if (!homeTabContent) return;
        
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

    /**
     * 이벤트 리스너 초기화
     */
    initEventListeners() {
        // 훈련 시작 버튼
        const startTrainingBtn = document.getElementById('startTrainingBtn');
        if (startTrainingBtn) {
            startTrainingBtn.addEventListener('click', () => {
                console.log('🏃‍♂️ 훈련 화면으로 이동');
                this.navigateToTraining();
            });
        }

        // AI 요약 카드 클릭 이벤트
        const aiSummaryCard = document.getElementById('aiSummaryCard');
        if (aiSummaryCard) {
            aiSummaryCard.addEventListener('click', () => {
                console.log('🤖 AI 피드백 요청');
                this.requestAIFeedback();
            });
        }
    }

    /**
     * 훈련 화면으로 이동
     */
    navigateToTraining() {
        console.log('🔄 훈련 화면으로 이동');
        
        // SuumTrainingSetup 초기화 및 표시
        if (window.suumTrainingSetup) {
            window.suumTrainingSetup.init((resistanceData) => {
                this.handleTrainingStart(resistanceData);
            });
            window.suumTrainingSetup.show();
        } else {
            alert('훈련 설정 화면을 불러올 수 없습니다.');
        }
    }

    /**
     * 훈련 시작 처리
     */
    handleTrainingStart(resistanceData) {
        console.log('🏃‍♂️ 훈련 시작:', resistanceData);
        
        // TODO: 실제 훈련 화면으로 이동
        // 여기서 선택된 저항값을 사용하여 훈련 세션을 시작
        alert(`훈련을 시작합니다!\n흡기 저항: ${resistanceData.inhale}\n호기 저항: ${resistanceData.exhale}`);
    }

    /**
     * AI 피드백 요청
     */
    async requestAIFeedback() {
        try {
            console.log('🤖 AI 피드백 생성 중...');
            
            // AI 요약 카드에 로딩 상태 표시
            const aiSummaryCard = document.getElementById('aiSummaryCard');
            const aiSummaryMessage = document.getElementById('aiSummaryMessage');
            
            if (aiSummaryCard && aiSummaryMessage) {
                aiSummaryCard.classList.add('loading');
                aiSummaryMessage.textContent = 'AI가 분석 중입니다... 🤔';
            }
            
            // 최근 7일간의 운동 데이터 조회
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 6);
            
            const kstEndDate = this.toKSTDateString(endDate.toISOString());
            const kstStartDate = this.toKSTDateString(startDate.toISOString());
            
            const utcStartDate = new Date(`${kstStartDate}T00:00:00+09:00`);
            const utcEndDate = new Date(`${kstEndDate}T23:59:59+09:00`);
            
            const utcStart = new Date(utcStartDate.getTime() - 9 * 60 * 60 * 1000);
            const utcEnd = new Date(utcEndDate.getTime() - 9 * 60 * 60 * 1000);
            
            const { data: sessions, error } = await this.supabaseClient
                .from('exercise_sessions')
                .select(`
                    completed_breaths,
                    completed_sets,
                    inhale_resistance,
                    exhale_resistance,
                    user_feedback,
                    created_at
                `)
                .eq('user_id', this.currentUserId)
                .gte('created_at', utcStart.toISOString())
                .lt('created_at', utcEnd.toISOString())
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // AI 피드백 생성
            const aiFeedback = this.generateAIFeedback(sessions);
            
            // AI 조언을 데이터베이스에 저장
            await this.saveAIFeedback(aiFeedback);
            
            // UI 업데이트
            this.updateAISummaryCard(aiFeedback);
            
            console.log('✅ AI 피드백 생성 완료');
            
        } catch (error) {
            console.error('❌ AI 피드백 생성 실패:', error);
            
            // 에러 상태 표시
            const aiSummaryMessage = document.getElementById('aiSummaryMessage');
            if (aiSummaryMessage) {
                aiSummaryMessage.textContent = 'AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
            }
        } finally {
            // 로딩 상태 제거
            const aiSummaryCard = document.getElementById('aiSummaryCard');
            if (aiSummaryCard) {
                aiSummaryCard.classList.remove('loading');
            }
        }
    }

    /**
     * AI 피드백 생성
     */
    generateAIFeedback(sessions) {
        if (!sessions || sessions.length === 0) {
            return {
                summary: '아직 운동 기록이 없어요. 첫 번째 호흡 운동을 시작해보세요! 🚀',
                advice_type: 'encourage',
                created_at: new Date().toISOString()
            };
        }
        
        const totalSessions = sessions.length;
        const totalBreaths = sessions.reduce((sum, session) => sum + (session.completed_breaths || 0), 0);
        const avgBreathsPerSession = totalBreaths / totalSessions;
        
        // 저항 강도 분석
        const validResistanceSessions = sessions.filter(session => 
            session.inhale_resistance && session.exhale_resistance
        );
        
        let resistanceLevel = '적정';
        if (validResistanceSessions.length > 0) {
            const avgResistance = validResistanceSessions.reduce((sum, session) => {
                return sum + ((session.inhale_resistance + session.exhale_resistance) / 2);
            }, 0) / validResistanceSessions.length;
            
            if (avgResistance <= 2) {
                resistanceLevel = '쉬움';
            } else if (avgResistance >= 4) {
                resistanceLevel = '힘듦';
            }
        }
        
        // 피드백 생성 로직
        let summary = '';
        let adviceType = 'encourage';
        
        if (totalSessions >= 5) {
            summary = `이번 주 ${totalSessions}회나 운동하셨어요! 정말 대단해요! 💪 평균 ${Math.round(avgBreathsPerSession)}회의 호흡으로 꾸준히 발전하고 있어요.`;
            adviceType = 'motivate';
        } else if (totalSessions >= 3) {
            summary = `이번 주 ${totalSessions}회 운동하셨네요. 꾸준히 잘하고 있어요! 🌟 저항 강도는 ${resistanceLevel} 수준이에요.`;
            adviceType = 'encourage';
        } else if (totalSessions >= 1) {
            summary = `이번 주 ${totalSessions}회 운동하셨어요. 조금 더 자주 해보면 어떨까요? 📈 매일 조금씩이어도 괜찮아요!`;
            adviceType = 'caution';
        } else {
            summary = '이번 주는 아직 운동 기록이 없어요. 오늘부터 시작해보세요! 🚀 첫 걸음이 가장 중요해요.';
            adviceType = 'encourage';
        }
        
        return {
            summary,
            advice_type: adviceType,
            created_at: new Date().toISOString()
        };
    }

    /**
     * AI 피드백을 데이터베이스에 저장
     */
    async saveAIFeedback(aiFeedback) {
        try {
            const { error } = await this.supabaseClient
                .from('ai_advice')
                .insert({
                    user_id: this.currentUserId,
                    summary: aiFeedback.summary,
                    advice_type: aiFeedback.advice_type,
                    created_at: aiFeedback.created_at
                });
            
            if (error) throw error;
            
        } catch (error) {
            console.error('❌ AI 피드백 저장 실패:', error);
            // 저장 실패해도 UI는 업데이트
        }
    }

    /**
     * GreetingCard 로드
     */
    async loadGreetingCard() {
        try {
            // 사용자 정보 가져오기
            const { data: { user }, error: userError } = await this.supabaseClient.auth.getUser();
            if (userError) throw userError;
            
            const nickname = user?.user_metadata?.nickname || '사용자';
            
            // 어제와 오늘 세션 수 조회
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = this.toKSTDateString(yesterday.toISOString());
            
            const todayStr = this.toKSTDateString(new Date().toISOString());
            
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
            const { data: yesterdaySessions, error: yesterdayError } = await this.supabaseClient
                .from('exercise_sessions')
                .select('id')
                .eq('user_id', this.currentUserId)
                .gte('created_at', utcYesterdayStart.toISOString())
                .lt('created_at', utcYesterdayEnd.toISOString());
            
            if (yesterdayError) throw yesterdayError;
            
            // 오늘 세션 수 조회
            const { data: todaySessions, error: todayError } = await this.supabaseClient
                .from('exercise_sessions')
                .select('id')
                .eq('user_id', this.currentUserId)
                .gte('created_at', utcTodayStart.toISOString())
                .lt('created_at', utcTodayEnd.toISOString());
            
            if (todayError) throw todayError;
            
            const yesterdayCount = yesterdaySessions?.length || 0;
            const todayCount = todaySessions?.length || 0;
            
            // GreetingCard UI 업데이트
            this.updateGreetingCard(nickname, yesterdayCount, todayCount);
            
        } catch (error) {
            console.error('❌ GreetingCard 로드 실패:', error);
            this.updateGreetingCard('사용자', 0, 0);
        }
    }

    /**
     * GreetingCard UI 업데이트
     */
    updateGreetingCard(nickname, yesterdayCount, todayCount) {
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

    /**
     * GoalProgressCard 로드
     */
    async loadGoalProgressCard() {
        try {
            // 오늘 세션 수 조회
            const todayStr = this.toKSTDateString(new Date().toISOString());
            const todayStart = new Date(`${todayStr}T00:00:00+09:00`);
            const todayEnd = new Date(`${todayStr}T23:59:59+09:00`);
            
            const utcTodayStart = new Date(todayStart.getTime() - 9 * 60 * 60 * 1000);
            const utcTodayEnd = new Date(todayEnd.getTime() - 9 * 60 * 60 * 1000);
            
            const { data: todaySessions, error } = await this.supabaseClient
                .from('exercise_sessions')
                .select('id')
                .eq('user_id', this.currentUserId)
                .gte('created_at', utcTodayStart.toISOString())
                .lt('created_at', utcTodayEnd.toISOString());
            
            if (error) throw error;
            
            const todayCount = todaySessions?.length || 0;
            this.updateGoalProgressCard(todayCount);
            
        } catch (error) {
            console.error('❌ GoalProgressCard 로드 실패:', error);
            this.updateGoalProgressCard(0);
        }
    }

    /**
     * GoalProgressCard UI 업데이트
     */
    updateGoalProgressCard(todayCount) {
        const targetSessions = 2; // 목표 세션 수
        const totalBlocks = 10; // 총 블록 수
        const blocksPerSession = totalBlocks / targetSessions; // 세션당 블록 수
        
        // 진행 바 블록 생성
        this.renderProgressBlocks(todayCount, totalBlocks, blocksPerSession);
        
        // 진행률 텍스트 업데이트
        this.updateProgressText(todayCount, targetSessions);
        
        // 감성 피드백 업데이트
        this.updateProgressFeedback(todayCount, targetSessions);
    }

    /**
     * 진행 바 블록 렌더링
     */
    renderProgressBlocks(todayCount, totalBlocks, blocksPerSession) {
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

    /**
     * 진행률 텍스트 업데이트
     */
    updateProgressText(todayCount, targetSessions) {
        const progressText = document.getElementById('goalProgressText');
        if (!progressText) return;
        
        progressText.textContent = `${targetSessions}회 중 ${todayCount}회 완료했어요`;
    }

    /**
     * 감성 피드백 업데이트
     */
    updateProgressFeedback(todayCount, targetSessions) {
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



    /**
     * TodaySummaryCard 로드 (개선된 버전)
     */
    async loadTodaySummaryCard() {
        try {
            // 오늘 날짜 기준으로 모든 세션 조회
            const todayStr = this.toKSTDateString(new Date().toISOString());
            
            // KST 기준 날짜를 UTC 기준으로 변환
            const todayStart = new Date(`${todayStr}T00:00:00+09:00`);
            const todayEnd = new Date(`${todayStr}T23:59:59+09:00`);
            
            const utcTodayStart = new Date(todayStart.getTime() - 9 * 60 * 60 * 1000);
            const utcTodayEnd = new Date(todayEnd.getTime() - 9 * 60 * 60 * 1000);
            
            const { data: sessions, error } = await this.supabaseClient
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
                .eq('user_id', this.currentUserId)
                .gte('created_at', utcTodayStart.toISOString())
                .lt('created_at', utcTodayEnd.toISOString())
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (sessions && sessions.length > 0) {
                if (sessions.length === 1) {
                    // 세션이 1개인 경우 - TodaySummaryCard 표시
                    this.updateTodaySummaryCard(sessions[0]);
                } else {
                    // 세션이 2개 이상인 경우 - DailySessionSlider 표시
                    this.updateDailySessionSlider(sessions);
                }
            } else {
                // 오늘 운동 기록이 없는 경우
                this.updateNoSessionCard();
            }
            
        } catch (error) {
            console.error('❌ TodaySummaryCard 로드 실패:', error);
            this.updateNoSessionCard();
        }
    }

    /**
     * TodaySummaryCard UI 업데이트
     */
    updateTodaySummaryCard(session) {
        const todaySummaryCard = document.getElementById('todaySummaryCard');
        const noSessionCard = document.getElementById('noSessionCard');
        const dailySessionSlider = document.getElementById('dailySessionSlider');
        
        // 모든 카드 숨기기
        if (todaySummaryCard) todaySummaryCard.style.display = 'none';
        if (dailySessionSlider) dailySessionSlider.style.display = 'none';
        if (noSessionCard) noSessionCard.style.display = 'none';
        
        // TodaySummaryCard 표시
        if (todaySummaryCard) todaySummaryCard.style.display = 'block';
        
        const exerciseTimeEl = document.getElementById('todayExerciseTime');
        const setsEl = document.getElementById('todaySets');
        const breathsEl = document.getElementById('todayBreaths');
        const resistanceEl = document.getElementById('todayResistance');
        const feedbackEl = document.getElementById('todayFeedback');
        
        // 운동 시간 포맷팅
        const exerciseTime = session.exercise_time ? this.formatTime(parseInt(session.exercise_time)) : '기록 없음';
        exerciseTimeEl.textContent = exerciseTime;
        
        // 세트 수
        const sets = session.completed_sets || 0;
        setsEl.textContent = `${sets}세트`;
        
        // 호흡 수
        const breaths = session.completed_breaths || 0;
        breathsEl.textContent = `${breaths}회`;
        
        // 평균 저항 강도
        const avgResistance = this.calculateAverageResistance(session.inhale_resistance, session.exhale_resistance);
        resistanceEl.textContent = avgResistance;
        
        // 내 느낌
        const feedback = session.user_feedback || '기록 없음';
        feedbackEl.textContent = feedback;
    }

    /**
     * NoSessionCard UI 업데이트
     */
    updateNoSessionCard() {
        const todaySummaryCard = document.getElementById('todaySummaryCard');
        const noSessionCard = document.getElementById('noSessionCard');
        const dailySessionSlider = document.getElementById('dailySessionSlider');
        
        // 모든 카드 숨기기
        if (todaySummaryCard) todaySummaryCard.style.display = 'none';
        if (dailySessionSlider) dailySessionSlider.style.display = 'none';
        if (noSessionCard) noSessionCard.style.display = 'none';
        
        // NoSessionCard 표시
        if (noSessionCard) noSessionCard.style.display = 'block';
    }

    /**
     * DailySessionSlider UI 업데이트
     */
    updateDailySessionSlider(sessions) {
        const todaySummaryCard = document.getElementById('todaySummaryCard');
        const noSessionCard = document.getElementById('noSessionCard');
        const dailySessionSlider = document.getElementById('dailySessionSlider');
        
        // 모든 카드 숨기기
        if (todaySummaryCard) todaySummaryCard.style.display = 'none';
        if (dailySessionSlider) dailySessionSlider.style.display = 'none';
        if (noSessionCard) noSessionCard.style.display = 'none';
        
        // DailySessionSlider 표시
        if (dailySessionSlider) dailySessionSlider.style.display = 'block';
        
        // 슬라이더 컨텐츠 생성
        this.renderSessionSlider(sessions);
        
        // 인디케이터 생성
        this.renderSliderIndicators(sessions.length);
        
        // 슬라이더 이벤트 리스너 등록
        this.initSliderEventListeners();
    }

    /**
     * 세션 슬라이더 렌더링
     */
    renderSessionSlider(sessions) {
        const sessionSlider = document.getElementById('sessionSlider');
        if (!sessionSlider) return;
        
        let html = '';
        
        sessions.forEach((session, index) => {
            const sessionTime = this.formatSessionTime(session.created_at);
            const exerciseTime = session.exercise_time ? this.formatTime(parseInt(session.exercise_time)) : '기록 없음';
            const sets = session.completed_sets || 0;
            const breaths = session.completed_breaths || 0;
            const avgResistance = this.calculateAverageResistance(session.inhale_resistance, session.exhale_resistance);
            const feedback = session.user_feedback || '기록 없음';
            
            html += `
                <div class="session-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <div class="session-slide-header">
                        <h4>${index + 1}번째 세션</h4>
                        <span class="session-time">${sessionTime}</span>
                    </div>
                    <div class="session-slide-content">
                        <div class="session-stat-item">
                            <span class="session-stat-icon">⏱️</span>
                            <span class="session-stat-label">운동 시간</span>
                            <span class="session-stat-value">${exerciseTime}</span>
                        </div>
                        <div class="session-stat-item">
                            <span class="session-stat-icon">🔄</span>
                            <span class="session-stat-label">세트 수</span>
                            <span class="session-stat-value">${sets}세트</span>
                        </div>
                        <div class="session-stat-item">
                            <span class="session-stat-icon">🫁</span>
                            <span class="session-stat-label">호흡 수</span>
                            <span class="session-stat-value">${breaths}회</span>
                        </div>
                        <div class="session-stat-item">
                            <span class="session-stat-icon">💪</span>
                            <span class="session-stat-label">평균 저항</span>
                            <span class="session-stat-value">${avgResistance}</span>
                        </div>
                        <div class="session-stat-item">
                            <span class="session-stat-icon">😊</span>
                            <span class="session-stat-label">내 느낌</span>
                            <span class="session-stat-value">${feedback}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        sessionSlider.innerHTML = html;
    }

    /**
     * 슬라이더 인디케이터 렌더링
     */
    renderSliderIndicators(sessionCount) {
        const indicatorsContainer = document.querySelector('.slider-indicators');
        if (!indicatorsContainer) return;
        
        let html = '';
        
        for (let i = 0; i < sessionCount; i++) {
            html += `<div class="slider-indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`;
        }
        
        indicatorsContainer.innerHTML = html;
    }

    /**
     * 슬라이더 이벤트 리스너 초기화
     */
    initSliderEventListeners() {
        const indicators = document.querySelectorAll('.slider-indicator');
        const slides = document.querySelectorAll('.session-slide');
        
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const index = parseInt(indicator.dataset.index);
                this.showSlide(index);
            });
        });
    }

    /**
     * 특정 슬라이드 표시
     */
    showSlide(index) {
        const slides = document.querySelectorAll('.session-slide');
        const indicators = document.querySelectorAll('.slider-indicator');
        
        // 모든 슬라이드와 인디케이터 비활성화
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // 선택된 슬라이드와 인디케이터 활성화
        if (slides[index]) slides[index].classList.add('active');
        if (indicators[index]) indicators[index].classList.add('active');
    }

    /**
     * 세션 시간 포맷팅
     */
    formatSessionTime(utcTimeString) {
        try {
            const utcDate = new Date(utcTimeString);
            const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
            
            const hours = kstDate.getHours();
            const minutes = kstDate.getMinutes();
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('세션 시간 포맷팅 오류:', error);
            return '시간 정보 없음';
        }
    }

    /**
     * AISummaryCard 로드
     */
    async loadAISummaryCard() {
        try {
            // 가장 최근 AI 조언 조회
            const { data: aiAdvice, error } = await this.supabaseClient
                .from('ai_advice')
                .select(`
                    summary,
                    advice_type,
                    created_at
                `)
                .eq('user_id', this.currentUserId)
                .order('created_at', { ascending: false })
                .limit(1);
            
            if (error) throw error;
            
            if (aiAdvice && aiAdvice.length > 0) {
                this.updateAISummaryCard(aiAdvice[0]);
            } else {
                // AI 조언이 없는 경우
                this.updateAISummaryCard(null);
            }
            
        } catch (error) {
            console.error('❌ AISummaryCard 로드 실패:', error);
            this.updateAISummaryCard(null);
        }
    }

    /**
     * AISummaryCard UI 업데이트
     */
    updateAISummaryCard(aiAdvice) {
        const aiSummaryCard = document.getElementById('aiSummaryCard');
        const aiSummaryIcon = document.getElementById('aiSummaryIcon');
        const aiSummaryMessage = document.getElementById('aiSummaryMessage');
        const aiSummaryDate = document.getElementById('aiSummaryDate');
        
        if (!aiSummaryCard || !aiSummaryIcon || !aiSummaryMessage || !aiSummaryDate) return;
        
        if (!aiAdvice) {
            // AI 조언이 없는 경우 - 기본 상태
            aiSummaryCard.className = 'ai-summary-card card mb-4';
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
        aiSummaryCard.className = `ai-summary-card card mb-4 ${adviceType}`;
        
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
        const analysisDate = this.formatAnalysisDate(createdAt);
        aiSummaryDate.textContent = `분석 날짜: ${analysisDate}`;
    }

    /**
     * WeeklyTrendCard 로드
     */
    async loadWeeklyTrendCard() {
        try {
            // 최근 7일 데이터 조회
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 6); // 7일 전부터
            
            // KST 기준 날짜를 UTC 기준으로 변환
            const kstEndDate = this.toKSTDateString(endDate.toISOString());
            const kstStartDate = this.toKSTDateString(startDate.toISOString());
            
            const utcStartDate = new Date(`${kstStartDate}T00:00:00+09:00`);
            const utcEndDate = new Date(`${kstEndDate}T23:59:59+09:00`);
            
            const utcStart = new Date(utcStartDate.getTime() - 9 * 60 * 60 * 1000);
            const utcEnd = new Date(utcEndDate.getTime() - 9 * 60 * 60 * 1000);
            
            const { data: sessions, error } = await this.supabaseClient
                .from('exercise_sessions')
                .select(`
                    completed_breaths,
                    completed_sets,
                    inhale_resistance,
                    exhale_resistance,
                    created_at
                `)
                .eq('user_id', this.currentUserId)
                .gte('created_at', utcStart.toISOString())
                .lt('created_at', utcEnd.toISOString());
            
            if (error) throw error;
            
            this.updateWeeklyTrendCard(sessions, kstStartDate, kstEndDate);
            
        } catch (error) {
            console.error('❌ WeeklyTrendCard 로드 실패:', error);
            this.updateWeeklyTrendCard([], '', '');
        }
    }

    /**
     * WeeklyTrendCard UI 업데이트
     */
    updateWeeklyTrendCard(sessions, startDate, endDate) {
        const weeklyTrendCard = document.getElementById('weeklyTrendCard');
        const weeklyDateRange = document.getElementById('weeklyDateRange');
        const weeklyInsufficientData = document.getElementById('weeklyInsufficientData');
        const weeklyTrendData = document.getElementById('weeklyTrendData');
        
        if (!weeklyTrendCard || !weeklyDateRange || !weeklyInsufficientData || !weeklyTrendData) return;
        
        // 날짜 범위 업데이트
        const dateRangeText = this.formatWeeklyDateRange(startDate, endDate);
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
        const weeklyData = this.processWeeklyData(sessions, startDate);
        
        // 차트 생성
        this.createWeeklyChart(weeklyData);
        
        // 통계 업데이트
        this.updateWeeklyStats(sessions);
        
        // AI 코멘트 업데이트
        this.updateWeeklyAIComment(sessions.length);
    }

    /**
     * 주간 날짜 범위 포맷팅
     */
    formatWeeklyDateRange(startDate, endDate) {
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

    /**
     * 주간 데이터 처리
     */
    processWeeklyData(sessions, startDate) {
        const weeklyData = [];
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        
        // 7일간 데이터 초기화
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            weeklyData.push({
                date: this.toKSTDateString(date.toISOString()),
                weekday: weekdays[date.getDay()],
                breaths: 0,
                sessions: 0
            });
        }
        
        // 세션 데이터 매핑
        sessions.forEach(session => {
            const sessionDate = this.toKSTDateString(session.created_at);
            const dayIndex = weeklyData.findIndex(day => day.date === sessionDate);
            
            if (dayIndex !== -1) {
                weeklyData[dayIndex].breaths += session.completed_breaths || 0;
                weeklyData[dayIndex].sessions += 1;
            }
        });
        
        return weeklyData;
    }

    /**
     * 주간 차트 생성
     */
    createWeeklyChart(weeklyData) {
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

    /**
     * 주간 통계 업데이트
     */
    updateWeeklyStats(sessions) {
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

    /**
     * 주간 AI 코멘트 업데이트
     */
    updateWeeklyAIComment(sessionCount) {
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

    /**
     * 유틸리티 함수들
     */

    /**
     * UTC를 KST 날짜 문자열로 변환
     */
    toKSTDateString(utcString) {
        const date = new Date(utcString);
        const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
        return kstDate.toISOString().split('T')[0];
    }

    /**
     * 시간 포맷팅 (초 → 분:초)
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}분 ${remainingSeconds}초`;
    }

    /**
     * 평균 저항 강도 계산
     */
    calculateAverageResistance(inhaleResistance, exhaleResistance) {
        if (!inhaleResistance || !exhaleResistance) {
            return '기록 없음';
        }
        
        const avg = (inhaleResistance + exhaleResistance) / 2;
        
        if (avg <= 2) {
            return '쉬움';
        } else if (avg <= 4) {
            return '적정';
        } else {
            return '힘듦';
        }
    }

    /**
     * 분석 날짜 포맷팅 (UTC → KST)
     */
    formatAnalysisDate(utcTimeString) {
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
}

// 전역 인스턴스 생성
const homeTab = new HomeTab();

// 전역으로 노출
window.homeTab = homeTab;
