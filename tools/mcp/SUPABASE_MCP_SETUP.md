# Supabase MCP 서버 설정 가이드

## 🎉 Supabase 공식 MCP 서버 사용

[Supabase 공식 블로그](https://supabase.com/blog/mcp-server)에 따르면, 이제 공식 MCP 서버가 출시되어 20개 이상의 도구를 사용할 수 있습니다.

## 📋 단계별 설정 방법

### 1단계: Personal Access Token 생성

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 우측 상단 프로필 → **Account Settings**
3. **Access Tokens** 탭으로 이동
4. **Generate new token** 클릭
5. 토큰 이름 입력 (예: "Cursor MCP")
6. 생성된 토큰을 안전한 곳에 복사

### 2단계: Cursor 설정 파일 수정

#### `.cursorrules` 파일에서:
```yaml
mcpServers:
  supabase:
    command: npx
    args: [
      "-y",
      "@supabase/mcp-server-supabase@latest",
      "--access-token",
      "your-personal-access-token-here"
    ]
```

### 3단계: Cursor IDE 재시작

1. Cursor IDE 완전 종료
2. Cursor IDE 재시작
3. MCP 서버가 자동으로 로드됨

## 🛠️ 사용 가능한 도구들

Supabase MCP 서버는 다음 20개 이상의 도구를 제공합니다:

### 데이터베이스 관리
- 테이블 설계 및 마이그레이션 추적
- SQL 쿼리로 데이터 가져오기 및 보고서 생성
- 데이터베이스 브랜치 생성 (개발용)
- 프로젝트 설정 가져오기

### 프로젝트 관리
- 새 Supabase 프로젝트 생성
- 프로젝트 일시정지 및 복원
- 로그 검색으로 문제 디버깅
- 데이터베이스 스키마 기반 TypeScript 타입 생성

### 스키마 관리
- 테이블 목록 조회
- 뷰, 트리거, 함수, 정책 관리
- 스키마 변경사항 추적

## 🔧 실제 사용 예시

Cursor IDE에서 다음과 같이 사용할 수 있습니다:

```
"Supabase에서 사용자 테이블을 생성해줘"
"데이터베이스 스키마를 확인해줘"
"새로운 프로젝트를 생성해줘"
"SQL 쿼리로 사용자 통계를 가져와줘"
"TypeScript 타입을 생성해줘"
```

## ⚠️ 보안 주의사항

1. **Personal Access Token 보호**: 토큰을 절대 공개하지 마세요
2. **환경 변수 사용**: 프로덕션에서는 환경 변수로 토큰 관리
3. **토큰 권한**: 필요한 최소 권한만 부여하세요

## 🚀 향후 기능

Supabase MCP 서버는 다음 기능들을 계획하고 있습니다:

- Edge Functions 생성 및 배포
- 네이티브 OAuth 2.0 인증
- 향상된 스키마 발견 기능
- 더 많은 보호 기능

## 📚 참고 자료

- [Supabase MCP 서버 공식 블로그](https://supabase.com/blog/mcp-server)
- [Supabase MCP 문서](https://supabase.com/docs/guides/mcp)
- [MCP 프로토콜 공식 문서](https://modelcontextprotocol.io/)

## 🆘 문제 해결

문제가 발생하면:
1. Personal Access Token이 올바른지 확인
2. Cursor IDE를 재시작
3. Supabase 프로젝트 상태 확인
4. [GitHub 이슈](https://github.com/supabase/mcp-server)에 보고 