# 🔍 데이터베이스 컬럼 오류 해결 가이드

## 📋 현재 상황
사용자가 기록탭에서 다음 오류들이 발생:
1. `"column exercise_sessions.started_at does not exist"`
2. `"column exercise_sessions.exercise_duration does not exist"`  
3. `"column exercise_sessions.ai_advice does not exist"`

## 🎯 문제 분석
- 코드에서는 해당 컬럼들을 사용하고 있음 (`/js/app.js`)
- 스키마 파일(`database_schema_v2.sql`)에는 해당 컬럼들이 정의되어 있음
- **실제 Supabase 데이터베이스의 테이블 구조가 스키마 파일과 다를 가능성**

## 🔧 즉시 실행할 해결 단계

### 1단계: 실제 데이터베이스 스키마 확인

브라우저 개발자도구 > 콘솔에서 다음 스크립트 실행:

```javascript
// 실제 데이터베이스 컬럼 확인
async function checkRealSchema() {
    try {
        // 전체 컬럼 확인
        const { data, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('❌ 오류:', error);
            return;
        }
        
        if (data && data.length > 0) {
            console.log('✅ 실제 사용 가능한 컬럼들:');
            console.log(Object.keys(data[0]));
            console.log('📄 첫 번째 레코드:', data[0]);
        }
    } catch (err) {
        console.error('❌ 스키마 확인 오류:', err);
    }
}

checkRealSchema();
```

### 2단계: 특정 세션 데이터 확인

```javascript
// 사용자의 세션 ID로 실제 데이터 확인
async function checkSessionData() {
    const sessionId = 'c9b7dc8d-e446-4dfc-ab24-cc74fda80a1e';
    
    try {
        const { data, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select('*')
            .eq('id', sessionId);
            
        if (error) {
            console.error('❌ 세션 조회 오류:', error);
            return;
        }
        
        console.log('📊 세션 데이터:', data);
        if (data && data.length > 0) {
            console.log('🗂️ 이 세션의 컬럼들:', Object.keys(data[0]));
        }
    } catch (err) {
        console.error('❌ 세션 데이터 확인 오류:', err);
    }
}

checkSessionData();
```

## 🔄 예상되는 해결 방안들

### 시나리오 1: 컬럼명이 다른 경우
실제 컬럼명이 다를 수 있습니다:
- `started_at` → `created_at` 또는 `session_start`
- `exercise_duration` → `duration` 또는 `session_duration`  
- `ai_advice` → `ai_recommendation` 또는 `ai_feedback`

### 시나리오 2: 테이블 구조가 완전히 다른 경우
- 스키마가 적용되지 않았거나
- 다른 버전의 스키마가 적용된 경우

### 시나리오 3: RLS(Row Level Security) 문제
- 컬럼 접근 권한 문제일 수 있음

## 📝 결과 보고 양식

위 스크립트 실행 후 다음 정보를 확인하세요:

```
1. 실제 사용 가능한 컬럼 목록:
[여기에 콘솔에서 출력된 컬럼 목록 붙여넣기]

2. 세션 데이터 샘플:
[여기에 실제 세션 데이터 붙여넣기]

3. 발생한 오류 메시지:
[여기에 오류 메시지가 있다면 붙여넣기]
```

## ⚡ 임시 해결책

실제 컬럼명을 확인하기 전까지 기록탭이 동작하도록 하려면, 
에러가 발생하는 쿼리를 수정해야 합니다.

`/js/app.js` 파일에서:
- Line 431, 433, 443: `started_at`, `exercise_duration` 사용 부분
- Line 474, 491, 494: `ai_advice` 사용 부분

이 부분들을 실제 존재하는 컬럼명으로 교체해야 합니다.

---

⚠️ **중요**: 위 스크립트를 실행하여 실제 컬럼명을 먼저 확인한 후, 
정확한 수정 방안을 결정하겠습니다.