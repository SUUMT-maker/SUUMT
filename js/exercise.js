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
    const exerciseScreen = document.getElementById('exerciseScreen');
    
    circle.className = 'breathing-circle exhale';
    exerciseScreen.className = 'screen exhale';
    
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
    const exerciseScreen = document.getElementById('exerciseScreen');

    updateProgressIndicators();

    if (breathingPhase === 'inhale') {
        circleText.textContent = '깊게 들이마셔요';
        circle.className = 'breathing-circle inhale';
        exerciseScreen.className = 'screen inhale';
        
        breathingTimer = setTimeout(() => {
            breathingPhase = 'hold';
            breathingCycle();
        }, 3000);

    } else if (breathingPhase === 'hold') {
        circleText.textContent = '잠시 멈추세요';
        circle.className = 'breathing-circle hold';
        exerciseScreen.className = 'screen hold';
        
        breathingTimer = setTimeout(() => {
            breathingPhase = 'exhale';
            breathingCycle();
        }, 1000);

    } else if (breathingPhase === 'exhale') {
        circleText.textContent = '끝까지 내쉬어요';
        circle.className = 'breathing-circle exhale';
        exerciseScreen.className = 'screen exhale';
        
        breathingTimer = setTimeout(() => {
            breathingPhase = 'exhale-hold';
            breathingCycle();
        }, 3000);

    } else if (breathingPhase === 'exhale-hold') {
        circleText.textContent = '잠시 멈추세요';
        circle.className = 'breathing-circle exhale-hold';
        exerciseScreen.className = 'screen exhale-hold';
        
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
    stopGlobalRestTimer(); // 🔧 전역 타이머 정리
    incrementSkippedRestCount(); // 🎮 배지 조건용 카운트
    startNextSet();
}

function startNextSet() {
    // 🔧 모든 휴식/퀴즈 관련 화면 숨기기
    document.getElementById('restSection').style.display = 'none';
    document.getElementById('quizOfferSection').style.display = 'none';
    document.getElementById('quizProgressSection').style.display = 'none';
    document.getElementById('quizRewardSection').style.display = 'none';
    
    // 🔧 모든 타이머 정리
    stopGlobalRestTimer();
    clearTimeout(quizOfferTimer);
    
    // 🚀 호흡 화면 표시
    document.getElementById('breathingSection').style.display = 'block';
    
    const circle = document.getElementById('breathingCircle');
    const exerciseScreen = document.getElementById('exerciseScreen');
    
    circle.className = 'breathing-circle exhale';
    exerciseScreen.className = 'screen exhale';
    
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
    
    // 통계 업데이트
    const updatedStats = updateLocalStats(window.exerciseData);
    addExerciseHistory(window.exerciseData);
    
    // 결과 화면 표시
    showResultScreen();
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
    
    // 🔥 새로운 기능: 리뷰 캐러셀 정리
    if (reviewCarouselInterval) {
        clearInterval(reviewCarouselInterval);
    }
    
    // 모든 화면 숨기기
    document.getElementById('countdownSection').style.display = 'block';
    document.getElementById('breathingSection').style.display = 'none';
    document.getElementById('restSection').style.display = 'none';
    document.getElementById('quizOfferSection').style.display = 'none';
    document.getElementById('quizProgressSection').style.display = 'none';
    document.getElementById('quizRewardSection').style.display = 'none';
}

// 🔧 전역 휴식 타이머 관련 함수들
function stopGlobalRestTimer() {
    if (globalRestTimer) {
        clearInterval(globalRestTimer);
        globalRestTimer = null;
    }
}

function startGlobalRestTimer() {
    stopGlobalRestTimer(); // 기존 타이머 정리
    
    globalRestTimer = setInterval(() => {
        globalRestTime--;
        updateAllCountdowns();
        
        if (globalRestTime <= 0) {
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
}

function showRestIntro() {
    document.getElementById('restIntroText').style.display = 'block';
    document.getElementById('restNormalText').style.display = 'none';
}

function showNormalRest() {
    document.getElementById('restIntroText').style.display = 'none';
    document.getElementById('restNormalText').style.display = 'block';
}
