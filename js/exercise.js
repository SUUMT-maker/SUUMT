// 🏃‍♂️ 운동 관련 함수들

function startExercise() {
    resetExercise();
    showScreen('exerciseScreen');
    
    gtag('event', 'exercise_start', {
        inhale_resistance: resistanceSettings.inhale,
        exhale_resistance: resistanceSettings.exhale
    });
    
    startCountdown();
}

function startCountdown() {
    let count = 3;
    const countdownEl = document.getElementById('countdown');
    
    const countdownInterval = setInterval(() => {
        countdownEl.textContent = count;
        count--;
        
        if (count < 0) {
            clearInterval(countdownInterval);
            startBreathing();
        }
    }, 1000);
}

function startBreathing() {
    document.getElementById('countdownSection').style.display = 'none';
    document.getElementById('breathingSection').style.display = 'block';
    
    const circle = document.getElementById('breathingCircle');
    circle.className = 'breathing-circle exhale';
    
    initializeProgressIndicators();
    
    exerciseStartTime = getCurrentUserTime(); // 사용자 시간대 적용
    
    setTimeout(() => {
        breathingCycle();
    }, 500);
}

function breathingCycle() {
    if (isPaused || isAborted) return;

    const circle = document.getElementById('breathingCircle');
    const circleText = document.getElementById('circleText');

    updateProgressIndicators();

    if (breathingPhase === 'inhale') {
        circleText.textContent = '깊게 들이마셔요';
        circle.className = 'breathing-circle inhale';
        
        breathingTimer = setTimeout(() => {
            breathingPhase = 'hold';
            breathingCycle();
        }, 3000);

    } else if (breathingPhase === 'hold') {
        circleText.textContent = '잠시 멈추세요';
        circle.className = 'breathing-circle hold';
        
        breathingTimer = setTimeout(() => {
            breathingPhase = 'exhale';
            breathingCycle();
        }, 1000);

    } else if (breathingPhase === 'exhale') {
        circleText.textContent = '끝까지 내쉬어요';
        circle.className = 'breathing-circle exhale';
        
        breathingTimer = setTimeout(() => {
            breathingPhase = 'exhale-hold';
            breathingCycle();
        }, 3000);

    } else if (breathingPhase === 'exhale-hold') {
        circleText.textContent = '잠시 멈추세요';
        circle.className = 'breathing-circle exhale-hold';
        
        breathingTimer = setTimeout(() => {
            currentBreath++;
            breathingPhase = 'inhale';
            
            if (currentBreath > 10) {
                currentSet++;
                currentBreath = 1;
                
                if (currentSet > 2) {
                    completeExercise();
                } else {
                    startRest();
                }
            } else {
                breathingCycle();
            }
        }, 1000);
    }
}

function startRest() {
    document.getElementById('breathingSection').style.display = 'none';
    
    // 🔧 기존 타이머 정리
    stopGlobalRestTimer();
    clearInterval(restTimer);
    
    // 🎮 퀴즈 시스템이 활성화되어 있으면 퀴즈 제안부터 시작
    if (QUIZ_CONFIG.QUIZ_ENABLED) {
        showRestIntro();
    } else {
        showNormalRest();
    }
}

function skipRest() {
    console.log('🔧 skipRest 함수 시작');
    
    stopGlobalRestTimer(); // 🔧 전역 타이머 정리
    clearTimeout(quizOfferTimer); // 퀴즈 제안 타이머도 정리
    
    incrementSkippedRestCount(); // 🎮 배지 조건용 카운트
    
    console.log('⏰ 휴식 타이머 건너뛰기 완료');
    
    startNextSet();
}

function startNextSet() {
    console.log('🔧 startNextSet 함수 시작');
    
    // 🔧 모든 휴식/퀴즈 관련 화면 숨기기 (원본과 동일)
    document.getElementById('restSection').style.display = 'none';
    document.getElementById('quizOfferSection').style.display = 'none';
    document.getElementById('quizProgressSection').style.display = 'none';
    document.getElementById('quizRewardSection').style.display = 'none';
    
    // 🔧 모든 타이머 정리
    stopGlobalRestTimer();
    clearTimeout(quizOfferTimer);
    clearInterval(restTimer);
    
    console.log('⏰ 모든 타이머 정리 완료');
    
    // 🚀 호흡 화면 표시
    document.getElementById('breathingSection').style.display = 'block';
    
    const circle = document.getElementById('breathingCircle');
    circle.className = 'breathing-circle exhale';
    
    initializeProgressIndicators();
    
    setTimeout(() => {
        breathingCycle();
    }, 500);
}

function pauseExercise() {
    isPaused = !isPaused;
    const button = event.target;
    
    if (isPaused) {
        clearTimeout(breathingTimer);
        button.textContent = '계속하기';
        document.getElementById('circleText').textContent = '일시정지';
    } else {
        button.textContent = '일시정지';
        breathingCycle();
    }
}

async function completeExercise() {
    clearTimeout(breathingTimer);
    clearInterval(restTimer);
    
    const exerciseTime = Math.floor((getCurrentUserTime() - exerciseStartTime) / 1000);
    const minutes = Math.floor(exerciseTime / 60);
    const seconds = exerciseTime % 60;
    
    // 🔧 완료 세트 계산 수정: 10회 호흡을 완료한 세트만 카운트
    let actualCompletedSets = 0;
    if (!isAborted) {
        actualCompletedSets = 2; // 완전히 끝까지 한 경우
    } else {
        // 중단한 경우: 완료된 세트 수 정확히 계산
        if (currentSet === 1) {
            // 첫 세트 도중에 중단: 0세트 완료
            actualCompletedSets = 0;
        } else if (currentSet === 2) {
            // 첫 세트 완료 후 중단 (휴식시간 또는 2세트 중): 1세트 완료
            actualCompletedSets = 1;
        } else {
            // currentSet > 2인 경우는 없지만 안전장치
            actualCompletedSets = 2;
        }
    }
    
    // 🔧 완료 호흡 횟수 계산 개선
    let actualCompletedBreaths = 0;
    if (!isAborted) {
        actualCompletedBreaths = 20;
    } else {
        if (currentSet === 1) {
            // 첫 세트 도중: 현재 호흡 - 1
            actualCompletedBreaths = Math.max(0, currentBreath - 1);
        } else if (currentSet === 2) {
            // 두 번째 세트: 첫 세트 10회 + 현재 호흡 - 1
            actualCompletedBreaths = 10 + Math.max(0, currentBreath - 1);
        }
    }
    
    window.exerciseData = {
        exerciseTime: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        completedSets: actualCompletedSets,
        completedBreaths: actualCompletedBreaths,
        isAborted: isAborted,
        resistanceSettings: { ...resistanceSettings },
        userFeedback: userFeedback
    };

    setTimeout(() => {
        showFeedbackScreen();
    }, 1000);
}

function showStopModal() {
    document.getElementById('confirmModal').classList.add('show');
}

function hideModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

function confirmStop() {
    hideModal();
    isAborted = true;
    clearTimeout(breathingTimer);
    
    // 🔧 모든 타이머 정리
    stopGlobalRestTimer();
    clearInterval(restTimer);
    
    gtag('event', 'exercise_aborted', {
        completed_sets: Math.max(0, currentSet - 1),
        completed_breaths: Math.max(0, (currentSet - 1) * 10 + (currentBreath - 1))
    });
    
    completeExercise();
}

function initializeProgressIndicators() {
    const breathsContainer = document.getElementById('breathsIndicators');
    breathsContainer.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        const breathDot = document.createElement('div');
        breathDot.className = 'breath-indicator';
        breathDot.setAttribute('data-breath', i + 1);
        breathsContainer.appendChild(breathDot);
    }
    
    updateProgressIndicators();
}

function updateProgressIndicators() {
    const setIndicators = document.querySelectorAll('.set-indicator');
    setIndicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'current');
        if (index < currentSet - 1) {
            indicator.classList.add('active');
        } else if (index === currentSet - 1) {
            indicator.classList.add('current');
        }
    });
    
    const breathIndicators = document.querySelectorAll('.breath-indicator');
    breathIndicators.forEach((indicator, index) => {
        indicator.classList.remove('completed', 'current');
        if (index < currentBreath - 1) {
            indicator.classList.add('completed');
        } else if (index === currentBreath - 1) {
            indicator.classList.add('current');
        }
    });
    
    document.getElementById('setNumbers').textContent = `${currentSet} / 2 세트`;
    document.getElementById('breathNumbers').textContent = `${currentBreath} / 10 회`;
}

function resetExercise() {
    console.log('🔧 resetExercise 함수 시작');
    
    currentSet = 1;
    currentBreath = 1;
    isPaused = false;
    isAborted = false;
    breathingPhase = 'inhale';
    userFeedback = null;
    clearTimeout(breathingTimer);
    clearInterval(restTimer);
    
    // 🎮 퀴즈 시스템 초기화
    currentQuizQuestion = 0;
    quizCorrectAnswers = 0;
    quizStartTime = null;
    selectedQuestions = [];
    clearTimeout(quizOfferTimer);
    
    // 🔧 전역 휴식 타이머 정리
    stopGlobalRestTimer();
    
    // 🔥 새로운 기능: 리뷰 캐러셀 정리
    if (reviewCarouselInterval) {
        clearInterval(reviewCarouselInterval);
    }
    
    // 모든 화면 숨기기 (원본과 동일)
    document.getElementById('countdownSection').style.display = 'block';
    document.getElementById('breathingSection').style.display = 'none';
    document.getElementById('restSection').style.display = 'none';
    document.getElementById('quizOfferSection').style.display = 'none';
    document.getElementById('quizProgressSection').style.display = 'none';
    document.getElementById('quizRewardSection').style.display = 'none';
    
    console.log('🔧 운동 상태 초기화 완료');
}

// 🔧 전역 휴식 타이머 관련 함수들
function stopGlobalRestTimer() {
    if (globalRestTimer) {
        clearInterval(globalRestTimer);
        globalRestTimer = null;
    }
}

function startGlobalRestTimer() {
    console.log('🔧 startGlobalRestTimer 함수 시작');
    stopGlobalRestTimer(); // 기존 타이머 정리
    
    console.log('⏰ 휴식 타이머 시작 - 남은 시간:', globalRestTime, '초');
    
    globalRestTimer = setInterval(() => {
        globalRestTime--;
        updateAllCountdowns();
        
        console.log('⏰ 휴식 타이머 틱:', globalRestTime, '초');
        
        if (globalRestTime <= 0) {
            console.log('⏰ 휴식 타이머 완료 - 다음 세트 시작');
            stopGlobalRestTimer();
            startNextSet();
        }
    }, 1000);
}

function updateAllCountdowns() {
    // 메인 화면의 카운트다운 업데이트
    const mainCountdown = document.getElementById('mainRestCountdown');
    if (mainCountdown) {
        const minutes = Math.floor(globalRestTime / 60);
        const seconds = globalRestTime % 60;
        mainCountdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 운동 화면의 카운트다운 업데이트
    const exerciseCountdown = document.getElementById('exerciseRestCountdown');
    if (exerciseCountdown) {
        const minutes = Math.floor(globalRestTime / 60);
        const seconds = globalRestTime % 60;
        exerciseCountdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 휴식 화면의 메인 카운트다운 업데이트
    const restCountdown = document.getElementById('restCountdown');
    if (restCountdown) {
        const minutes = Math.floor(globalRestTime / 60);
        const seconds = globalRestTime % 60;
        restCountdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 퀴즈 제안 화면의 카운트다운 업데이트
    const quizOfferCountdown = document.getElementById('quizOfferCountdown');
    if (quizOfferCountdown) {
        const minutes = Math.floor(globalRestTime / 60);
        const seconds = globalRestTime % 60;
        quizOfferCountdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 퀴즈 진행 화면의 카운트다운 업데이트
    const quizCountdown = document.getElementById('quizCountdown');
    if (quizCountdown) {
        const minutes = Math.floor(globalRestTime / 60);
        const seconds = globalRestTime % 60;
        quizCountdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 퀴즈 보상 화면의 카운트다운 업데이트
    const quizRewardCountdown = document.getElementById('quizRewardCountdown');
    if (quizRewardCountdown) {
        const minutes = Math.floor(globalRestTime / 60);
        const seconds = globalRestTime % 60;
        quizRewardCountdown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function showRestIntro() {
    console.log('🔍 showRestIntro 함수 시작');
    
    // 호흡 화면 숨기기
    document.getElementById('breathingSection').style.display = 'none';
    
    // 휴식 화면 표시
    document.getElementById('restSection').style.display = 'block';
    
    // 휴식 제어 버튼 숨기기 (원본과 동일)
    const restControlButtons = document.getElementById('restControlButtons');
    if (restControlButtons) {
        restControlButtons.style.display = 'none';
    }
    
    // 휴식 진행도 텍스트 설정 (원본과 동일)
    const restProgressEl = document.getElementById('restProgressText');
    if (restProgressEl) {
        restProgressEl.textContent = `${currentSet - 1}세트 완료`;
    }
    
    // 🔧 전역 타이머 시작 (원본과 동일)
    globalRestTime = 120; // 2분
    startGlobalRestTimer();
    
    // GA 이벤트: 휴식 시작 (원본과 동일)
    gtag('event', 'rest_started', {
        set_number: currentSet - 1,
        quiz_enabled: QUIZ_CONFIG.QUIZ_ENABLED
    });
    
    console.log('⏰ 5초 후 퀴즈/휴식 선택 카드 표시 예정');
    
    // 5초 후 퀴즈 제안 화면으로 전환 (원본과 동일)
    quizOfferTimer = setTimeout(() => {
        if (!isAborted) {
            console.log('⏰ 5초 경과 - 퀴즈/휴식 선택 카드 표시 시작');
            showQuizOffer();
        }
    }, QUIZ_CONFIG.OFFER_DELAY);
}

function showNormalRest() {
    console.log('🔍 showNormalRest 함수 시작');
    
    // 호흡 화면 숨기기
    document.getElementById('breathingSection').style.display = 'none';
    
    // 휴식 화면 표시
    document.getElementById('restSection').style.display = 'block';
    
    // 휴식 제어 버튼 표시 (원본과 동일)
    const restControlButtons = document.getElementById('restControlButtons');
    if (restControlButtons) {
        restControlButtons.style.display = 'block';
    }
    
    // 휴식 진행도 텍스트 설정 (원본과 동일)
    const restProgressEl = document.getElementById('restProgressText');
    if (restProgressEl) {
        restProgressEl.textContent = `${currentSet - 1}세트 완료`;
    }
    
    // 개별 타이머 사용 (원본과 동일)
    let restTime = parseInt(document.getElementById('restCountdown').textContent) || 120;
    const restCountdownEl = document.getElementById('restCountdown');
    
    restTimer = setInterval(() => {
        if (isAborted) {
            clearInterval(restTimer);
            return;
        }
        
        restCountdownEl.textContent = restTime;
        restTime--;
        
        if (restTime < 0) {
            clearInterval(restTimer);
            startNextSet();
        }
    }, 1000);
    
    console.log('⏰ 휴식 타이머 시작됨 (개별 타이머)');
}
