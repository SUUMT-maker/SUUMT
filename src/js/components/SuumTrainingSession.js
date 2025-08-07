/**
 * SuumTrainingSession 컴포넌트
 * 실제 호흡 훈련 세션을 진행하는 메인 컴포넌트
 */

// 세션 상수값 정의 (설계 확정안)
const SESSION_CONSTANTS = {
    TOTAL_SETS: 2,
    REPS_PER_SET: 10,
    INHALE_DURATION: 3000,  // 3초 (ms)
    HOLD_DURATION: 1000,    // 1초 (ms)
    EXHALE_DURATION: 3000,  // 3초 (ms)
    REST_DURATION: 120000,  // 2분 (ms)
    TIMER_TOLERANCE: 50     // ±50ms 오차
};

// 호흡 단계 정의
const BREATH_PHASES = {
    INHALE: 'inhale',
    HOLD: 'hold',
    EXHALE: 'exhale'
};

// UX 텍스트 메시지
const UX_MESSAGES = {
    INHALE: "깊게 들이마셔요",
    EXHALE: "힘껏 내쉬어요",
    BREATH_COUNT: (current) => `지금 ${current}번째 호흡 중이에요`,
    SET_COMPLETE: (setNum) => `${setNum === 1 ? '첫' : '두'} 번째 세트를 끝냈어요. 잠깐 숨을 고를까요?`,
    NEXT_SET: "지금 두 번째 세트를 시작할게요",
    SESSION_COMPLETE: "오늘 세션 완료! 정말 잘했어요.",
    CONFIRM_STOP: "운동을 멈출까요?"
};

class SuumTrainingSession {
    constructor() {
        this.isVisible = false;
        this.isActive = false;
        this.isPaused = false;
        
        // 세션 상태
        this.currentSet = 1;
        this.currentRep = 1;
        this.currentPhase = BREATH_PHASES.INHALE;
        this.isResting = false;
        
        // 타이머 관련
        this.phaseTimer = null;
        this.restTimer = null;
        this.startTime = null;
        this.phaseStartTime = null;
        
        // 세션 설정
        this.sessionConfig = {
            inhaleResistance: 1,
            exhaleResistance: 1
        };
        
        // 콜백 함수들
        this.onCompleteCallback = null;
        this.onAbortCallback = null;
        this.onProgressCallback = null;
    }

    /**
     * 세션 초기화
     * @param {Object} config - 세션 설정 (저항 강도 등)
     * @param {function} onComplete - 세션 완료 콜백
     * @param {function} onAbort - 세션 중단 콜백
     * @param {function} onProgress - 진행 상황 업데이트 콜백
     */
    init(config, onComplete, onAbort, onProgress) {
        this.sessionConfig = { ...this.sessionConfig, ...config };
        this.onCompleteCallback = onComplete;
        this.onAbortCallback = onAbort;
        this.onProgressCallback = onProgress;
        
        this.render();
        this.initEventListeners();
        
        console.log('✅ SuumTrainingSession 초기화 완료', this.sessionConfig);
    }

    /**
     * 세션 시작
     */
    start() {
        this.isVisible = true;
        this.isActive = true;
        this.startTime = Date.now();
        
        this.resetSessionState();
        this.updateVisibility();
        this.startBreathingCycle();
        
        console.log('🏃‍♂️ 훈련 세션 시작');
    }

    /**
     * 세션 일시정지
     */
    pause() {
        this.isPaused = true;
        this.isActive = false;
        this.clearTimers();
        
        console.log('⏸️ 세션 일시정지');
    }

    /**
     * 세션 재개
     */
    resume() {
        this.isPaused = false;
        this.isActive = true;
        
        if (this.isResting) {
            this.startRestTimer();
        } else {
            this.startBreathingCycle();
        }
        
        console.log('▶️ 세션 재개');
    }

    /**
     * 세션 중단
     */
    abort() {
        this.showConfirmDialog(UX_MESSAGES.CONFIRM_STOP, () => {
            this.isActive = false;
            this.isPaused = false;
            this.clearTimers();
            
            // Effort Level Survey 표시 (중단된 세션)
            this.showEffortLevelSurvey(true); // 중단된 세션
            
            console.log('❌ 세션 중단');
        });
    }

    /**
     * 세션 숨김
     */
    hide() {
        this.isVisible = false;
        this.isActive = false;
        this.clearTimers();
        this.updateVisibility();
        
        console.log('🔒 SuumTrainingSession 숨김');
    }

    /**
     * 세션 상태 초기화
     */
    resetSessionState() {
        this.currentSet = 1;
        this.currentRep = 1;
        this.currentPhase = BREATH_PHASES.INHALE;
        this.isResting = false;
        this.isPaused = false;
    }

    /**
     * 호흡 사이클 시작
     */
    startBreathingCycle() {
        if (!this.isActive) return;
        
        this.isResting = false;
        this.phaseStartTime = Date.now();
        this.updateDisplay();
        
        // 현재 단계에 따른 타이머 설정
        let duration;
        switch (this.currentPhase) {
            case BREATH_PHASES.INHALE:
                duration = SESSION_CONSTANTS.INHALE_DURATION;
                break;
            case BREATH_PHASES.HOLD:
                duration = SESSION_CONSTANTS.HOLD_DURATION;
                break;
            case BREATH_PHASES.EXHALE:
                duration = SESSION_CONSTANTS.EXHALE_DURATION;
                break;
        }
        
        this.phaseTimer = setTimeout(() => {
            this.nextPhase();
        }, duration);
    }

    /**
     * 다음 호흡 단계로 진행
     */
    nextPhase() {
        if (!this.isActive) return;
        
        switch (this.currentPhase) {
            case BREATH_PHASES.INHALE:
                this.currentPhase = BREATH_PHASES.HOLD;
                break;
            case BREATH_PHASES.HOLD:
                this.currentPhase = BREATH_PHASES.EXHALE;
                break;
            case BREATH_PHASES.EXHALE:
                this.completeRep();
                return;
        }
        
        this.startBreathingCycle();
    }

    /**
     * 1회 호흡 완료 처리
     */
    completeRep() {
        this.currentRep++;
        
        // 세트 완료 체크
        if (this.currentRep > SESSION_CONSTANTS.REPS_PER_SET) {
            this.completeSet();
        } else {
            // 다음 호흡으로
            this.currentPhase = BREATH_PHASES.INHALE;
            this.startBreathingCycle();
        }
        
        // 진행 상황 업데이트
        if (this.onProgressCallback) {
            this.onProgressCallback(this.getProgress());
        }
    }

    /**
     * 세트 완료 처리
     */
    completeSet() {
        console.log(`✅ ${this.currentSet}세트 완료`);
        
        // 마지막 세트면 세션 완료
        if (this.currentSet >= SESSION_CONSTANTS.TOTAL_SETS) {
            this.completeSession();
            return;
        }
        
        // 다음 세트를 위한 휴식 시작
        this.currentSet++;
        this.currentRep = 1;
        this.currentPhase = BREATH_PHASES.INHALE;
        this.startRest();
    }

    /**
     * 휴식 시간 시작 (SuumRestBetweenSets 컴포넌트 사용)
     */
    startRest() {
        this.isResting = true;
        
        // 현재 세션 화면 숨김
        this.hide();
        
        // SuumRestBetweenSets 컴포넌트 초기화 및 시작
        window.suumRestBetweenSets.init(
            this.currentSet - 1, // 완료된 세트 번호
            // 다음 세트 시작 콜백
            (restData) => {
                console.log('✅ 휴식 완료 - 다음 세트 시작', restData);
                this.endRest();
            },
            // 세션 종료 콜백
            (restData) => {
                console.log('❌ 휴식 중 세션 종료', restData);
                this.abort();
            },
            // 진행 상황 업데이트 콜백
            (progress) => {
                if (this.onProgressCallback) {
                    this.onProgressCallback({
                        ...this.getProgress(),
                        restProgress: progress
                    });
                }
            }
        );
        
        window.suumRestBetweenSets.start();
        
        console.log('😴 세트 간 휴식 시작 (별도 컴포넌트)');
    }

    /**
     * 휴식 타이머 시작
     */
    startRestTimer() {
        let remainingTime = SESSION_CONSTANTS.REST_DURATION;
        
        const updateRestTimer = () => {
            if (!this.isActive || !this.isResting) return;
            
            this.updateRestDisplay(remainingTime);
            
            if (remainingTime <= 0) {
                this.endRest();
                return;
            }
            
            remainingTime -= 1000;
            this.restTimer = setTimeout(updateRestTimer, 1000);
        };
        
        updateRestTimer();
    }

    /**
     * 휴식 종료 (SuumRestBetweenSets에서 호출)
     */
    endRest() {
        this.isResting = false;
        
        // 세션 화면 다시 표시
        this.isVisible = true;
        this.updateVisibility();
        
        // 다음 세트 호흡 시작
        this.startBreathingCycle();
        
        console.log('🏃‍♂️ 휴식 종료, 다음 세트 시작');
    }

    /**
     * 다음 세트 즉시 시작 (더 이상 사용하지 않음 - SuumRestBetweenSets에서 처리)
     */
    startNextSetNow() {
        // 이 메서드는 더 이상 사용하지 않음
        // SuumRestBetweenSets 컴포넌트에서 직접 endRest() 호출
        console.warn('startNextSetNow() is deprecated. Use SuumRestBetweenSets component.');
    }

    /**
     * 세션 완료
     */
    completeSession() {
        this.isActive = false;
        this.clearTimers();
        
        // 완료 메시지 표시
        this.showCompletionMessage();
        
        // Effort Level Survey 표시
        this.showEffortLevelSurvey(false); // 정상 완료
        
        console.log('🎉 세션 완료!');
    }

    /**
     * Effort Level Survey 표시
     * @param {boolean} wasAborted - 세션이 중단되었는지 여부
     */
    showEffortLevelSurvey(wasAborted) {
        // 세션 ID 생성 (간단한 UUID 형태)
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Effort Level Survey 초기화 및 표시
        window.effortLevelSurvey.init(
            sessionId,
            wasAborted,
            (result) => {
                console.log('📊 Effort Level Survey 결과:', result);
                
                // 적절한 콜백 호출
                if (wasAborted) {
                    if (this.onAbortCallback) {
                        this.onAbortCallback({
                            ...this.getSessionData(),
                            effortLevel: result.effortLevel
                        });
                    }
                } else {
                    if (this.onCompleteCallback) {
                        this.onCompleteCallback({
                            ...this.getSessionData(),
                            effortLevel: result.effortLevel
                        });
                    }
                }
                
                // 세션 화면 숨김
                this.hide();
            }
        );
        
        window.effortLevelSurvey.show();
    }

    /**
     * 타이머 정리
     */
    clearTimers() {
        if (this.phaseTimer) {
            clearTimeout(this.phaseTimer);
            this.phaseTimer = null;
        }
        
        if (this.restTimer) {
            clearTimeout(this.restTimer);
            this.restTimer = null;
        }
    }

    /**
     * 세션 데이터 반환
     */
    getSessionData() {
        const endTime = Date.now();
        const totalDuration = endTime - this.startTime;
        
        return {
            inhaleResistance: this.sessionConfig.inhaleResistance,
            exhaleResistance: this.sessionConfig.exhaleResistance,
            completedSets: this.isResting ? this.currentSet - 1 : this.currentSet,
            completedBreaths: this.currentSet === 1 ? this.currentRep - 1 : 
                             (SESSION_CONSTANTS.REPS_PER_SET + (this.currentRep - 1)),
            totalDuration,
            isAborted: !this.isSessionComplete(),
            startTime: this.startTime,
            endTime
        };
    }

    /**
     * 진행률 반환
     */
    getProgress() {
        const totalBreaths = SESSION_CONSTANTS.TOTAL_SETS * SESSION_CONSTANTS.REPS_PER_SET;
        const completedBreaths = this.currentSet === 1 ? this.currentRep - 1 : 
                                SESSION_CONSTANTS.REPS_PER_SET + (this.currentRep - 1);
        
        return {
            currentSet: this.currentSet,
            currentRep: this.currentRep,
            currentPhase: this.currentPhase,
            completedBreaths,
            totalBreaths,
            percentage: (completedBreaths / totalBreaths) * 100,
            isResting: this.isResting
        };
    }

    /**
     * 세션 완료 여부 확인
     */
    isSessionComplete() {
        return this.currentSet > SESSION_CONSTANTS.TOTAL_SETS;
    }

    /**
     * 컴포넌트 렌더링
     */
    render() {
        // 기존 컨테이너 제거
        const existingContainer = document.getElementById('suumTrainingSession');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.id = 'suumTrainingSession';
        container.className = 'suum-training-session';
        container.style.display = 'none';

        container.innerHTML = `
            <div class="session-overlay">
                <div class="session-content">
                    <!-- 헤더 영역 -->
                    <div class="session-header">
                        <button class="session-close-btn" id="sessionCloseBtn">×</button>
                        <div class="session-progress-info">
                            <span id="sessionSetInfo">1 / 2 세트</span>
                            <span id="sessionRepInfo">1 / 10 회</span>
                        </div>
                    </div>

                    <!-- 메인 호흡 영역 -->
                    <div class="session-main" id="sessionMain">
                        <div class="breath-display">
                            <div class="breath-phase-text" id="breathPhaseText">깊게 들이마셔요</div>
                            <div class="breath-count-text" id="breathCountText">지금 1번째 호흡 중이에요</div>
                        </div>
                    </div>

                    <!-- 휴식 영역 (숨겨짐) -->
                    <div class="session-rest" id="sessionRest" style="display: none;">
                        <div class="rest-message" id="restMessage">첫 번째 세트를 끝냈어요. 잠깐 숨을 고를까요?</div>
                        <div class="rest-timer" id="restTimer">02:00</div>
                        <div class="rest-quiz" id="restQuiz">
                            <p>💡 호흡 꿀팁: 코로 숨을 들이마시고 입으로 내쉬면 더 효과적이에요!</p>
                        </div>
                        <div class="rest-actions">
                            <button class="start-next-set-btn" id="startNextSetBtn">지금 다음 세트 시작하기</button>
                            <button class="end-session-btn" id="endSessionBtn">세션 종료</button>
                        </div>
                    </div>

                    <!-- 완료 영역 (숨겨짐) -->
                    <div class="session-complete" id="sessionComplete" style="display: none;">
                        <div class="complete-message">오늘 세션 완료! 정말 잘했어요.</div>
                        <button class="complete-continue-btn" id="completeContinueBtn">계속하기</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
    }

    /**
     * 이벤트 리스너 초기화
     */
    initEventListeners() {
        // 닫기 버튼
        const closeBtn = document.getElementById('sessionCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.abort());
        }

        // 다음 세트 시작 버튼
        const nextSetBtn = document.getElementById('startNextSetBtn');
        if (nextSetBtn) {
            nextSetBtn.addEventListener('click', () => this.startNextSetNow());
        }

        // 세션 종료 버튼
        const endBtn = document.getElementById('endSessionBtn');
        if (endBtn) {
            endBtn.addEventListener('click', () => this.abort());
        }

        // 완료 후 계속하기 버튼
        const continueBtn = document.getElementById('completeContinueBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.hide());
        }
    }

    /**
     * 화면 표시 상태 업데이트
     */
    updateVisibility() {
        const container = document.getElementById('suumTrainingSession');
        if (container) {
            container.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    /**
     * 화면 업데이트
     */
    updateDisplay() {
        if (this.isResting) {
            this.showRestScreen();
        } else {
            this.showBreathingScreen();
        }
    }

    /**
     * 호흡 화면 표시
     */
    showBreathingScreen() {
        const mainEl = document.getElementById('sessionMain');
        const restEl = document.getElementById('sessionRest');
        const completeEl = document.getElementById('sessionComplete');
        
        if (mainEl) mainEl.style.display = 'block';
        if (restEl) restEl.style.display = 'none';
        if (completeEl) completeEl.style.display = 'none';

        // 진행 정보 업데이트
        const setInfoEl = document.getElementById('sessionSetInfo');
        const repInfoEl = document.getElementById('sessionRepInfo');
        if (setInfoEl) setInfoEl.textContent = `${this.currentSet} / ${SESSION_CONSTANTS.TOTAL_SETS} 세트`;
        if (repInfoEl) repInfoEl.textContent = `${this.currentRep} / ${SESSION_CONSTANTS.REPS_PER_SET} 회`;

        // 호흡 단계 텍스트 업데이트
        const phaseTextEl = document.getElementById('breathPhaseText');
        const countTextEl = document.getElementById('breathCountText');
        
        if (phaseTextEl) {
            switch (this.currentPhase) {
                case BREATH_PHASES.INHALE:
                    phaseTextEl.textContent = UX_MESSAGES.INHALE;
                    break;
                case BREATH_PHASES.HOLD:
                    phaseTextEl.textContent = '';
                    break;
                case BREATH_PHASES.EXHALE:
                    phaseTextEl.textContent = UX_MESSAGES.EXHALE;
                    break;
            }
        }
        
        if (countTextEl && this.currentPhase !== BREATH_PHASES.HOLD) {
            countTextEl.textContent = UX_MESSAGES.BREATH_COUNT(this.currentRep);
        }
    }

    /**
     * 휴식 화면 표시
     */
    showRestScreen() {
        const mainEl = document.getElementById('sessionMain');
        const restEl = document.getElementById('sessionRest');
        const completeEl = document.getElementById('sessionComplete');
        
        if (mainEl) mainEl.style.display = 'none';
        if (restEl) restEl.style.display = 'block';
        if (completeEl) completeEl.style.display = 'none';

        // 휴식 메시지 업데이트
        const messageEl = document.getElementById('restMessage');
        if (messageEl) {
            messageEl.textContent = UX_MESSAGES.SET_COMPLETE(this.currentSet - 1);
        }
    }

    /**
     * 휴식 타이머 표시 업데이트
     */
    updateRestDisplay(remainingMs) {
        const timerEl = document.getElementById('restTimer');
        if (timerEl) {
            const minutes = Math.floor(remainingMs / 60000);
            const seconds = Math.floor((remainingMs % 60000) / 1000);
            timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * 완료 메시지 표시
     */
    showCompletionMessage() {
        const mainEl = document.getElementById('sessionMain');
        const restEl = document.getElementById('sessionRest');
        const completeEl = document.getElementById('sessionComplete');
        
        if (mainEl) mainEl.style.display = 'none';
        if (restEl) restEl.style.display = 'none';
        if (completeEl) completeEl.style.display = 'block';
    }

    /**
     * 확인 다이얼로그 표시
     */
    showConfirmDialog(message, onConfirm) {
        if (confirm(message)) {
            onConfirm();
        }
    }
}

// 전역 인스턴스 생성
const suumTrainingSession = new SuumTrainingSession();

// 전역으로 노출
window.suumTrainingSession = suumTrainingSession;

// 개발용 테스트 함수
window.testSession = () => {
    console.log('🧪 세션 테스트 시작');
    suumTrainingSession.init(
        { inhaleResistance: 3, exhaleResistance: 4 },
        (data) => {
            console.log('✅ 테스트 세션 완료!', data);
            alert('세션 완료!');
        },
        (data) => {
            console.log('❌ 테스트 세션 중단', data);
            alert('세션 중단됨');
        },
        (progress) => {
            console.log('📊 진행 상황:', progress);
        }
    );
    suumTrainingSession.start();
};
