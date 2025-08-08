# Cursor 로컬 앱 + ChatGPT 데스크탑 앱 연동 가이드

## 🎯 현재 상황
- ✅ ChatGPT 데스크탑 앱 설치됨
- ✅ Cursor 로컬 앱 설치됨
- 🔄 두 앱 간 연동 설정 필요

## 🔧 Cursor 로컬 앱 설정

### 1단계: Cursor 앱에서 프로젝트 열기

1. **Cursor 앱 실행**
   - Applications 폴더에서 Cursor 앱 실행
   - 또는 Spotlight (Cmd+Space)에서 "Cursor" 검색

2. **프로젝트 폴더 열기**
   - "Open Folder" 또는 "폴더 열기" 클릭
   - `/Users/jack/Documents/breath-trainer-main` 선택
   - "Open" 클릭

3. **프로젝트 확인**
   - 좌측 파일 탐색기에서 프로젝트 파일들 확인
   - `index.html`, `js/`, `css/` 폴더 등 확인

### 2단계: Cursor에서 ChatGPT 연동

1. **ChatGPT 기능 활성화**
   - Cursor 앱에서 `Cmd+Shift+L` (또는 `Ctrl+Shift+L`)
   - 또는 우측 사이드바에서 ChatGPT 아이콘 클릭

2. **ChatGPT 계정 연결**
   - "Connect to ChatGPT" 클릭
   - OpenAI 계정으로 로그인
   - API 키 입력 (필요시)

3. **프로젝트 컨텍스트 설정**
   - Cursor가 자동으로 프로젝트 파일들을 인식
   - ChatGPT와 대화할 때 프로젝트 컨텍스트 자동 제공

### 3단계: Cursor 설정 최적화

1. **설정 메뉴 접속**
   - `Cmd+,` (또는 `Ctrl+,`)
   - 또는 Cursor → Preferences

2. **ChatGPT 설정**
   - "AI" 또는 "ChatGPT" 섹션 찾기
   - 다음 설정 확인:
     - [x] Auto-sync project context
     - [x] Include file contents in chat
     - [x] Enable code suggestions

3. **프로젝트별 설정**
   - 프로젝트 루트에 `.cursorrules` 파일 확인
   - 프로젝트 특정 규칙 설정

## 🚀 실제 사용 방법

### 방법 1: Cursor에서 직접 ChatGPT 사용

1. **코드 편집 중 질문**
   ```bash
   # Cursor에서 Cmd+Shift+L로 ChatGPT 열기
   # "이 함수를 최적화해줘" 등 질문
   ```

2. **파일 생성 요청**
   ```bash
   # "새로운 컴포넌트를 만들어줘" 등 요청
   # Cursor가 자동으로 파일 생성
   ```

3. **버그 수정 요청**
   ```bash
   # 에러 메시지나 문제 설명
   # ChatGPT가 해결책 제시
   ```

### 방법 2: ChatGPT 데스크탑 앱과 병행 사용

1. **Cursor에서 개발**
   - 코드 작성 및 편집
   - 실시간 AI 제안 받기

2. **ChatGPT에서 질문**
   - 복잡한 아키텍처 질문
   - 전체적인 설계 논의

3. **두 앱 간 파일 동기화**
   - Cursor에서 저장한 파일
   - ChatGPT에서도 동일한 파일 접근 가능

## 🔧 고급 설정

### Cursor 프로젝트 설정 파일

```json
// .cursor/settings.json
{
  "chatgpt": {
    "enabled": true,
    "autoSync": true,
    "includeFiles": true,
    "contextWindow": 8192
  },
  "project": {
    "name": "breath-trainer-main",
    "type": "web",
    "framework": "vanilla-js"
  }
}
```

### 환경 변수 설정

```bash
# ~/.zshrc에 추가
export CURSOR_CHATGPT_ENABLED=true
export CURSOR_PROJECT_PATH="/Users/jack/Documents/breath-trainer-main"
export OPENAI_API_KEY="your-api-key-here"
```

## 🎯 권장 워크플로우

### 개발 시나리오

1. **새 기능 개발**
   - Cursor에서 코드 작성
   - ChatGPT로 로직 검토
   - 실시간 피드백 받기

2. **버그 수정**
   - Cursor에서 에러 위치 확인
   - ChatGPT에 문제 설명
   - 해결책 적용

3. **코드 리팩토링**
   - Cursor에서 코드 분석
   - ChatGPT로 개선 방안 논의
   - 단계별 리팩토링

### 파일 관리

1. **자동 저장**
   - Cursor에서 자동 저장 활성화
   - Git 커밋 자동화

2. **버전 관리**
   - Cursor에서 Git 통합 사용
   - ChatGPT로 커밋 메시지 생성

## 🚨 문제 해결

### Cursor에서 ChatGPT가 연결되지 않는 경우

1. **API 키 확인**
   - OpenAI API 키가 유효한지 확인
   - 환경 변수에 올바르게 설정되었는지 확인

2. **네트워크 연결**
   - 인터넷 연결 확인
   - 방화벽 설정 확인

3. **Cursor 재시작**
   - Cursor 앱 완전 종료
   - 앱 재시작

### 프로젝트 컨텍스트가 제대로 전달되지 않는 경우

1. **파일 권한 확인**
   ```bash
   ls -la /Users/jack/Documents/breath-trainer-main
   ```

2. **Cursor 설정 확인**
   - Auto-sync project context 활성화
   - Include file contents in chat 활성화

3. **프로젝트 재로드**
   - Cursor에서 프로젝트 폴더 다시 열기

## 📋 체크리스트

- [ ] Cursor 앱 실행됨
- [ ] 프로젝트 폴더 열림
- [ ] ChatGPT 연결됨
- [ ] 프로젝트 컨텍스트 인식됨
- [ ] 설정 최적화됨
- [ ] 테스트 대화 성공
- [ ] 파일 동기화 확인됨

## 💡 팁

### 효율적인 사용법

1. **단축키 활용**
   - `Cmd+Shift+L`: ChatGPT 열기
   - `Cmd+K`: 코드 제안
   - `Cmd+Shift+P`: 명령 팔레트

2. **프로젝트 구조 활용**
   - 파일 탐색기에서 파일 선택
   - ChatGPT에 특정 파일 컨텍스트 제공

3. **실시간 협업**
   - Cursor에서 코드 작성
   - ChatGPT로 즉시 검토
   - 빠른 피드백 루프

## 🆘 지원

### Cursor 지원
- 공식 문서: https://cursor.sh/docs
- Discord: https://discord.gg/cursor
- GitHub: https://github.com/getcursor/cursor

### ChatGPT 지원
- 공식 지원: help.openai.com
- API 문서: https://platform.openai.com/docs
