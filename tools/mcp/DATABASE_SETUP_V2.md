# 🗄️ 숨트레이너 데이터베이스 설정 가이드 v2

## 📋 개요

숨트레이너 앱을 위한 Supabase PostgreSQL 데이터베이스 설정 가이드 v2입니다.
**익명 사용자 지원** 및 **개선된 구조**를 포함합니다.

## 🏗️ 데이터베이스 구조 v2

### 📊 테이블 목록

1. **users** - 사용자 정보 (익명 사용자 지원)
2. **exercise_sessions** - 운동 세션 기록
3. **user_stats** - 사용자 통계
4. **badges** - 배지 마스터 데이터
5. **user_badges** - 사용자 배지 획득 기록
6. **quiz_questions** - 퀴즈 문제 마스터
7. **quiz_attempts** - 퀴즈 시도 기록
8. **feedback_history** - 피드백 히스토리
9. **products** - 상품 정보

## 🚀 설정 단계

### 1단계: Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. **New Project** 클릭
3. 프로젝트 이름: `suumt-trainer-db-v2`
4. 데이터베이스 비밀번호 설정
5. 지역 선택 (한국: `ap-northeast-1`)

### 2단계: 데이터베이스 스키마 생성

1. Supabase 대시보드에서 **SQL Editor** 열기
2. `database_schema_v2.sql` 파일의 내용을 복사하여 실행
3. 모든 테이블, 인덱스, RLS 정책이 생성됨

### 3단계: 초기 데이터 삽입

1. `initial_data.sql` 파일의 내용을 복사하여 실행
2. 배지, 퀴즈 문제, 상품 정보 등이 삽입됨

### 4단계: 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
# Supabase 설정
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# MCP 설정
SUPABASE_ACCESS_TOKEN=your-personal-access-token
```

## 🔒 보안 설정

### RLS (Row Level Security)

모든 테이블에 RLS가 활성화되어 있으며:

- **익명 사용자**: 디바이스 ID 기반 접근
- **인증 사용자**: 사용자 ID 기반 접근
- **마스터 데이터**: 읽기 전용 (배지, 퀴즈 문제, 상품)

### 인증 정책

- 익명 사용자는 디바이스 ID로 식별
- 각 사용자는 자신의 데이터만 조회/수정 가능
- 마스터 데이터는 모든 사용자가 읽기 가능

## 📊 주요 개선사항

### 🔄 v1 → v2 변경사항

| 항목 | v1 | v2 |
|------|----|----|
| 사용자 인증 | 카카오톡 로그인 | 익명 사용자 지원 |
| 운동 기록 | exercise_records | exercise_sessions |
| AI 조언 | 별도 테이블 | 세션에 포함 |
| 배지 시스템 | 하드코딩 | 마스터 데이터 |
| 퀴즈 시스템 | 하드코딩 | 마스터 데이터 |
| 상품 정보 | 하드코딩 | 마스터 데이터 |

### 🆕 새로운 기능

1. **익명 사용자 지원**
   - 디바이스 ID 기반 사용자 식별
   - 로그인 없이도 모든 기능 사용 가능

2. **세션 기반 운동 기록**
   - 운동 시작/완료 시간 추적
   - 운동 지속 시간 계산
   - 중단된 운동 구분

3. **마스터 데이터 관리**
   - 배지, 퀴즈 문제, 상품 정보를 DB에서 관리
   - 동적 콘텐츠 업데이트 가능

4. **개선된 통계**
   - 연속일수 자동 계산
   - 최대 저항 강도 추적
   - 시간대별 운동 통계

## 📊 데이터 마이그레이션

### 로컬스토리지 → Supabase v2

```javascript
// 마이그레이션 함수
async function migrateToSupabaseV2(deviceId) {
  // 1. 사용자 생성 또는 조회
  const user = await createOrGetUser(deviceId);
  
  // 2. 운동 기록 마이그레이션
  const localHistory = JSON.parse(localStorage.getItem('breathTrainerHistory') || '[]');
  
  for (const record of localHistory) {
    await createExerciseSession(user.id, {
      startedAt: new Date(record.date),
      completedAt: new Date(record.date),
      exerciseDuration: record.exerciseTime,
      completedSets: record.completedSets,
      completedBreaths: record.completedBreaths,
      isAborted: record.isAborted,
      userFeedback: record.userFeedback,
      inhaleResistance: record.resistanceSettings?.inhale || 1,
      exhaleResistance: record.resistanceSettings?.exhale || 1
    });
  }
  
  // 3. 통계 마이그레이션
  const localStats = JSON.parse(localStorage.getItem('breathTrainerStats') || '{}');
  await updateUserStats(user.id, {
    totalExercises: localStats.totalExercises || 0,
    totalSets: localStats.totalSets || 0,
    totalBreaths: localStats.totalBreaths || 0,
    consecutiveDays: localStats.consecutiveDays || 0,
    lastExerciseDate: localStats.lastExerciseDate?.split('T')[0] || null
  });
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

`database_types_v2.ts` 파일을 통해 완전한 타입 안전성 제공:

```typescript
import type { ExerciseSession, UserStats, Badge } from './database_types_v2'

// 타입 안전한 데이터 조회
const sessions: ExerciseSession[] = await getExerciseSessions(userId)
const stats: UserStats = await getUserStats(userId)
const badges: Badge[] = await getActiveBadges()
```

## 📈 분석 및 리포팅

### SQL 쿼리 예시

```sql
-- 일일 운동 통계
SELECT 
  DATE(completed_at) as date,
  COUNT(*) as session_count,
  SUM(completed_breaths) as total_breaths,
  AVG(exercise_duration) as avg_duration
FROM exercise_sessions 
WHERE user_id = 'user-uuid'
  AND completed_at IS NOT NULL
  AND is_aborted = false
GROUP BY DATE(completed_at)
ORDER BY date DESC;

-- 배지 획득 현황
SELECT 
  b.name,
  b.icon,
  COUNT(ub.user_id) as earned_count
FROM badges b
LEFT JOIN user_badges ub ON b.id = ub.badge_id
WHERE b.is_active = true
GROUP BY b.id, b.name, b.icon
ORDER BY b.order_index;

-- 퀴즈 성공률
SELECT 
  COUNT(*) as total_attempts,
  SUM(CASE WHEN correct_count = total_questions THEN 1 ELSE 0 END) as perfect_attempts,
  ROUND(
    SUM(CASE WHEN correct_count = total_questions THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 
    2
  ) as success_rate
FROM quiz_attempts
WHERE user_id = 'user-uuid';
```

## 🔧 문제 해결

### 일반적인 문제들

1. **RLS 정책 오류**
   - 디바이스 ID 설정 확인
   - 사용자 인증 상태 확인
   - 정책 조건 검토

2. **타입 오류**
   - `database_types_v2.ts` 파일 확인
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
- [익명 사용자 가이드](https://supabase.com/docs/guides/auth/anonymous-auth) 