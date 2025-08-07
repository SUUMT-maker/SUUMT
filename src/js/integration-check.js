/**
 * 컴포넌트 통합 상태 체크 스크립트
 * 모든 필요한 컴포넌트가 로드되었는지 확인
 */

window.checkIntegration = () => {
    console.log('🔍 컴포넌트 통합 상태 체크 시작');
    
    const requiredComponents = [
        'homeTab',
        'suumTrainingSetup', 
        'suumTrainingStartScreen',
        'suumCountdownOverlay',
        'suumTrainingSession',
        'suumRestBetweenSets',
        'effortLevelSurvey'
    ];
    
    const loadedComponents = [];
    const missingComponents = [];
    
    requiredComponents.forEach(component => {
        if (window[component]) {
            loadedComponents.push(component);
            console.log(`✅ ${component} 로드됨`);
        } else {
            missingComponents.push(component);
            console.error(`❌ ${component} 누락됨`);
        }
    });
    
    console.log('\n📊 통합 상태 요약:');
    console.log(`✅ 로드된 컴포넌트: ${loadedComponents.length}/${requiredComponents.length}`);
    console.log(`❌ 누락된 컴포넌트: ${missingComponents.length}`);
    
    if (missingComponents.length === 0) {
        console.log('🎉 모든 컴포넌트가 정상적으로 로드되었습니다!');
        console.log('\n🧪 사용 가능한 테스트 함수:');
        console.log('- testFullTrainingFlow() : 전체 훈련 플로우 테스트');
        console.log('- testQuickSession() : 빠른 세션 테스트');
        console.log('- testCountdown() : 카운트다운 테스트');
        console.log('- testRest() : 휴식 및 퀴즈 테스트');
        console.log('- testEffortSurvey() : 설문 테스트');
        console.log('- testSession() : 세션 단독 테스트');
        
        return true;
    } else {
        console.error('\n⚠️ 일부 컴포넌트가 누락되었습니다:');
        missingComponents.forEach(component => {
            console.error(`  - ${component}`);
        });
        
        return false;
    }
};

// 페이지 로드 완료 시 자동 체크
document.addEventListener('DOMContentLoaded', () => {
    // 모든 스크립트 로드를 위해 약간의 지연
    setTimeout(() => {
        window.checkIntegration();
    }, 500);
});

console.log('📋 통합 체크 스크립트 로드됨 - checkIntegration() 함수 사용 가능');
