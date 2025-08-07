// 🔍 Supabase REST API를 통한 스키마 확인 스크립트
// 브라우저 콘솔에서 실행하세요

async function checkSupabaseSchema() {
    console.log('🔍 Supabase REST API를 통한 스키마 확인 시작...');
    
    const SUPABASE_URL = 'https://rfqbzibewzvqopqgovbc.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJ6aWJld3p2cW9wcWdvdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzIwNTMsImV4cCI6MjA2OTk0ODA1M30.nAXbnAFe4jM7F56QN4b42NhwNJG_iuSXOVM5zC72Bs4';

    // 1. exercise_sessions 테이블 스키마 확인 (HEAD 요청으로)
    console.log('\n📋 1. exercise_sessions 테이블 스키마 확인...');
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/exercise_sessions?limit=1`, {
            method: 'HEAD',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=headers-only'
            }
        });

        if (response.ok) {
            console.log('✅ 테이블 접근 성공');
            console.log('📄 응답 헤더들:');
            for (let [key, value] of response.headers.entries()) {
                console.log(`${key}: ${value}`);
            }
        } else {
            console.error('❌ 테이블 접근 실패:', response.status, response.statusText);
        }
    } catch (err) {
        console.error('❌ HEAD 요청 실패:', err);
    }

    // 2. 실제 데이터 1개만 가져와서 컬럼 확인
    console.log('\n📋 2. 실제 데이터로 컬럼 확인...');
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/exercise_sessions?limit=1`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ 데이터 조회 성공');
            console.log('📊 조회된 레코드 수:', data.length);
            
            if (data.length > 0) {
                console.log('📋 사용 가능한 컬럼들:', Object.keys(data[0]));
                console.log('📄 첫 번째 레코드:', data[0]);
            }
        } else {
            console.error('❌ 데이터 조회 실패:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ 에러 내용:', errorText);
        }
    } catch (err) {
        console.error('❌ GET 요청 실패:', err);
    }

    // 3. 특정 세션 조회
    const testSessionId = 'c9b7dc8d-e446-4dfc-ab24-cc74fda80a1e';
    console.log(`\n🎯 3. 특정 세션 (${testSessionId}) 조회...`);
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/exercise_sessions?id=eq.${testSessionId}`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ 특정 세션 조회 성공');
            console.log('📊 조회된 레코드 수:', data.length);
            
            if (data.length > 0) {
                console.log('📋 이 세션의 컬럼들:', Object.keys(data[0]));
                console.log('📄 세션 데이터:', data[0]);
            }
        } else {
            console.error('❌ 특정 세션 조회 실패:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ 에러 내용:', errorText);
        }
    } catch (err) {
        console.error('❌ 특정 세션 조회 중 오류:', err);
    }

    console.log('\n🏁 Supabase 스키마 확인 완료');
}

// 함수 실행
checkSupabaseSchema();