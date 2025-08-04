# 🗄️ 숨트레이너 데이터베이스 설정 가이드

## 📋 개요

숨트레이너 앱을 위한 Supabase PostgreSQL 데이터베이스 설정 가이드입니다.

## 🏗️ 데이터베이스 구조

### 📊 테이블 목록

1. **users** - 사용자 정보 (카카오톡 로그인)
2. **exercise_records** - 운동 기록
3. **ai_advice_history** - AI 조언 히스토리
4. **user_badges** - 배지 획득 기록
5. **quiz_attempts** - 퀴즈 풀이 기록
6. **user_stats** - 사용자 통계

## 🚀 설정 단계

### 1단계: Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. **New Project** 클릭
3. 프로젝트 이름: `suumt-trainer-db`
4. 데이터베이스 비밀번호 설정
5. 지역 선택 (한국: `ap-northeast-1`)

### 2단계: 데이터베이스 스키마 생성

1. Supabase 대시보드에서 **SQL Editor** 열기
2. `database_schema.sql` 파일의 내용을 복사하여 실행
3. 모든 테이블, 인덱스, RLS 정책이 생성됨

### 3단계: 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
# Supabase 설정
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# MCP 설정
SUPABASE_ACCESS_TOKEN=your-personal-access-token
```

### 4단계: 클라이언트 설정

`js/supabase.js` 파일 생성:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 🔒 보안 설정

### RLS (Row Level Security)

모든 테이블에 RLS가 활성화되어 있으며, 사용자는 자신의 데이터만 접근할 수 있습니다.

### 인증 정책

- 사용자 인증은 카카오톡 로그인을 통해 처리
- 각 사용자는 자신의 데이터만 조회/수정 가능

## 📊 데이터 마이그레이션

### 로컬스토리지 → Supabase

기존 로컬스토리지 데이터를 Supabase로 마이그레이션하는 스크립트:

```javascript
// 마이그레이션 함수
async function migrateLocalDataToSupabase(userId) {
  // 운동 기록 마이그레이션
  const localHistory = JSON.parse(localStorage.getItem('breathTrainerHistory') || '[]')
  
  for (const record of localHistory) {
    await exerciseRecords.saveExerciseRecord(userId, {
      exerciseDate: record.date.split('T')[0],
      exerciseTime: record.exerciseTime,
      completedSets: record.completedSets,
      completedBreaths: record.completedBreaths,
      isAborted: record.isAborted,
      userFeedback: record.userFeedback,
      resistanceSettings: record.resistanceSettings
    })
  }
  
  // 통계 마이그레이션
  const localStats = JSON.parse(localStorage.getItem('breathTrainerStats') || '{}')
  await stats.updateUserStats(userId, {
    total_exercises: localStats.totalExercises || 0,
    total_sets: localStats.totalSets || 0,
    total_breaths: localStats.totalBreaths || 0,
    consecutive_days: localStats.consecutiveDays || 0,
    last_exercise_date: localStats.lastExerciseDate?.split('T')[0] || null
  })
}
```

## 🔍 데이터베이스 모니터링

### 성능 최적화

- 인덱스가 자동으로 생성됨
- 쿼리 성능 모니터링 가능
- Supabase 대시보드에서 실시간 통계 확인

### 백업 및 복구

- Supabase 자동 백업 (7일)
- 수동 백업 생성 가능
- Point-in-time 복구 지원

## 🛠️ 개발 도구

### Supabase CLI

```bash
# CLI 설치
npm install -g supabase

# 로컬 개발 환경 설정
supabase init
supabase start

# 마이그레이션 적용
supabase db push
```

### TypeScript 지원

`database_types.ts` 파일을 통해 완전한 타입 안전성 제공:

```typescript
import type { ExerciseRecord, UserStats } from './database_types'

// 타입 안전한 데이터 조회
const records: ExerciseRecord[] = await exerciseRecords.getUserExerciseRecords(userId)
```

## 📈 분석 및 리포팅

### SQL 쿼리 예시

```sql
-- 일일 운동 통계
SELECT 
  DATE(created_at) as date,
  COUNT(*) as exercise_count,
  SUM(completed_breaths) as total_breaths
FROM exercise_records 
WHERE user_id = 'user-uuid'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 배지 획득 현황
SELECT 
  badge_name,
  COUNT(*) as earned_count
FROM user_badges 
GROUP BY badge_name
ORDER BY earned_count DESC;
```

## 🔧 문제 해결

### 일반적인 문제들

1. **RLS 정책 오류**
   - 사용자 인증 상태 확인
   - 정책 조건 검토

2. **타입 오류**
   - `database_types.ts` 파일 확인
   - Supabase 클라이언트 버전 확인

3. **성능 문제**
   - 인덱스 사용 여부 확인
   - 쿼리 최적화

### 지원

문제가 발생하면:
1. Supabase 대시보드 로그 확인
2. 브라우저 개발자 도구 콘솔 확인
3. 네트워크 탭에서 API 요청 확인

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security) 