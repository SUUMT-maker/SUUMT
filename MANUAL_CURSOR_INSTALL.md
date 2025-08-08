# Cursor Extension 수동 설치 가이드

## 🚨 ChatGPT에서 "Requires extension" 문제 해결

### 현재 상황
- ChatGPT에서 Cursor가 "Requires extension" 상태로 표시됨
- 자동 설치가 작동하지 않음
- 수동 설치 필요

## 🔧 수동 설치 방법

### 방법 1: Cursor AI 웹사이트에서 직접 사용

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

### 방법 2: 로컬 Cursor 앱 설치

1. **Cursor 앱 다운로드**
   ```
   https://cursor.sh/download
   ```

2. **macOS용 Cursor 설치**
   ```bash
   # Homebrew로 설치
   brew install --cask cursor
   
   # 또는 수동 설치
   # 1. 다운로드한 .dmg 파일 실행
   # 2. Applications 폴더로 드래그
   # 3. Cursor 앱 실행
   ```

3. **프로젝트 열기**
   - Cursor 앱 실행
   - "Open Folder" 클릭
   - `/Users/jack/Documents/breath-trainer-main` 선택

### 방법 3: VS Code + Cursor Extension

1. **VS Code 설치** (이미 설치되어 있다면 생략)
   ```bash
   brew install --cask visual-studio-code
   ```

2. **Cursor Extension 설치**
   - VS Code 실행
   - Extensions 탭 (Cmd+Shift+X)
   - "Cursor" 검색
   - Cursor Extension 설치

3. **프로젝트 열기**
   - VS Code에서 프로젝트 폴더 열기
   - Cursor 기능 사용

### 방법 4: 브라우저 Extension 수동 설치

1. **Chrome Extension 수동 설치**
   ```bash
   # Extension 파일 다운로드
   mkdir -p ~/Downloads/cursor-extension
   cd ~/Downloads/cursor-extension
   
   # Extension 파일 생성 (예시)
   cat > manifest.json << 'EOF'
   {
     "manifest_version": 3,
     "name": "Cursor AI",
     "version": "1.0",
     "description": "Cursor AI for ChatGPT",
     "permissions": ["activeTab", "storage"],
     "content_scripts": [
       {
         "matches": ["https://chat.openai.com/*"],
         "js": ["content.js"]
       }
     ]
   }
   EOF
   ```

2. **Chrome에서 로드**
   - Chrome에서 `chrome://extensions/` 접속
   - "개발자 모드" 활성화
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - `~/Downloads/cursor-extension` 폴더 선택

## 🎯 권장 해결 방법

### 즉시 해결: Cursor AI 웹사이트 사용
1. https://cursor.sh 방문
2. 프로젝트 업로드
3. ChatGPT와 직접 연동

### 장기적 해결: 로컬 Cursor 앱
1. Cursor 앱 다운로드 및 설치
2. 프로젝트 폴더 열기
3. 완전한 기능 사용

## 🚨 문제 해결 체크리스트

- [ ] 브라우저 캐시 삭제 완료
- [ ] 브라우저 재시작 완료
- [ ] ChatGPT 새로고침 완료
- [ ] Cursor AI 웹사이트 접속 시도
- [ ] 로컬 Cursor 앱 설치 고려
- [ ] VS Code + Cursor Extension 고려

## 💡 추가 팁

### ChatGPT에서 직접 사용하는 방법
1. ChatGPT에서 프로젝트 파일들을 직접 복사/붙여넣기
2. 코드 변경사항을 수동으로 적용
3. 파일별로 작업 진행

### 대안 도구들
- **GitHub Copilot**: VS Code에서 사용
- **CodeWhisperer**: AWS의 AI 코딩 도구
- **Tabnine**: AI 코드 완성 도구

## 🆘 지원

- Cursor AI 지원: support@cursor.sh
- GitHub Issues: https://github.com/getcursor/cursor/issues
- Discord 커뮤니티: https://discord.gg/cursor
