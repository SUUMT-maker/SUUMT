# MCP (Model Context Protocol) 설정

이 폴더는 Cursor IDE의 MCP 서버 설정과 숨트레이너 데이터베이스 구축을 위한 파일들을 포함합니다.

## 📁 포함된 파일들

### 🔧 MCP 설정
- `.cursorrules` - Cursor IDE MCP 서버 설정
- `SUPABASE_MCP_SETUP.md` - Supabase MCP 서버 설정 가이드
- `env.example` - 환경 변수 설정 예시

### 🗄️ 데이터베이스 설정
- `database_schema.sql` - 숨트레이너 데이터베이스 스키마
- `database_types.ts` - TypeScript 타입 정의
- `supabase_client.ts` - Supabase 클라이언트 설정
- `DATABASE_SETUP.md` - 데이터베이스 설정 가이드

## 🚀 사용 방법

### 1. Cursor IDE에서 MCP 사용하기

프로젝트 루트에서 `.cursorrules` 파일을 복사하거나 심볼릭 링크를 생성하세요:

```bash
# 복사 방법
cp tools/mcp/.cursorrules ./

# 또는 심볼릭 링크 방법
ln -s tools/mcp/.cursorrules ./
```

### 2. 환경 변수 설정

`env.example` 파일을 참고하여 필요한 환경 변수를 설정하세요:

```bash
cp tools/mcp/env.example .env
# .env 파일을 편집하여 실제 값으로 변경
```

### 3. Supabase MCP 서버 설정

`SUPABASE_MCP_SETUP.md` 파일을 참고하여 Supabase MCP 서버를 설정하세요.

### 4. 데이터베이스 구축

`DATABASE_SETUP.md` 파일을 참고하여 숨트레이너 데이터베이스를 구축하세요.

## 📋 MCP 서버 기능

- Supabase 데이터베이스 관리
- 프로젝트 생성 및 관리
- SQL 쿼리 실행
- TypeScript 타입 생성
- 스키마 관리

## 🗄️ 데이터베이스 구조

### 📊 테이블 목록

1. **users** - 사용자 정보 (카카오톡 로그인)
2. **exercise_records** - 운동 기록
3. **ai_advice_history** - AI 조언 히스토리
4. **user_badges** - 배지 획득 기록
5. **quiz_attempts** - 퀴즈 풀이 기록
6. **user_stats** - 사용자 통계

### 🔒 보안 기능

- RLS (Row Level Security) 정책
- 자동 통계 업데이트 트리거
- 인덱스 최적화
- 타입 안전성

## 🔧 문제 해결

MCP 서버 연결에 문제가 있으면:

1. Personal Access Token이 올바른지 확인
2. Cursor IDE 재시작
3. `SUPABASE_MCP_SETUP.md` 참고

데이터베이스 문제가 있으면:

1. Supabase 프로젝트 설정 확인
2. RLS 정책 검토
3. `DATABASE_SETUP.md` 참고

## 📚 참고 자료

- [Supabase MCP 서버 공식 문서](https://supabase.com/docs/guides/mcp)
- [MCP 프로토콜 공식 문서](https://modelcontextprotocol.io/)
- [Supabase 데이터베이스 가이드](https://supabase.com/docs/guides/database) 