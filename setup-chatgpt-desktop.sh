#!/bin/bash

echo "🖥️ ChatGPT 데스크탑 앱 환경 변수 설정 중..."

# ChatGPT 데스크탑 앱 환경 변수 설정
export CHATGPT_DESKTOP_ENABLED=true
export CHATGPT_CURSOR_PROJECT_PATH="/Users/jack/Documents/breath-trainer-main"
export CHATGPT_APP_INTEGRATIONS=true

# 환경 변수 영구 설정 (zsh 사용)
echo 'export CHATGPT_DESKTOP_ENABLED=true' >> ~/.zshrc
echo 'export CHATGPT_CURSOR_PROJECT_PATH="/Users/jack/Documents/breath-trainer-main"' >> ~/.zshrc
echo 'export CHATGPT_APP_INTEGRATIONS=true' >> ~/.zshrc

# ChatGPT 데스크탑 앱 설정 디렉토리 생성
mkdir -p ~/Library/Application\ Support/ChatGPT

# ChatGPT 데스크탑 앱 설정 파일 생성
cat > ~/Library/Application\ Support/ChatGPT/config.json << 'EOF'
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
EOF

# 환경 변수 확인
echo "✅ ChatGPT 데스크탑 앱 환경 변수 설정 완료:"
echo "CHATGPT_DESKTOP_ENABLED: $CHATGPT_DESKTOP_ENABLED"
echo "CHATGPT_CURSOR_PROJECT_PATH: $CHATGPT_CURSOR_PROJECT_PATH"
echo "CHATGPT_APP_INTEGRATIONS: $CHATGPT_APP_INTEGRATIONS"

# 프로젝트 폴더 권한 확인
echo "📁 프로젝트 폴더 권한 확인 중..."
ls -la /Users/jack/Documents/breath-trainer-main

# ChatGPT 데스크탑 앱 캐시 삭제
echo "🧹 ChatGPT 데스크탑 앱 캐시 삭제 중..."
rm -rf ~/Library/Application\ Support/ChatGPT/Cache 2>/dev/null
rm -rf ~/Library/Caches/ChatGPT 2>/dev/null

echo ""
echo "🔄 다음 단계:"
echo "1. ChatGPT 데스크탑 앱을 완전히 종료하세요"
echo "2. 시스템 환경설정 → 보안 및 개인 정보 보호에서 권한 설정"
echo "3. ChatGPT 데스크탑 앱을 다시 시작하세요"
echo "4. 설정 → 앱 연동에서 Cursor를 찾아보세요"
echo ""
echo "💡 권장 방법:"
echo "- Cursor AI 웹사이트 (https://cursor.sh) 방문"
echo "- 프로젝트 폴더를 직접 업로드하여 사용"
echo "- 로컬 Cursor 앱 설치 고려"
