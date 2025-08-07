// 🔍 데이터베이스 스키마 디버깅 스크립트
// 브라우저 콘솔에서 실행하세요

async function debugDatabaseSchema() {
    console.log('🔍 데이터베이스 스키마 디버깅 시작...');
    
    if (!window.supabaseClient) {
        console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다.');
        return;
    }

    // 1. exercise_sessions 테이블의 모든 컬럼 확인
    console.log('\n📋 1. exercise_sessions 테이블 전체 조회 시도...');
    try {
        const { data: allData, error: allError } = await window.supabaseClient
            .from('exercise_sessions')
            .select('*')
            .limit(1);
            
        if (allError) {
            console.error('❌ 전체 조회 실패:', allError);
        } else {
            console.log('✅ 전체 조회 성공. 첫 번째 레코드의 컬럼들:');
            if (allData && allData.length > 0) {
                console.log('📄 사용 가능한 컬럼들:', Object.keys(allData[0]));
            } else {
                console.log('ℹ️ 데이터가 없습니다.');
            }
        }
    } catch (err) {
        console.error('❌ 전체 조회 중 오류:', err);
    }

    // 2. 특정 세션 ID로 조회 테스트
    const testSessionId = 'c9b7dc8d-e446-4dfc-ab24-cc74fda80a1e';
    console.log(`\n🎯 2. 특정 세션 (${testSessionId}) 조회 테스트...`);
    
    try {
        const { data: sessionData, error: sessionError } = await window.supabaseClient
            .from('exercise_sessions')
            .select('*')
            .eq('id', testSessionId);
            
        if (sessionError) {
            console.error('❌ 세션 조회 실패:', sessionError);
        } else {
            console.log('✅ 세션 조회 성공:');
            console.log('📄 세션 데이터:', sessionData);
            if (sessionData && sessionData.length > 0) {
                console.log('📋 이 세션의 컬럼들:', Object.keys(sessionData[0]));
            }
        }
    } catch (err) {
        console.error('❌ 세션 조회 중 오류:', err);
    }

    // 3. 문제가 되는 컬럼들 개별 테스트
    console.log('\n🔍 3. 문제 컬럼들 개별 테스트...');
    
    const problematicColumns = ['started_at', 'exercise_duration', 'ai_advice'];
    
    for (const column of problematicColumns) {
        try {
            console.log(`\n테스트 중: ${column}`);
            const { data, error } = await window.supabaseClient
                .from('exercise_sessions')
                .select(column)
                .limit(1);
                
            if (error) {
                console.error(`❌ ${column} 컬럼 조회 실패:`, error);
            } else {
                console.log(`✅ ${column} 컬럼 조회 성공`);
            }
        } catch (err) {
            console.error(`❌ ${column} 컬럼 테스트 중 오류:`, err);
        }
    }

    // 4. 대체 컬럼명들 테스트
    console.log('\n🔄 4. 가능한 대체 컬럼명들 테스트...');
    
    const alternativeColumns = [
        'created_at', // started_at 대신
        'completed_at', // started_at 대신
        'duration', // exercise_duration 대신
        'session_duration', // exercise_duration 대신
        'ai_recommendation', // ai_advice 대신
        'ai_feedback' // ai_advice 대신
    ];
    
    for (const column of alternativeColumns) {
        try {
            const { data, error } = await window.supabaseClient
                .from('exercise_sessions')
                .select(column)
                .limit(1);
                
            if (error) {
                console.log(`❌ ${column} 컬럼 없음:`, error.message);
            } else {
                console.log(`✅ ${column} 컬럼 존재함!`);
            }
        } catch (err) {
            console.log(`❌ ${column} 테스트 실패:`, err.message);
        }
    }

    console.log('\n🏁 스키마 디버깅 완료');
}

// 함수 실행
debugDatabaseSchema();