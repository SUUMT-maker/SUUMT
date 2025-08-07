/**
 * SuumRestBetweenSets 컴포넌트
 * 세트 간 2분간 휴식을 제공하는 UI
 * 자동 타이머, 호흡 퀴즈 카드, 다음 세트 버튼, 세션 종료 버튼 포함
 */

// 휴식 상수
const REST_CONSTANTS = {
    REST_DURATION: 120000,    // 2분 (ms)
    QUIZ_DELAY: 5000,         // 5초 후 퀴즈 표시 (ms)
    TIMER_INTERVAL: 1000      // 1초 간격 업데이트 (ms)
};

// 퀴즈 데이터 구조 (완전 교체)
const QUIZZES = [
    {
        id: 1,
        question: "보통 사람은 1분에 몇 번 숨을 쉴까요?",
        options: ["8~12회", "15~20회", "30~40회"],
        answer: "8~12회"
    },
    {
        id: 2,
        question: "호흡 운동 시 어떤 자세가 가장 좋을까요?",
        options: ["누워서", "앉아서 허리를 곧게 펴고", "서서 양손을 올리고"],
        answer: "앉아서 허리를 곧게 펴고"
    },
    {
        id: 3,
        question: "복식 호흡은 어디가 움직일 때 올바른가요?",
        options: ["어깨", "가슴", "배"],
        answer: "배"
    },
    {
        id: 4,
        question: "호흡 시 들숨은 어디로 하는 게 좋을까요?",
        options: ["입", "코", "가슴"],
        answer: "코"
    },
    {
        id: 5,
        question: "숨을 참는 시간이 중요한 이유는?",
        options: [
            "산소를 오래 유지하기 위해",
            "운동 효과를 줄이기 위해",
            "지루하지 않게 하기 위해"
        ],
        answer: "산소를 오래 유지하기 위해"
    },
    {
        id: 6,
        question: "호흡 리듬에서 가장 중요한 것은?",
        options: ["속도", "리듬감과 지속성", "숨을 멈추는 시간"],
        answer: "리듬감과 지속성"
    }
];

// UX 메시지
const REST_MESSAGES = {
    FIRST_SET_COMPLETE: "첫 번째 세트를 끝냈어요. 잠깐 숨을 고를까요?",
    SECOND_SET_READY: "두 번째 세트를 위해 준비해주세요!",
    START_NEXT_SET: "지금 다음 세트 시작하기",
    END_SESSION: "세션 종료"
};

class SuumRestBetweenSets {
    constructor() {
        this.isVisible = false;
        this.isActive = false;
        
        // 휴식 상태
        this.remainingTime = REST_CONSTANTS.REST_DURATION;
        this.restStartTime = null;
        this.currentSetNumber = 1;
        
        // 타이머 관련
        this.restTimer = null;
        this.quizTimer = null;
        
        // 퀴즈 상태
        this.quizShown = false;
        this.quizAnswered = false;
        this.currentQuiz = null;
        this.selectedAnswer = null;
        this.isCorrect = null;
        
        // 콜백 함수들
        this.onNextSetCallback = null;
        this.onEndSessionCallback = null;
        this.onProgressCallback = null;
    }

    /**
     * 휴식 컴포넌트 초기화
     * @param {number} setNumber - 완료된 세트 번호 (1 or 2)
     * @param {function} onNextSet - 다음 세트 시작 콜백
     * @param {function} onEndSession - 세션 종료 콜백  
     * @param {function} onProgress - 진행 상황 업데이트 콜백
     */
    init(setNumber, onNextSet, onEndSession, onProgress) {
        this.currentSetNumber = setNumber;
        this.onNextSetCallback = onNextSet;
        this.onEndSessionCallback = onEndSession;
        this.onProgressCallback = onProgress;
        
        this.render();
        this.initEventListeners();
        
        console.log(`✅ SuumRestBetweenSets 초기화 완료 (세트 ${setNumber} 완료 후)`);
    }

    /**
     * 휴식 시작
     */
    start() {
        this.isVisible = true;
        this.isActive = true;
        this.restStartTime = Date.now();
        this.remainingTime = REST_CONSTANTS.REST_DURATION;
        this.resetQuizState();
        
        this.updateVisibility();
        this.updateDisplay();
        this.startTimer();
        this.scheduleQuiz();
        
        console.log('😴 세트 간 휴식 시작');
    }

    /**
     * 휴식 중단 (다음 세트 시작)
     */
    skipRest() {
        console.log('⏭️ 휴식 건너뛰기 - 다음 세트 시작');
        
        this.stop();
        
        if (this.onNextSetCallback) {
            this.onNextSetCallback(this.getRestData());
        }
    }

    /**
     * 세션 종료
     */
    endSession() {
        console.log('🔚 휴식 중 세션 종료');
        
        this.stop();
        
        if (this.onEndSessionCallback) {
            this.onEndSessionCallback(this.getRestData());
        }
    }

    /**
     * 휴식 중단
     */
    stop() {
        this.isActive = false;
        this.clearTimers();
        this.hide();
    }

    /**
     * 컴포넌트 숨김
     */
    hide() {
        this.isVisible = false;
        this.updateVisibility();
        
        console.log('🔒 SuumRestBetweenSets 숨김');
    }

    /**
     * 타이머 시작
     */
    startTimer() {
        this.restTimer = setInterval(() => {
            if (!this.isActive) return;
            
            this.remainingTime -= REST_CONSTANTS.TIMER_INTERVAL;
            this.updateTimerDisplay();
            
            // 진행 상황 업데이트
            if (this.onProgressCallback) {
                this.onProgressCallback(this.getProgress());
            }
            
            // 시간 종료 체크
            if (this.remainingTime <= 0) {
                this.completeRest();
            }
        }, REST_CONSTANTS.TIMER_INTERVAL);
    }

    /**
     * 퀴즈 스케줄링 (5초 후 표시)
     */
    scheduleQuiz() {
        this.quizTimer = setTimeout(() => {
            if (this.isActive) {
                this.showQuiz();
            }
        }, REST_CONSTANTS.QUIZ_DELAY);
    }

    /**
     * 퀴즈 표시
     */
    showQuiz() {
        this.quizShown = true;
        this.currentQuiz = this.getRandomQuiz();
        this.updateQuizDisplay();
        this.initQuizEventListeners();
        
        console.log('💡 호흡 퀴즈 표시:', this.currentQuiz.question);
    }

    /**
     * 랜덤 퀴즈 선택
     */
    getRandomQuiz() {
        const randomIndex = Math.floor(Math.random() * QUIZZES.length);
        return QUIZZES[randomIndex];
    }

    /**
     * 퀴즈 답안 선택 처리
     */
    selectAnswer(selectedOption) {
        if (this.quizAnswered) return; // 이미 답변한 경우 무시
        
        this.selectedAnswer = selectedOption;
        this.isCorrect = selectedOption === this.currentQuiz.answer;
        this.quizAnswered = true;
        
        console.log(`🧠 퀴즈 답변: "${selectedOption}" - ${this.isCorrect ? '정답!' : '오답'}`, {
            question: this.currentQuiz.question,
            correctAnswer: this.currentQuiz.answer,
            userAnswer: selectedOption,
            isCorrect: this.isCorrect
        });
        
        this.updateQuizDisplay();
    }

    /**
     * 퀴즈 이벤트 리스너 초기화
     */
    initQuizEventListeners() {
        // 각 선택지 버튼에 이벤트 리스너 추가
        this.currentQuiz.options.forEach((option, index) => {
            const buttonEl = document.getElementById(`quizOption${index}`);
            if (buttonEl) {
                buttonEl.addEventListener('click', () => {
                    this.selectAnswer(option);
                });
            }
        });
    }

    /**
     * 휴식 완료 (타이머 종료)
     */
    completeRest() {
        console.log('⏰ 휴식 시간 완료 - 자동으로 다음 세트 시작');
        this.skipRest();
    }

    /**
     * 타이머 정리
     */
    clearTimers() {
        if (this.restTimer) {
            clearInterval(this.restTimer);
            this.restTimer = null;
        }
        
        if (this.quizTimer) {
            clearTimeout(this.quizTimer);
            this.quizTimer = null;
        }
    }

    /**
     * 퀴즈 상태 초기화
     */
    resetQuizState() {
        this.quizShown = false;
        this.quizAnswered = false;
        this.currentQuiz = null;
        this.selectedAnswer = null;
        this.isCorrect = null;
    }

    /**
     * 휴식 데이터 반환
     */
    getRestData() {
        const endTime = Date.now();
        const actualRestDuration = endTime - this.restStartTime;
        
        return {
            setNumber: this.currentSetNumber,
            restStartTime: this.restStartTime,
            restDuration: actualRestDuration,
            plannedDuration: REST_CONSTANTS.REST_DURATION,
            quizShown: this.quizShown,
            quizAnswered: this.quizAnswered,
            currentQuiz: this.currentQuiz,
            selectedAnswer: this.selectedAnswer,
            isCorrect: this.isCorrect,
            remainingTime: this.remainingTime,
            isCompleted: this.remainingTime <= 0
        };
    }

    /**
     * 진행률 반환
     */
    getProgress() {
        const elapsed = REST_CONSTANTS.REST_DURATION - this.remainingTime;
        const percentage = (elapsed / REST_CONSTANTS.REST_DURATION) * 100;
        
        return {
            currentSetNumber: this.currentSetNumber,
            remainingTime: this.remainingTime,
            elapsed,
            percentage: Math.min(percentage, 100),
            quizShown: this.quizShown,
            isResting: true
        };
    }

    /**
     * 컴포넌트 렌더링
     */
    render() {
        // 기존 컨테이너 제거
        const existingContainer = document.getElementById('suumRestBetweenSets');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.id = 'suumRestBetweenSets';
        container.className = 'suum-rest-between-sets';
        container.style.display = 'none';

        container.innerHTML = `
            <div class="rest-overlay">
                <div class="rest-content">
                    <!-- 헤더 영역 -->
                    <div class="rest-header">
                        <div class="rest-title" id="restTitle">첫 번째 세트를 끝냈어요. 잠깐 숨을 고를까요?</div>
                    </div>

                    <!-- 타이머 영역 -->
                    <div class="rest-timer-section">
                        <div class="rest-timer" id="restTimer">02:00</div>
                        <div class="rest-timer-label">남은 휴식 시간</div>
                    </div>

                    <!-- 퀴즈 영역 (초기에는 숨겨짐) -->
                    <div class="rest-quiz-section" id="restQuizSection" style="display: none;">
                        <div class="quiz-card">
                            <div class="quiz-question" id="quizQuestion">
                                퀴즈가 곧 표시됩니다...
                            </div>
                            <div class="quiz-options" id="quizOptions">
                                <!-- 선택지 버튼들이 동적으로 생성됩니다 -->
                            </div>
                        </div>
                    </div>

                    <!-- 액션 버튼들 -->
                    <div class="rest-actions">
                        <button class="next-set-btn" id="nextSetBtn">
                            지금 다음 세트 시작하기
                        </button>
                        <button class="end-session-btn" id="endSessionBtn">
                            세션 종료
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
        // 다음 세트 시작 버튼
        const nextSetBtn = document.getElementById('nextSetBtn');
        if (nextSetBtn) {
            nextSetBtn.addEventListener('click', () => {
                this.skipRest();
            });
        }

        // 세션 종료 버튼
        const endSessionBtn = document.getElementById('endSessionBtn');
        if (endSessionBtn) {
            endSessionBtn.addEventListener('click', () => {
                this.endSession();
            });
        }

        // ESC 키로 다음 세트 시작
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.skipRest();
            }
        });

        // 스페이스바로 다음 세트 시작
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && this.isVisible) {
                e.preventDefault();
                this.skipRest();
            }
        });
    }

    /**
     * 화면 표시 상태 업데이트
     */
    updateVisibility() {
        const container = document.getElementById('suumRestBetweenSets');
        if (container) {
            container.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    /**
     * 화면 업데이트
     */
    updateDisplay() {
        this.updateTitleDisplay();
        this.updateTimerDisplay();
        this.updateQuizDisplay();
    }

    /**
     * 제목 업데이트
     */
    updateTitleDisplay() {
        const titleEl = document.getElementById('restTitle');
        if (titleEl) {
            titleEl.textContent = this.currentSetNumber === 1 ? 
                REST_MESSAGES.FIRST_SET_COMPLETE : 
                REST_MESSAGES.SECOND_SET_READY;
        }
    }

    /**
     * 타이머 표시 업데이트
     */
    updateTimerDisplay() {
        const timerEl = document.getElementById('restTimer');
        if (timerEl) {
            const minutes = Math.floor(this.remainingTime / 60000);
            const seconds = Math.floor((this.remainingTime % 60000) / 1000);
            timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * 퀴즈 표시 업데이트
     */
    updateQuizDisplay() {
        const quizSection = document.getElementById('restQuizSection');
        const quizQuestion = document.getElementById('quizQuestion');
        const quizOptions = document.getElementById('quizOptions');
        
        if (quizSection) {
            quizSection.style.display = this.quizShown ? 'block' : 'none';
        }
        
        if (this.quizShown && this.currentQuiz) {
            // 질문 표시
            if (quizQuestion) {
                quizQuestion.textContent = this.currentQuiz.question;
            }
            
            // 선택지 버튼들 생성
            if (quizOptions) {
                quizOptions.innerHTML = '';
                
                this.currentQuiz.options.forEach((option, index) => {
                    const button = document.createElement('button');
                    button.id = `quizOption${index}`;
                    button.className = 'quiz-option-btn';
                    button.textContent = option;
                    
                    // 답변 후 상태 표시
                    if (this.quizAnswered) {
                        button.disabled = true;
                        
                        if (option === this.currentQuiz.answer) {
                            button.classList.add('correct-answer');
                        } else if (option === this.selectedAnswer) {
                            button.classList.add('wrong-answer');
                        } else {
                            button.classList.add('disabled-option');
                        }
                    }
                    
                    quizOptions.appendChild(button);
                });
            }
        }
    }

    /**
     * 현재 휴식 상태 확인
     */
    isRestActive() {
        return this.isActive;
    }

    /**
     * 현재 퀴즈 정보 반환
     */
    getCurrentQuiz() {
        return this.currentQuiz;
    }
}

// 전역 인스턴스 생성
const suumRestBetweenSets = new SuumRestBetweenSets();

// 전역으로 노출
window.suumRestBetweenSets = suumRestBetweenSets;

// 개발용 테스트 함수
window.testRest = () => {
    console.log('🧪 휴식 컴포넌트 테스트 시작');
    suumRestBetweenSets.init(
        1, // 첫 번째 세트 완료 후
        (restData) => {
            console.log('✅ 다음 세트 시작!', restData);
            alert('다음 세트 시작!');
        },
        (restData) => {
            console.log('❌ 세션 종료', restData);
            alert('세션 종료됨');
        },
        (progress) => {
            console.log('📊 휴식 진행 상황:', progress);
        }
    );
    suumRestBetweenSets.start();
};
