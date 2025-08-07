/**
 * EffortLevelSurvey 컴포넌트
 * 운동 세션 종료 후 사용자에게 세션의 난이도를 평가받는 UI 모달 컴포넌트
 */

// 설문 선택지 정의 (설계 명세 준수)
const EFFORT_LEVELS = {
    TOO_EASY: {
        value: "too_easy",
        label: "너무 쉬웠어요",
        emoji: "😌"
    },
    JUST_RIGHT: {
        value: "just_right", 
        label: "딱 알맞았어요",
        emoji: "💪"
    },
    TOO_HARD: {
        value: "too_hard",
        label: "너무 힘들었어요", 
        emoji: "😮‍💨"
    }
};

// UX 텍스트 (설계 명세 준수)
const SURVEY_MESSAGES = {
    TITLE: "오늘 운동 어땠나요?",
    SUBTITLE: "느낀 정도를 선택하면 AI가 다음 저항값을 조절할 때 참고해요",
    CONFIRM_BUTTON: "확인"
};

class EffortLevelSurvey {
    constructor() {
        this.isVisible = false;
        this.isActive = false;
        
        // 세션 정보
        this.sessionId = null;
        this.wasAborted = false;
        
        // 선택 상태
        this.selectedEffortLevel = null;
        this.isConfirmed = false;
        
        // 콜백 함수
        this.onResultCallback = null;
    }

    /**
     * 설문 컴포넌트 초기화
     * @param {string} sessionId - 세션 ID
     * @param {boolean} wasAborted - 세션이 중단되었는지 여부
     * @param {function} onResult - 결과 전달 콜백
     */
    init(sessionId, wasAborted, onResult) {
        this.sessionId = sessionId;
        this.wasAborted = wasAborted;
        this.onResultCallback = onResult;
        
        this.render();
        this.initEventListeners();
        
        console.log('✅ EffortLevelSurvey 초기화 완료', {
            sessionId: this.sessionId,
            wasAborted: this.wasAborted
        });
    }

    /**
     * 설문 모달 표시
     */
    show() {
        this.isVisible = true;
        this.isActive = true;
        this.resetSurveyState();
        this.updateVisibility();
        this.focusModal();
        
        console.log('📊 EffortLevelSurvey 표시');
    }

    /**
     * 설문 모달 숨김
     */
    hide() {
        this.isVisible = false;
        this.isActive = false;
        this.updateVisibility();
        
        console.log('🔒 EffortLevelSurvey 숨김');
    }

    /**
     * 설문 상태 초기화
     */
    resetSurveyState() {
        this.selectedEffortLevel = null;
        this.isConfirmed = false;
        this.updateDisplay();
    }

    /**
     * 난이도 선택 처리
     * @param {string} effortLevel - 선택된 난이도 값
     */
    selectEffortLevel(effortLevel) {
        if (!this.isActive || this.isConfirmed) return;
        
        this.selectedEffortLevel = effortLevel;
        this.updateDisplay();
        
        console.log('🎯 난이도 선택:', effortLevel);
    }

    /**
     * 확인 버튼 클릭 처리
     */
    confirmSelection() {
        if (!this.selectedEffortLevel || this.isConfirmed) return;
        
        this.isConfirmed = true;
        
        // 결과 데이터 구조 (설계 명세 준수)
        const result = {
            sessionId: this.sessionId,
            effortLevel: this.selectedEffortLevel,
            ...(this.wasAborted ? { aborted: true } : { completed: true })
        };
        
        console.log('✅ 설문 완료:', result);
        
        // 콜백 호출
        if (this.onResultCallback) {
            this.onResultCallback(result);
        }
        
        // 모달 숨김
        this.hide();
    }

    /**
     * ESC 키로 모달 닫기
     */
    handleEscape() {
        if (this.isVisible) {
            console.log('⎋ ESC 키로 설문 취소');
            this.hide();
        }
    }

    /**
     * 컴포넌트 렌더링
     */
    render() {
        // 기존 컨테이너 제거
        const existingContainer = document.getElementById('effortLevelSurvey');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.id = 'effortLevelSurvey';
        container.className = 'effort-level-survey';
        container.style.display = 'none';
        container.setAttribute('role', 'dialog');
        container.setAttribute('aria-modal', 'true');
        container.setAttribute('aria-labelledby', 'surveyTitle');

        container.innerHTML = `
            <div class="survey-overlay" role="presentation">
                <div class="survey-modal" tabindex="-1">
                    <!-- 헤더 영역 -->
                    <div class="survey-header">
                        <h2 class="survey-title" id="surveyTitle">${SURVEY_MESSAGES.TITLE}</h2>
                        <p class="survey-subtitle">${SURVEY_MESSAGES.SUBTITLE}</p>
                    </div>

                    <!-- 선택지 영역 -->
                    <div class="survey-options" role="radiogroup" aria-labelledby="surveyTitle">
                        <button 
                            class="effort-option-btn" 
                            id="effortTooEasy"
                            role="radio"
                            aria-checked="false"
                            data-effort-level="${EFFORT_LEVELS.TOO_EASY.value}"
                        >
                            <span class="effort-emoji">${EFFORT_LEVELS.TOO_EASY.emoji}</span>
                            <span class="effort-label">${EFFORT_LEVELS.TOO_EASY.label}</span>
                        </button>

                        <button 
                            class="effort-option-btn" 
                            id="effortJustRight"
                            role="radio"
                            aria-checked="false"
                            data-effort-level="${EFFORT_LEVELS.JUST_RIGHT.value}"
                        >
                            <span class="effort-emoji">${EFFORT_LEVELS.JUST_RIGHT.emoji}</span>
                            <span class="effort-label">${EFFORT_LEVELS.JUST_RIGHT.label}</span>
                        </button>

                        <button 
                            class="effort-option-btn" 
                            id="effortTooHard"
                            role="radio"
                            aria-checked="false"
                            data-effort-level="${EFFORT_LEVELS.TOO_HARD.value}"
                        >
                            <span class="effort-emoji">${EFFORT_LEVELS.TOO_HARD.emoji}</span>
                            <span class="effort-label">${EFFORT_LEVELS.TOO_HARD.label}</span>
                        </button>
                    </div>

                    <!-- 확인 버튼 -->
                    <div class="survey-actions">
                        <button 
                            class="survey-confirm-btn" 
                            id="surveyConfirmBtn"
                            disabled
                            aria-label="선택 완료 후 확인"
                        >
                            ${SURVEY_MESSAGES.CONFIRM_BUTTON}
                        </button>
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
        // 난이도 선택 버튼들
        const effortButtons = document.querySelectorAll('.effort-option-btn');
        effortButtons.forEach(button => {
            button.addEventListener('click', () => {
                const effortLevel = button.getAttribute('data-effort-level');
                this.selectEffortLevel(effortLevel);
            });
        });

        // 확인 버튼
        const confirmBtn = document.getElementById('surveyConfirmBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmSelection();
            });
        }

        // ESC 키 처리
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.handleEscape();
            }
        });

        // 오버레이 클릭으로 닫기 방지 (의도적 선택 필요)
        const overlay = document.querySelector('.survey-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                // 모달 내부 클릭은 무시
                if (e.target === overlay) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }

        // 키보드 네비게이션 지원
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            } else if (e.key === 'Enter' || e.key === ' ') {
                this.handleEnterKey(e);
            }
        });
    }

    /**
     * 키보드 포커스 관리
     */
    focusModal() {
        const modal = document.querySelector('.survey-modal');
        if (modal) {
            modal.focus();
        }
    }

    /**
     * Tab 키 네비게이션 처리
     */
    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll(
            '.effort-option-btn:not([disabled]), .survey-confirm-btn:not([disabled])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Enter/Space 키 처리
     */
    handleEnterKey(e) {
        if (e.target.classList.contains('effort-option-btn')) {
            e.preventDefault();
            const effortLevel = e.target.getAttribute('data-effort-level');
            this.selectEffortLevel(effortLevel);
        } else if (e.target.classList.contains('survey-confirm-btn') && !e.target.disabled) {
            e.preventDefault();
            this.confirmSelection();
        }
    }

    /**
     * 화면 표시 상태 업데이트
     */
    updateVisibility() {
        const container = document.getElementById('effortLevelSurvey');
        if (container) {
            container.style.display = this.isVisible ? 'block' : 'none';
            
            // 접근성을 위한 body 스크롤 제어
            if (this.isVisible) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    /**
     * 화면 업데이트
     */
    updateDisplay() {
        this.updateEffortButtons();
        this.updateConfirmButton();
    }

    /**
     * 난이도 버튼 상태 업데이트
     */
    updateEffortButtons() {
        const effortButtons = document.querySelectorAll('.effort-option-btn');
        
        effortButtons.forEach(button => {
            const effortLevel = button.getAttribute('data-effort-level');
            const isSelected = effortLevel === this.selectedEffortLevel;
            
            // 버튼 상태 업데이트
            if (isSelected) {
                button.classList.add('selected');
                button.setAttribute('aria-checked', 'true');
            } else {
                button.classList.remove('selected');
                button.setAttribute('aria-checked', 'false');
            }
            
            // 확인 후에는 비활성화
            if (this.isConfirmed) {
                button.disabled = true;
                if (!isSelected) {
                    button.classList.add('disabled');
                }
            } else {
                button.disabled = false;
                button.classList.remove('disabled');
            }
        });
    }

    /**
     * 확인 버튼 상태 업데이트
     */
    updateConfirmButton() {
        const confirmBtn = document.getElementById('surveyConfirmBtn');
        if (confirmBtn) {
            // 선택지가 선택되었을 때만 활성화
            const hasSelection = this.selectedEffortLevel !== null;
            confirmBtn.disabled = !hasSelection || this.isConfirmed;
            
            if (hasSelection && !this.isConfirmed) {
                confirmBtn.classList.add('active');
            } else {
                confirmBtn.classList.remove('active');
            }
        }
    }

    /**
     * 현재 선택 상태 반환
     */
    getCurrentSelection() {
        return {
            sessionId: this.sessionId,
            selectedEffortLevel: this.selectedEffortLevel,
            isConfirmed: this.isConfirmed,
            wasAborted: this.wasAborted
        };
    }

    /**
     * 설문 활성 상태 확인
     */
    isSurveyActive() {
        return this.isActive;
    }
}

// 전역 인스턴스 생성
const effortLevelSurvey = new EffortLevelSurvey();

// 전역으로 노출
window.effortLevelSurvey = effortLevelSurvey;

// 개발용 테스트 함수
window.testEffortSurvey = () => {
    console.log('🧪 Effort Level Survey 테스트 시작');
    effortLevelSurvey.init(
        'test-session-123',
        false, // 정상 완료
        (result) => {
            console.log('✅ 설문 결과:', result);
            alert(`설문 완료!\n${JSON.stringify(result, null, 2)}`);
        }
    );
    effortLevelSurvey.show();
};

window.testEffortSurveyAborted = () => {
    console.log('🧪 Effort Level Survey 테스트 시작 (중단된 세션)');
    effortLevelSurvey.init(
        'test-session-456',
        true, // 중단된 세션
        (result) => {
            console.log('✅ 설문 결과 (중단):', result);
            alert(`설문 완료 (중단된 세션)!\n${JSON.stringify(result, null, 2)}`);
        }
    );
    effortLevelSurvey.show();
};
