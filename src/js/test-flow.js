/**
 * 숨트레이너 통합 테스트 스크립트
 * 전체 훈련 플로우를 테스트하기 위한 함수들
 */

// 세션 테스트 함수
window.testSession = () => {
    console.log('🧪 세션 테스트 시작');
    
    // 테스트 설정
    const sessionConfig = {
        inhaleResistance: 2,
        exhaleResistance: 3,
        dailyGoal: 2,
        completedToday: 1
    };
    
    console.log('📋 테스트 설정:', sessionConfig);
    
    // 훈련 시작 화면 초기화 및 표시
    if (window.suumTrainingStartScreen) {
        window.suumTrainingStartScreen.init(
            sessionConfig,
            // 시작 콜백
            (finalConfig) => {
                console.log('✅ 세션 시작:', finalConfig);
                
                // 카운트다운 초기화 및 시작
                if (window.suumCountdownOverlay) {
                    window.suumCountdownOverlay.init(() => {
                        console.log('✅ 카운트다운 완료 - 세션 시작');
                        
                        // 훈련 세션 초기화 및 시작
                        if (window.suumTrainingSession) {
                            window.suumTrainingSession.init(
                                finalConfig,
                                // 세션 완료 콜백
                                (result) => {
                                    console.log('✅ 세션 결과:', result);
                                    
                                    // 난이도 설문 초기화 및 표시
                                    if (window.effortLevelSurvey) {
                                        window.effortLevelSurvey.init(
                                            result.sessionId,
                                            result.isAborted,
                                            (effort) => {
                                                console.log('✅ 난이도 평가:', effort);
                                            }
                                        );
                                        window.effortLevelSurvey.show();
                                    } else {
                                        console.error('❌ EffortLevelSurvey 컴포넌트 누락');
                                    }
                                },
                                // 세션 중단 콜백
                                (result) => {
                                    console.log('⚠️ 세션 중단:', result);
                                },
                                // 진행 상황 콜백
                                (progress) => {
                                    console.log('📊 진행 상황:', progress);
                                }
                            );
                            window.suumTrainingSession.start();
                        } else {
                            console.error('❌ SuumTrainingSession 컴포넌트 누락');
                        }
                    });
                    window.suumCountdownOverlay.show();
                } else {
                    console.error('❌ SuumCountdownOverlay 컴포넌트 누락');
                }
            },
            // 취소 콜백
            () => {
                console.log('⚠️ 설정으로 돌아가기');
            }
        );
        window.suumTrainingStartScreen.show();
    } else {
        console.error('❌ SuumTrainingStartScreen 컴포넌트 누락');
    }
};

// 빠른 세션 테스트 (카운트다운 스킵)
window.testQuickSession = () => {
    console.log('🧪 빠른 세션 테스트 시작');
    
    const sessionConfig = {
        inhaleResistance: 2,
        exhaleResistance: 3,
        dailyGoal: 2,
        completedToday: 0
    };
    
    if (window.suumTrainingSession) {
        window.suumTrainingSession.init(
            sessionConfig,
            (result) => {
                console.log('✅ 세션 완료:', result);
                if (window.effortLevelSurvey) {
                    window.effortLevelSurvey.init(
                        result.sessionId,
                        result.isAborted,
                        (effort) => {
                            console.log('✅ 난이도 평가:', effort);
                        }
                    );
                    window.effortLevelSurvey.show();
                }
            },
            (result) => {
                console.log('⚠️ 세션 중단:', result);
            }
        );
        window.suumTrainingSession.start();
    } else {
        console.error('❌ SuumTrainingSession 컴포넌트 누락');
    }
};

// 카운트다운 단독 테스트
window.testCountdown = () => {
    console.log('🧪 카운트다운 테스트 시작');
    
    if (window.suumCountdownOverlay) {
        window.suumCountdownOverlay.init(
            () => {
                console.log('✅ 카운트다운 완료');
                alert('카운트다운 완료!');
            },
            () => {
                console.log('⚠️ 카운트다운 취소');
                alert('카운트다운 취소됨');
            }
        );
        window.suumCountdownOverlay.show();
    } else {
        console.error('❌ SuumCountdownOverlay 컴포넌트 누락');
    }
};

// 휴식 및 퀴즈 테스트
window.testRest = () => {
    console.log('🧪 휴식 및 퀴즈 테스트 시작');
    
    if (window.suumRestBetweenSets) {
        window.suumRestBetweenSets.init(
            () => {
                console.log('✅ 휴식 완료 - 다음 세트 시작');
            },
            () => {
                console.log('⚠️ 세션 종료 요청');
            }
        );
        window.suumRestBetweenSets.show();
    } else {
        console.error('❌ SuumRestBetweenSets 컴포넌트 누락');
    }
};

// 난이도 설문 테스트
window.testEffortSurvey = () => {
    console.log('🧪 난이도 설문 테스트 시작');
    
    if (window.effortLevelSurvey) {
        window.effortLevelSurvey.init(
            'test-session-id',
            false,
            (result) => {
                console.log('✅ 설문 결과:', result);
            }
        );
        window.effortLevelSurvey.show();
    } else {
        console.error('❌ EffortLevelSurvey 컴포넌트 누락');
    }
};

// 중단된 세션용 설문 테스트
window.testEffortSurveyAborted = () => {
    console.log('🧪 중단 세션 설문 테스트 시작');
    
    if (window.effortLevelSurvey) {
        window.effortLevelSurvey.init(
            'test-aborted-session-id',
            true,
            (result) => {
                console.log('✅ 중단 세션 설문 결과:', result);
            }
        );
        window.effortLevelSurvey.show();
    } else {
        console.error('❌ EffortLevelSurvey 컴포넌트 누락');
    }
};

console.log('📋 테스트 스크립트 로드 완료');
console.log('사용 가능한 테스트 함수:');
console.log('- testSession() : 전체 세션 테스트');
console.log('- testQuickSession() : 빠른 세션 테스트');
console.log('- testCountdown() : 카운트다운 테스트');
console.log('- testRest() : 휴식 및 퀴즈 테스트');
console.log('- testEffortSurvey() : 난이도 설문 테스트');
console.log('- testEffortSurveyAborted() : 중단 세션 설문 테스트');
