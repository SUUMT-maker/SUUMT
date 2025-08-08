# macOS ChatGPT 데스크탑 앱 권한 설정 가이드

## 🔐 시스템 권한 설정

### 1단계: 시스템 환경설정 접속

1. **Apple 메뉴 클릭**
   - 화면 좌측 상단 Apple 로고 클릭
   - "시스템 환경설정" 선택

2. **보안 및 개인 정보 보호**
   - "보안 및 개인 정보 보호" 클릭
   - 잠금 아이콘 클릭하여 설정 변경 허용

### 2단계: 파일 및 폴더 접근 권한

1. **개인 정보 보호 탭**
   - "개인 정보 보호" 탭 클릭
   - 좌측 목록에서 "파일 및 폴더" 선택

2. **ChatGPT 앱 권한 설정**
   - ChatGPT 앱 찾기
   - 다음 권한들을 체크:
     - [x] Documents 폴더
     - [x] Desktop 폴더
     - [x] Downloads 폴더
     - [x] 전체 디스크 접근

### 3단계: 전체 디스크 접근 권한

1. **전체 디스크 접근**
   - 좌측 목록에서 "전체 디스크 접근" 선택
   - "+" 버튼 클릭
   - Applications 폴더에서 ChatGPT 앱 선택
   - 권한 허용

### 4단계: 입력 모니터링 권한

1. **입력 모니터링**
   - 좌측 목록에서 "입력 모니터링" 선택
   - ChatGPT 앱 추가
   - 권한 허용

## 🚨 권한 설정 후 확인사항

### ChatGPT 데스크탑 앱에서 확인

1. **앱 재시작**
   - ChatGPT 데스크탑 앱 완전 종료
   - 앱 재시작

2. **설정 확인**
   - 좌측 하단 프로필 아이콘 클릭
   - "Settings" 또는 "설정" 클릭
   - "Apps" 또는 "앱 연동" 탭 확인

3. **Cursor 연동 확인**
   - "Work with Apps" 섹션에서 Cursor 찾기
   - "Install Extension" 또는 "연결" 버튼 확인

## 🔧 문제 해결

### 권한이 거부되는 경우

1. **시스템 환경설정 재설정**
   ```bash
   # 시스템 환경설정 캐시 삭제
   sudo rm -rf /Library/Preferences/com.apple.security.plist
   sudo rm -rf ~/Library/Preferences/com.apple.security.plist
   ```

2. **ChatGPT 앱 재설치**
   - Applications 폴더에서 ChatGPT 앱 삭제
   - App Store에서 재설치

3. **시스템 재시작**
   - macOS 재시작
   - 권한 설정 다시 시도

### Cursor가 여전히 인식되지 않는 경우

1. **대안 방법 1: Cursor AI 웹사이트**
   ```
   https://cursor.sh
   ```
   - 프로젝트 폴더 직접 업로드
   - ChatGPT와 완전 연동

2. **대안 방법 2: 로컬 Cursor 앱**
   ```bash
   # Homebrew로 설치
   brew install --cask cursor
   ```

3. **대안 방법 3: VS Code + ChatGPT Extension**
   ```bash
   # VS Code 설치
   brew install --cask visual-studio-code
   ```

## 📋 권한 설정 체크리스트

- [ ] 시스템 환경설정 접속됨
- [ ] 보안 및 개인 정보 보호 설정됨
- [ ] 파일 및 폴더 접근 권한 허용됨
- [ ] 전체 디스크 접근 권한 허용됨
- [ ] 입력 모니터링 권한 허용됨
- [ ] ChatGPT 데스크탑 앱 재시작됨
- [ ] 앱 연동 설정 확인됨
- [ ] Cursor extension 설치 시도됨

## 🆘 추가 지원

### macOS 지원
- Apple 지원: https://support.apple.com
- 시스템 환경설정 도움말

### ChatGPT 데스크탑 앱 지원
- 공식 지원: help.openai.com
- 앱 내 설정 → 도움말

### Cursor AI 지원
- 웹사이트: https://cursor.sh
- 지원: support@cursor.sh
- Discord: https://discord.gg/cursor

## 💡 권장 워크플로우

### 즉시 사용 가능한 방법
1. **Cursor AI 웹사이트 사용**
   - https://cursor.sh 방문
   - 프로젝트 폴더 업로드
   - ChatGPT와 직접 연동

### 장기적 해결책
1. **로컬 Cursor 앱 설치**
   - 완전한 기능 제공
   - 오프라인 사용 가능
   - 시스템 통합

2. **VS Code + ChatGPT Extension**
   - 안정적인 개발 환경
   - 다양한 extension 지원
   - 커스터마이징 가능
