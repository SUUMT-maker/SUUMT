/**
 * SuumTrainingStartScreen 컴포넌트
 * 운동모드 > 숨트레이닝 진입 시 표시되는 시작 화면
 */

class SuumTrainingStartScreen {
    constructor() {
        this.isVisible = false;
        this.onStartCallback = null;
        this.onGoBackCallback = null;
        this.sessionConfig = {
            inhaleResistance: 2,
            exhaleResistance: 3,
            dailyGoal: 2,
            completedToday: 1
        };
    }

    /**
     * SuumTrainingStartScreen 초기화
     * @param {object} sessionConfig - 세션 설정 정보
     * @param {function} onStart - 시작 버튼 클릭 시 호출될 콜백 함수
     * @param {function} onGoBack - 돌아가기 버튼 클릭 시 호출될 콜백 함수
     */
    async init(sessionConfig, onStart, onGoBack) {
        this.onStartCallback = onStart;
        this.onGoBackCallback = onGoBack;
        
        // 세션 설정 업데이트
        if (sessionConfig) {
            this.sessionConfig = { ...this.sessionConfig, ...sessionConfig };
        }
        
        // 오늘 완료된 세션 수 로드
        await this.loadTodaySessions();
        
        this.render();
        this.initEventListeners();
        console.log('✅ SuumTrainingStartScreen 초기화 완료');
    }

    /**
     * 오늘 완료된 세션 수 로드
     */
    async loadTodaySessions() {
        try {
            if (!window.currentUserId || !window.supabaseClient) {
                console.log('⚠️ 사용자 정보 또는 Supabase 클라이언트가 없어 임의값 사용');
                return;
            }

            // 오늘 날짜 기준으로 세션 수 조회
            const todayStr = this.toKSTDateString(new Date().toISOString());
            
            // KST 기준 날짜를 UTC 기준으로 변환
            const todayStart = new Date(`${todayStr}T00:00:00+09:00`);
            const todayEnd = new Date(`${todayStr}T23:59:59+09:00`);
            
            const utcTodayStart = new Date(todayStart.getTime() - 9 * 60 * 60 * 1000);
            const utcTodayEnd = new Date(todayEnd.getTime() - 9 * 60 * 60 * 1000);
            
            const { data: sessions, error } = await window.supabaseClient
                .from('exercise_sessions')
                .select('id')
                .eq('user_id', window.currentUserId)
                .gte('created_at', utcTodayStart.toISOString())
                .lt('created_at', utcTodayEnd.toISOString());
            
            if (error) throw error;
            
            this.sessionConfig.completedToday = sessions?.length || 0;
            console.log('✅ 오늘 완료된 세션 수 로드:', this.sessionConfig.completedToday);
            
        } catch (error) {
            console.error('❌ 오늘 세션 수 로드 실패:', error);
            // 에러 시 기본값 유지
        }
    }

    /**
     * 컴포넌트 표시
     */
    show() {
        this.isVisible = true;
        this.updateVisibility();
        console.log('🏃‍♂️ SuumTrainingStartScreen 표시');
    }

    /**
     * 컴포넌트 숨김
     */
    hide() {
        this.isVisible = false;
        this.updateVisibility();
        console.log('🏃‍♂️ SuumTrainingStartScreen 숨김');
    }

    /**
     * 가시성 업데이트
     */
    updateVisibility() {
        const container = document.getElementById('suumTrainingStartScreen');
        if (container) {
            container.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    /**
     * 컴포넌트 렌더링
     */
    render() {
        // 기존 컨테이너가 있으면 제거
        const existingContainer = document.getElementById('suumTrainingStartScreen');
        if (existingContainer) {
            existingContainer.remove();
        }

        // 새로운 컨테이너 생성
        const container = document.createElement('div');
        container.id = 'suumTrainingStartScreen';
        container.className = 'suum-training-start-screen';
        container.style.display = 'none';

        container.innerHTML = `
            <div class="start-screen-overlay">
                <div class="start-screen-modal">
                    <div class="start-screen-content">
                        <!-- 헤더 -->
                        <div class="start-screen-header">
                            <h2 class="start-screen-title">운동 전 마지막 점검!</h2>
                            <p class="start-screen-subtitle">숨트 저항값을 확인하고 시작하세요</p>
                        </div>

                        <!-- SuumSessionConfigCard -->
                        <div class="session-config-card">
                            <div class="config-section">
                                <h3 class="config-title">숨트 설정</h3>
                                <div class="resistance-display">
                                    <div class="resistance-item">
                                        <span class="resistance-label">숨 들이마시기</span>
                                        <span class="resistance-value" id="displayInhale">${this.sessionConfig.inhaleResistance}</span>
                                    </div>
                                    <div class="resistance-item">
                                        <span class="resistance-label">숨 내쉬기</span>
                                        <span class="resistance-value" id="displayExhale">${this.sessionConfig.exhaleResistance}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="config-section">
                                <h3 class="config-title">오늘의 목표</h3>
                                <div class="goal-display">
                                    <div class="goal-item">
                                        <span class="goal-label">목표 세션</span>
                                        <span class="goal-value">${this.sessionConfig.dailyGoal}회</span>
                                    </div>
                                    <div class="goal-item">
                                        <span class="goal-label">완료 세션</span>
                                        <span class="goal-value completed">${this.sessionConfig.completedToday}회</span>
                                    </div>
                                </div>
                                <div class="goal-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" id="goalProgressFill" style="width: ${this.calculateProgressPercentage()}%"></div>
                                    </div>
                                    <span class="progress-text">${this.sessionConfig.completedToday}/${this.sessionConfig.dailyGoal} 완료</span>
                                </div>
                            </div>
                        </div>

                        <!-- 주의 문구 -->
                        <div class="start-screen-warning">
                            <p>편안한 자세로 앉아서 준비하세요. 운동 중 불편함을 느끼면 즉시 중단하세요.</p>
                        </div>

                        <!-- 버튼 섹션 -->
                        <div class="start-screen-actions">
                            <button class="go-back-btn" id="goBackBtn">운동모드 선택으로 돌아가기</button>
                            <button class="start-session-btn" id="startSessionBtn">지금 시작하기</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // body에 추가
        document.body.appendChild(container);
    }

    /**
     * 이벤트 리스너 초기화
     */
    initEventListeners() {
        // 시작 버튼
        const startBtn = document.getElementById('startSessionBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.handleStart();
            });
        }

        // 돌아가기 버튼
        const goBackBtn = document.getElementById('goBackBtn');
        if (goBackBtn) {
            goBackBtn.addEventListener('click', () => {
                this.handleGoBack();
            });
        }

        // 오버레이 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-screen-overlay')) {
                this.handleGoBack();
            }
        });
    }

    /**
     * 시작 버튼 클릭 처리
     */
    handleStart() {
        console.log('🏃‍♂️ 훈련 세션 시작 준비');
        
        // 카운트다운 오버레이 초기화 및 표시
        window.suumCountdownOverlay.init(
            // 카운트다운 완료 시 콜백
            () => {
                console.log('✅ 카운트다운 완료 - 세션 시작');
                this.startTrainingSession();
            },
            // 카운트다운 취소 시 콜백
            () => {
                console.log('❌ 카운트다운 취소');
                // 취소 시 아무것도 하지 않음 (화면 유지)
            }
        );
        
        // 카운트다운 시작
        window.suumCountdownOverlay.show();
    }

    /**
     * 실제 훈련 세션 시작
     */
    startTrainingSession() {
        console.log('🏋️‍♂️ 실제 훈련 세션 시작', this.sessionConfig);
        
        // 훈련 세션 초기화 및 시작
        window.suumTrainingSession.init(
            this.sessionConfig,
            // 세션 완료 콜백
            (sessionData) => {
                console.log('✅ 훈련 세션 완료', sessionData);
                if (this.onStartCallback) {
                    this.onStartCallback(sessionData);
                }
            },
            // 세션 중단 콜백
            (sessionData) => {
                console.log('❌ 훈련 세션 중단', sessionData);
                // 중단 시 시작 화면으로 돌아가기
                this.show();
            },
            // 진행 상황 업데이트 콜백
            (progress) => {
                console.log('📊 진행 상황 업데이트', progress);
            }
        );
        
        // 현재 화면 숨김
        this.hide();
        
        // 세션 시작
        window.suumTrainingSession.start();
    }

    /**
     * 돌아가기 버튼 클릭 처리
     */
    handleGoBack() {
        console.log('⬅️ 운동모드 선택으로 돌아가기');
        
        if (this.onGoBackCallback) {
            this.onGoBackCallback();
        }
        
        this.hide();
    }

    /**
     * 진행률 계산
     */
    calculateProgressPercentage() {
        const percentage = (this.sessionConfig.completedToday / this.sessionConfig.dailyGoal) * 100;
        return Math.min(percentage, 100);
    }

    /**
     * 세션 설정 업데이트
     */
    updateSessionConfig(newConfig) {
        this.sessionConfig = { ...this.sessionConfig, ...newConfig };
        this.updateDisplay();
    }

    /**
     * 화면 업데이트
     */
    updateDisplay() {
        const inhaleEl = document.getElementById('displayInhale');
        const exhaleEl = document.getElementById('displayExhale');
        const progressFillEl = document.getElementById('goalProgressFill');
        
        if (inhaleEl) inhaleEl.textContent = this.sessionConfig.inhaleResistance;
        if (exhaleEl) exhaleEl.textContent = this.sessionConfig.exhaleResistance;
        if (progressFillEl) {
            progressFillEl.style.width = `${this.calculateProgressPercentage()}%`;
        }
    }

    /**
     * UTC를 KST 날짜 문자열로 변환
     */
    toKSTDateString(utcString) {
        const date = new Date(utcString);
        const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
        return kstDate.toISOString().split('T')[0];
    }

    /**
     * 현재 세션 설정 반환
     */
    getSessionConfig() {
        return { ...this.sessionConfig };
    }
}

// 전역 인스턴스 생성
const suumTrainingStartScreen = new SuumTrainingStartScreen();

// 전역으로 노출
window.suumTrainingStartScreen = suumTrainingStartScreen;
