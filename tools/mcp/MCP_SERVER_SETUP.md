# Supabase MCP 서버 설정 및 실행 가이드

## 개요
이 문서는 Supabase MCP (Model Context Protocol) 서버의 설정 및 실행 방법을 설명합니다.

## 설치된 패키지
- `@supabase/mcp-server-supabase@0.4.5`

## 설정 파일
- `config.json`: Supabase 연결 문자열 구성
- 액세스 토큰: `sbp_c6deddbc3fa378e9fc9483b9a6fe02ff20e6cf93`

## 서버 실행 방법

### 1. 환경 변수 설정
```bash
export SUPABASE_ACCESS_TOKEN="sbp_c6deddbc3fa378e9fc9483b9a6fe02ff20e6cf93"
```

### 2. MCP 서버 실행
```bash
cd tools/mcp
npx @supabase/mcp-server-supabase
```

## 서버 상태 확인
- 프로세스 확인: `ps aux | grep mcp-server`
- 서버는 stdio를 통해 통신하므로 네트워크 포트를 사용하지 않습니다.

## 기능
- Supabase API를 사용하여 LLM 쿼리를 Postgres와 호환되는 SQL로 변환
- RESTful 데이터베이스 접근을 위해 PostgREST 활용
- Cursor IDE에서 MCP 서버로 접근 가능

## 주의사항
- 액세스 토큰은 보안을 위해 환경 변수로 관리
- config.json 파일의 연결 문자열은 실제 데이터베이스 정보로 업데이트 필요 