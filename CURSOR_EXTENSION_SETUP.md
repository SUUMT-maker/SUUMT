# ChatGPT-Cursor Extension 설치 문제 해결 가이드

## 🚨 현재 문제 상황
ChatGPT에서 Cursor가 "Requires extension" 상태로 표시되어 있음
→ Extension이 제대로 설치되지 않았거나 인식되지 않고 있음

## 🔧 단계별 해결 방법

### 1단계: 브라우저별 Extension 설치

#### Chrome 브라우저
1. **Chrome Web Store에서 Cursor Extension 설치**
   - [Cursor Extension for Chrome](https://chrome.google.com/webstore/detail/cursor-ai/...) 방문
   - "Add to Chrome" 클릭
   - 설치 완료 후 브라우저 재시작

2. **수동 설치 (Chrome Web Store에 없는 경우)**
   ```bash
   # Cursor Extension 다운로드
   curl -O https://download.cursor.sh/extension/chrome.zip
   unzip chrome.zip
   
   # Chrome 확장 프로그램 페이지 열기
   chrome://extensions/
   
   # "개발자 모드" 활성화
   # "압축해제된 확장 프로그램을 로드합니다" 클릭
   # 다운로드한 폴더 선택
   ```

#### Safari 브라우저
1. **Safari 확장 프로그램 설치**
   - Safari → 환경설정 → 확장 프로그램
   - Cursor Extension 검색 및 설치
   - Safari 재시작

#### Firefox 브라우저
1. **Firefox Add-ons에서 설치**
   - [Firefox Add-ons](https://addons.mozilla.org/) 방문
   - Cursor Extension 검색 및 설치
   - Firefox 재시작

### 2단계: Extension 권한 설정

#### Chrome
1. `chrome://extensions/` 접속
2. Cursor Extension 찾기
3. "세부정보" 클릭
4. 다음 권한 확인:
   - [x] 파일 URL에 대한 액세스 허용
   - [x] 모든 사이트에서 읽기 및 변경 허용
   - [x] 백그라운드에서 실행 허용

#### Safari
1. Safari → 환경설정 → 확장 프로그램
2. Cursor Extension 선택
3. "웹사이트" 탭에서 "모든 웹사이트" 선택

### 3단계: ChatGPT에서 Extension 활성화

1. **ChatGPT 새로고침**
   - `Cmd+R` (Mac) 또는 `Ctrl+R` (Windows)

2. **Extension 재설정**
   - ChatGPT → 설정 → 앱 연동
   - Cursor Extension 제거 후 재설치

3. **브라우저 캐시 완전 삭제**
   ```bash
   # Chrome
   rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Cache
   
   # Safari
   rm -rf ~/Library/Caches/com.apple.Safari
   
   # Firefox
   rm -rf ~/Library/Caches/Firefox
   ```

### 4단계: 프로젝트 경로 설정

1. **Cursor Extension 설정**
   - Extension 아이콘 클릭
   - "Settings" 또는 "설정" 클릭
   - 프로젝트 경로 설정:
     ```
     /Users/jack/Documents/breath-trainer-main
     ```

2. **권한 확인**
   ```bash
   # 프로젝트 폴더 권한 확인
   ls -la /Users/jack/Documents/breath-trainer-main
   
   # 읽기 권한 부여 (필요시)
   chmod -R 755 /Users/jack/Documents/breath-trainer-main
   ```

### 5단계: 대안 방법

#### 방법 1: Cursor AI 직접 사용
1. [Cursor AI 웹사이트](https://cursor.sh) 방문
2. 프로젝트 직접 업로드
3. ChatGPT와 별도로 사용

#### 방법 2: VS Code Extension 사용
1. VS Code에서 Cursor Extension 설치
2. ChatGPT와 VS Code 연동
3. 프로젝트 작업

#### 방법 3: 로컬 Cursor 앱 사용
1. [Cursor 앱 다운로드](https://cursor.sh/download)
2. 로컬에서 설치
3. ChatGPT와 연동

## 🚨 문제 해결 체크리스트

- [ ] 브라우저 Extension 설치됨
- [ ] Extension 권한 설정됨
- [ ] 브라우저 캐시 삭제됨
- [ ] ChatGPT 새로고침됨
- [ ] 프로젝트 경로 설정됨
- [ ] 파일 권한 확인됨

## 🆘 추가 문제 해결

### Extension이 설치되지 않는 경우
1. 브라우저 버전 확인 (최신 버전 권장)
2. 방화벽/보안 소프트웨어 확인
3. 다른 브라우저로 시도

### Extension이 인식되지 않는 경우
1. 브라우저 재시작
2. Extension 비활성화 후 재활성화
3. ChatGPT 계정 재로그인

### 프로젝트 접근이 안 되는 경우
1. 프로젝트 경로 정확성 확인
2. 파일 시스템 권한 확인
3. 프로젝트 폴더가 존재하는지 확인

## 📞 지원 연락처

- Cursor AI 지원: support@cursor.sh
- ChatGPT 지원: help.openai.com
- 브라우저별 지원 페이지 참조
