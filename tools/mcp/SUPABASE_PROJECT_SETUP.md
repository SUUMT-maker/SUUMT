# Supabase 프로젝트 구성 및 Edge Function 설정

## 📊 프로젝트 정보

### **기본 정보**
- **프로젝트명**: `breath-trainer-v2`
- **프로젝트 ID**: `rfqbzibewzvqopqgovbc`
- **지역**: `ap-northeast-2` (서울)
- **상태**: `ACTIVE_HEALTHY`
- **PostgreSQL 버전**: 17.4.1.064

### **API 엔드포인트**
- **프로젝트 URL**: `https://rfqbzibewzvqopqgovbc.supabase.co`
- **익명 키**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJ6aWJld3p2cW9wcWdvdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzIwNTMsImV4cCI6MjA2OTk0ODA1M30.nAXbnAFe4jM7F56QN4b42NhwNJG_iuSXOVM5zC72Bs4`

## 🗄️ 데이터베이스 구조

### **exercise_sessions 테이블**
운동 세션 데이터를 저장하는 메인 테이블

| 컬럼명 | 타입 | 설명 | 기본값 |
|--------|------|------|--------|
| id | UUID | 고유 식별자 | gen_random_uuid() |
| user_id | TEXT | 사용자 ID | - |
| exercise_date | DATE | 운동 날짜 | - |
| exercise_time | TEXT | 운동 시간 | - |
| completed_sets | INTEGER | 완료 세트 수 | 0 |
| completed_breaths | INTEGER | 완료 호흡 수 | 0 |
| total_target_breaths | INTEGER | 목표 호흡 수 | 20 |
| is_aborted | BOOLEAN | 중단 여부 | false |
| user_feedback | TEXT | 사용자 피드백 | - |
| inhale_resistance | INTEGER | 들숨 저항 | 1 |
| exhale_resistance | INTEGER | 날숨 저항 | 1 |
| created_at | TIMESTAMP | 생성 시간 | now() |

### **ai_advice 테이블**
AI 조언 데이터를 저장하는 테이블

| 컬럼명 | 타입 | 설명 | 기본값 |
|--------|------|------|--------|
| id | UUID | 고유 식별자 | gen_random_uuid() |
| session_id | UUID | 운동 세션 ID (FK) | - |
| intensity_advice | TEXT | 강도 조언 | - |
| comprehensive_advice | TEXT | 종합 조언 | - |
| summary | TEXT | 요약 | - |
| gemini_raw_response | JSONB | Gemini API 원본 응답 | - |
| created_at | TIMESTAMP | 생성 시간 | now() |

## 🚀 Edge Functions

### **1. ai-advice (기존)**
- **버전**: 7
- **상태**: ACTIVE
- **JWT 검증**: 활성화
- **기능**: Google Apps Script에서 마이그레이션된 기본 AI 조언 기능

### **2. ai-advice-v2 (신규)**
- **버전**: 1
- **상태**: ACTIVE
- **JWT 검증**: 활성화
- **기능**: 
  - 데이터베이스 연동 강화
  - 개선된 에러 처리
  - Gemini API 응답 저장
  - 세션 ID 기반 조언 저장

### **3. exercise-analytics (신규)**
- **버전**: 1
- **상태**: ACTIVE
- **JWT 검증**: 활성화
- **기능**:
  - 사용자별 운동 통계 분석
  - 트렌드 분석 (저항, 완주율, 빈도)
  - 개인화된 운동 추천
  - 기간별 데이터 분석

## 🔧 환경 변수 설정

### **필요한 환경 변수**
```bash
# Supabase 설정
SUPABASE_URL=https://rfqbzibewzvqopqgovbc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini API 설정
GEMINI_API_KEY=your_gemini_api_key
```

## 📡 API 사용법

### **AI 조언 요청 (ai-advice-v2)**
```javascript
const response = await fetch('https://rfqbzibewzvqopqgovbc.supabase.co/functions/v1/ai-advice-v2', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    exerciseData: {
      resistanceSettings: { inhale: 2, exhale: 1 },
      userFeedback: 'perfect',
      completedSets: 2,
      completedBreaths: 20,
      exerciseTime: '5:30',
      isAborted: false
    },
    sessionId: 'session-uuid'
  })
})
```

### **운동 분석 요청 (exercise-analytics)**
```javascript
const response = await fetch('https://rfqbzibewzvqopqgovbc.supabase.co/functions/v1/exercise-analytics', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user-id',
    period: 30 // 분석 기간 (일)
  })
})
```

## 🔒 보안 설정

### **RLS (Row Level Security)**
- 현재 모든 테이블에서 RLS가 비활성화되어 있음
- 프로덕션 환경에서는 사용자별 데이터 접근 제어를 위한 RLS 정책 설정 필요

### **JWT 검증**
- 모든 Edge Function에서 JWT 검증이 활성화됨
- 클라이언트에서 유효한 Supabase 토큰을 Authorization 헤더에 포함해야 함

## 📈 모니터링 및 로그

### **Edge Function 로그 확인**
```bash
# Supabase CLI를 사용한 로그 확인
supabase functions logs ai-advice-v2
supabase functions logs exercise-analytics
```

### **데이터베이스 모니터링**
- Supabase 대시보드에서 실시간 데이터베이스 성능 모니터링 가능
- 쿼리 성능 및 연결 수 추적

## 🚀 배포 및 업데이트

### **Edge Function 배포**
```bash
# Supabase CLI를 사용한 배포
supabase functions deploy ai-advice-v2
supabase functions deploy exercise-analytics
```

### **환경 변수 설정**
```bash
# Supabase CLI를 사용한 환경 변수 설정
supabase secrets set GEMINI_API_KEY=your_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
``` 