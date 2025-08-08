# ChatGPT 데스크탑 버전 - Cursor AI 연동 가이드

## 🖥️ ChatGPT 데스크탑 버전 설정

### 현재 상황
- ChatGPT 데스크탑 앱 설치됨
- 웹 브라우저 extension과는 다른 설정 방법 필요
- 데스크탑 앱 전용 연동 방법 사용

## 🔧 데스크탑 버전 연동 방법

### 방법 1: ChatGPT 데스크탑 앱 설정

1. **ChatGPT 데스크탑 앱 실행**
   - Applications 폴더에서 ChatGPT 앱 실행
   - 또는 Spotlight (Cmd+Space)에서 "ChatGPT" 검색

2. **설정 메뉴 접속**
   - 좌측 하단 프로필 아이콘 클릭
   - "Settings" 또는 "설정" 클릭

3. **앱 연동 설정**
   - "Apps" 또는 "앱 연동" 탭 클릭
   - "Work with Apps" 섹션에서 Cursor 찾기
   - "Install Extension" 클릭

### 방법 2: 데스크탑 앱 권한 설정

1. **시스템 환경설정**
   - Apple 메뉴 → 시스템 환경설정
   - "보안 및 개인 정보 보호" 클릭
   - "개인 정보 보호" 탭 선택

2. **파일 및 폴더 접근 권한**
   - 좌측 목록에서 "파일 및 폴더" 선택
   - ChatGPT 앱 찾기
   - 다음 권한 체크:
     - [x] Documents 폴더
     - [x] Desktop 폴더
     - [x] Downloads 폴더

3. **전체 디스크 접근 권한**
   - 좌측 목록에서 "전체 디스크 접근" 선택
   - ChatGPT 앱 추가
   - 권한 허용

### 방법 3: 프로젝트 폴더 직접 지정

1. **ChatGPT에서 프로젝트 경로 설정**
   ```
   /Users/jack/Documents/breath-trainer-main
   ```

2. **폴더 권한 확인**
   ```bash
   # 프로젝트 폴더 권한 확인
   ls -la /Users/jack/Documents/breath-trainer-main
   
   # 읽기 권한 부여 (필요시)
   chmod -R 755 /Users/jack/Documents/breath-trainer-main
   ```

## 🚀 권장 해결 방법

### 즉시 해결: Cursor AI 웹사이트 사용
1. **Cursor AI 웹사이트 방문**
   ```
   https://cursor.sh
   ```

2. **프로젝트 업로드**
   - "Upload Project" 클릭
   - `/Users/jack/Documents/breath-trainer-main` 폴더 선택
   - 또는 파일들을 직접 드래그 앤 드롭

3. **ChatGPT와 연동**
   - Cursor AI에서 직접 ChatGPT와 대화
   - 프로젝트 컨텍스트 자동 제공

### 장기적 해결: 로컬 Cursor 앱 설치

1. **Cursor 앱 다운로드**
   ```bash
   # Homebrew로 설치
   brew install --cask cursor
   
   # 또는 수동 설치
   # https://cursor.sh/download 에서 다운로드
   ```

2. **프로젝트 열기**
   - Cursor 앱 실행
   - "Open Folder" 클릭
   - `/Users/jack/Documents/breath-trainer-main` 선택

3. **ChatGPT와 연동**
   - Cursor 앱에서 ChatGPT 기능 사용
   - 완전한 통합 환경 제공

## 🔧 데스크탑 앱 전용 설정

### ChatGPT 데스크탑 앱 설정 파일
```json
// ~/Library/Application Support/ChatGPT/config.json
{
  "appIntegrations": {
    "cursor": {
      "enabled": true,
      "projectPath": "/Users/jack/Documents/breath-trainer-main",
      "autoSync": true
    }
  },
  "permissions": {
    "fileAccess": true,
    "fullDiskAccess": true
  }
}
```

### 환경 변수 설정
```bash
# ~/.zshrc에 추가
export CHATGPT_DESKTOP_ENABLED=true
export CHATGPT_CURSOR_PROJECT_PATH="/Users/jack/Documents/breath-trainer-main"
export CHATGPT_APP_INTEGRATIONS=true
```

## 🚨 문제 해결

### 데스크탑 앱에서 Cursor가 인식되지 않는 경우

1. **앱 재시작**
   - ChatGPT 데스크탑 앱 완전 종료
   - 앱 재시작

2. **권한 재설정**
   - 시스템 환경설정 → 보안 및 개인 정보 보호
   - ChatGPT 앱 권한 제거 후 재설정

3. **캐시 삭제**
   ```bash
   # ChatGPT 데스크탑 앱 캐시 삭제
   rm -rf ~/Library/Application\ Support/ChatGPT/Cache
   rm -rf ~/Library/Caches/ChatGPT
   ```

### 대안 방법

#### 방법 1: 웹 브라우저 사용
1. Safari/Chrome에서 chat.openai.com 접속
2. 웹 버전에서 Cursor extension 설치
3. 프로젝트 연동

#### 방법 2: VS Code + ChatGPT Extension
1. VS Code 설치
2. ChatGPT Extension 설치
3. 프로젝트 폴더 열기

#### 방법 3: Cursor AI 직접 사용
1. https://cursor.sh 방문
2. 프로젝트 업로드
3. 완전한 기능 사용

## 📋 체크리스트

- [ ] ChatGPT 데스크탑 앱 실행됨
- [ ] 시스템 권한 설정됨
- [ ] 프로젝트 경로 지정됨
- [ ] 파일 접근 권한 확인됨
- [ ] 앱 재시작 완료
- [ ] Cursor AI 웹사이트 시도
- [ ] 로컬 Cursor 앱 설치 고려

## 🆘 추가 지원

### ChatGPT 데스크탑 앱 지원
- 공식 지원: help.openai.com
- 앱 내 설정 → 도움말

### Cursor AI 지원
- 웹사이트: https://cursor.sh
- 지원: support@cursor.sh
- Discord: https://discord.gg/cursor

## 💡 팁

1. **데스크탑 앱 vs 웹 버전**
   - 데스크탑 앱: 더 안정적, 시스템 통합
   - 웹 버전: extension 지원, 업데이트 빠름

2. **권장 워크플로우**
   - 개발: Cursor AI 웹사이트 또는 로컬 앱
   - 대화: ChatGPT 데스크탑 앱
   - 통합: VS Code + ChatGPT Extension
