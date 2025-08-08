# ChatGPT-Cursor AI 연동 설정 가이드

## 🎯 문제 해결 단계

### 1단계: ChatGPT Extension 설치 확인
1. ChatGPT에서 "Cursor AI" extension이 정상적으로 설치되었는지 확인
2. Extension이 활성화되어 있는지 확인
3. 브라우저 콘솔에서 오류 메시지 확인

### 2단계: Cursor AI 설정 파일 생성
Cursor AI가 ChatGPT에서 프로젝트에 접근할 수 있도록 설정 파일을 생성해야 합니다.

### 3단계: 프로젝트 공유 설정
1. Cursor AI에서 프로젝트를 공유 가능한 상태로 설정
2. ChatGPT extension에서 프로젝트 경로를 올바르게 지정

### 4단계: 권한 설정
1. 파일 시스템 접근 권한 확인
2. 네트워크 연결 상태 확인

## 🔧 해결 방법

### 방법 1: Cursor AI 설정 파일 생성
```json
// .cursor-ai-config.json
{
  "projectName": "breath-trainer-main",
  "allowChatGPTAccess": true,
  "sharedDirectories": [
    "js/",
    "css/",
    "index.html"
  ],
  "excludePatterns": [
    "node_modules/",
    ".git/",
    "*.log"
  ]
}
```

### 방법 2: ChatGPT Extension 재설치
1. ChatGPT에서 Cursor AI extension 제거
2. 브라우저 캐시 삭제
3. Cursor AI extension 재설치
4. 프로젝트 경로 재설정

### 방법 3: 환경 변수 설정
```bash
# macOS/Linux
export CURSOR_AI_ENABLED=true
export CURSOR_AI_PROJECT_PATH="/Users/jack/Documents/breath-trainer-main"

# Windows
set CURSOR_AI_ENABLED=true
set CURSOR_AI_PROJECT_PATH=C:\Users\jack\Documents\breath-trainer-main
```

## 🚨 일반적인 문제들

### 문제 1: Extension이 프로젝트를 찾지 못함
**해결책:**
- 프로젝트 경로가 정확한지 확인
- 절대 경로 사용 권장
- 파일 권한 확인

### 문제 2: 네트워크 연결 오류
**해결책:**
- 방화벽 설정 확인
- 프록시 설정 확인
- VPN 사용 중이라면 비활성화 후 테스트

### 문제 3: 권한 부족
**해결책:**
- 관리자 권한으로 실행
- 파일 시스템 권한 확인
- 브라우저 권한 설정 확인

## 📋 체크리스트

- [ ] Cursor AI extension이 설치됨
- [ ] Extension이 활성화됨
- [ ] 프로젝트 경로가 정확함
- [ ] 파일 시스템 권한이 있음
- [ ] 네트워크 연결이 정상임
- [ ] 브라우저 캐시가 삭제됨
- [ ] 환경 변수가 설정됨

## 🆘 추가 도움

문제가 지속되면:
1. ChatGPT extension 로그 확인
2. Cursor AI 공식 문서 참조
3. 브라우저 개발자 도구에서 오류 메시지 확인
4. Cursor AI 지원팀에 문의
