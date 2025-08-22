// 🔍 기존 함수들과 Profile.js 데이터 비교 디버깅 코드
// 브라우저 콘솔에서 실행하여 실제 값들을 비교하세요

console.log('=== 🔍 기존 함수들과 Profile.js 데이터 비교 ===');

// 1. getLocalStats() 결과
console.log('📊 1. getLocalStats() 결과:');
try {
    if (typeof getLocalStats === 'function') {
        const localStats = getLocalStats();
        console.log('✅ getLocalStats():', localStats);
        console.log('   - totalBreaths:', localStats.totalBreaths);
        console.log('   - totalSets:', localStats.totalSets);
        console.log('   - consecutiveDays:', localStats.consecutiveDays);
        console.log('   - totalExercises:', localStats.totalExercises);
    } else {
        console.log('❌ getLocalStats 함수를 찾을 수 없습니다.');
    }
} catch (error) {
    console.error('❌ getLocalStats 실행 오류:', error);
}

// 2. getTodayBreaths() 결과
console.log('\n📊 2. getTodayBreaths() 결과:');
try {
    if (typeof getTodayBreaths === 'function') {
        const todayBreaths = getTodayBreaths();
        console.log('✅ getTodayBreaths():', todayBreaths);
    } else {
        console.log('❌ getTodayBreaths 함수를 찾을 수 없습니다.');
    }
} catch (error) {
    console.error('❌ getTodayBreaths 실행 오류:', error);
}

// 3. getTodayCompletedSets() 결과
console.log('\n📊 3. getTodayCompletedSets() 결과:');
try {
    if (typeof getTodayCompletedSets === 'function') {
        const todaySets = getTodayCompletedSets();
        console.log('✅ getTodayCompletedSets():', todaySets);
    } else {
        console.log('❌ getTodayCompletedSets 함수를 찾을 수 없습니다.');
    }
} catch (error) {
    console.error('❌ getTodayCompletedSets 실행 오류:', error);
}

// 4. getExerciseHistory() 결과
console.log('\n📊 4. getExerciseHistory() 결과:');
try {
    if (typeof getExerciseHistory === 'function') {
        const history = getExerciseHistory();
        console.log('✅ getExerciseHistory():', history);
        console.log('   - 총 기록 수:', history.length);
        console.log('   - 첫 번째 기록:', history[0]);
        console.log('   - 마지막 기록:', history[history.length - 1]);
        
        // 누적 계산
        const totalBreathsFromHistory = history.reduce((sum, record) => sum + (record.completedBreaths || 0), 0);
        const totalSetsFromHistory = history.reduce((sum, record) => sum + (record.completedSets || 0), 0);
        console.log('   - history에서 계산한 totalBreaths:', totalBreathsFromHistory);
        console.log('   - history에서 계산한 totalSets:', totalSetsFromHistory);
    } else {
        console.log('❌ getExerciseHistory 함수를 찾을 수 없습니다.');
    }
} catch (error) {
    console.error('❌ getExerciseHistory 실행 오류:', error);
}

// 5. Profile.js의 calculateGrowthStats() 결과 (가능한 경우)
console.log('\n📊 5. Profile.js calculateGrowthStats() 결과:');
try {
    if (window.profileDashboard && typeof window.profileDashboard.calculateGrowthStats === 'function') {
        const profileStats = window.profileDashboard.calculateGrowthStats();
        console.log('✅ Profile.js calculateGrowthStats():', profileStats);
        console.log('   - totalBreaths:', profileStats.totalBreaths);
        console.log('   - totalWorkoutDays:', profileStats.totalWorkoutDays);
        console.log('   - consecutiveDays:', profileStats.consecutiveDays);
        console.log('   - currentIntensity:', profileStats.currentIntensity);
    } else {
        console.log('❌ Profile.js calculateGrowthStats 함수를 찾을 수 없습니다.');
        console.log('   - window.profileDashboard:', !!window.profileDashboard);
        console.log('   - calculateGrowthStats 함수:', !!(window.profileDashboard && window.profileDashboard.calculateGrowthStats));
    }
} catch (error) {
    console.error('❌ Profile.js calculateGrowthStats 실행 오류:', error);
}

// 6. Supabase 데이터 직접 확인
console.log('\n📊 6. Supabase 데이터 직접 확인:');
try {
    if (window.supabaseClient && window.currentUserId) {
        console.log('✅ Supabase 클라이언트 및 사용자 ID 확인됨');
        console.log('   - currentUserId:', window.currentUserId);
        
        // 전체 데이터 개수 확인
        window.supabaseClient
            .from('exercise_sessions')
            .select('id')
            .eq('user_id', window.currentUserId)
            .then(result => {
                console.log('   - Supabase 전체 세션 수:', result.data?.length || 0);
            });
            
        // 오늘 데이터 확인
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
        
        window.supabaseClient
            .from('exercise_sessions')
            .select('completed_breaths, completed_sets')
            .eq('user_id', window.currentUserId)
            .gte('created_at', todayStart.toISOString())
            .lt('created_at', todayEnd.toISOString())
            .then(result => {
                const todayBreaths = result.data?.reduce((sum, s) => sum + (s.completed_breaths || 0), 0) || 0;
                const todaySets = result.data?.reduce((sum, s) => sum + (s.completed_sets || 0), 0) || 0;
                console.log('   - Supabase 오늘 데이터:', { todayBreaths, todaySets, sessions: result.data?.length || 0 });
            });
    } else {
        console.log('❌ Supabase 클라이언트 또는 사용자 ID가 없습니다.');
        console.log('   - supabaseClient:', !!window.supabaseClient);
        console.log('   - currentUserId:', !!window.currentUserId);
    }
} catch (error) {
    console.error('❌ Supabase 데이터 확인 오류:', error);
}

// 7. 데이터 소스 비교 요약
console.log('\n📊 7. 데이터 소스 비교 요약:');
console.log('🔍 로컬 스토리지 기반 (getLocalStats):');
console.log('   - 장점: 빠른 접근, 오프라인 동작');
console.log('   - 단점: 최대 10개 기록만 저장, 브라우저 재시작 시 초기화 가능');
console.log('   - 적합성: 실시간 통계, 오늘 데이터');

console.log('\n🔍 Supabase 기반 (Profile.js):');
console.log('   - 장점: 전체 기간 데이터, 영구 저장, 다중 기기 동기화');
console.log('   - 단점: 네트워크 의존, 초기 로딩 시간');
console.log('   - 적합성: 누적 통계, 전체 기간 분석');

console.log('\n🔍 하이브리드 접근 (권장):');
console.log('   - 로컬: 실시간 통계, 빠른 접근');
console.log('   - Supabase: 누적 통계, 전체 기간 데이터');
console.log('   - 동기화: 운동 완료 시 양쪽 모두 업데이트');

console.log('\n=== 🔍 데이터 비교 완료 ===');
