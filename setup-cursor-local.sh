#!/bin/bash

echo "🎯 Cursor 로컬 앱 설정 중..."

# Cursor 앱이 설치되어 있는지 확인
if [ ! -d "/Applications/Cursor.app" ]; then
    echo "❌ Cursor 앱이 설치되어 있지 않습니다."
    echo "다음 명령어로 설치하세요:"
    echo "brew install --cask cursor"
    exit 1
fi

echo "✅ Cursor 앱이 설치되어 있습니다."

# Cursor 설정 디렉토리 생성
mkdir -p ~/.cursor

# Cursor 프로젝트 설정 파일 생성
cat > ~/.cursor/settings.json << 'EOF'
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
  },
  "editor": {
    "autoSave": true,
    "formatOnSave": true,
    "tabSize": 2
  }
}
EOF

# 환경 변수 설정
export CURSOR_CHATGPT_ENABLED=true
export CURSOR_PROJECT_PATH="/Users/jack/Documents/breath-trainer-main"

# 환경 변수 영구 설정
echo 'export CURSOR_CHATGPT_ENABLED=true' >> ~/.zshrc
echo 'export CURSOR_PROJECT_PATH="/Users/jack/Documents/breath-trainer-main"' >> ~/.zshrc

# 프로젝트 폴더 권한 확인
echo "📁 프로젝트 폴더 권한 확인 중..."
ls -la /Users/jack/Documents/breath-trainer-main

# Cursor 앱에서 프로젝트 열기
echo "🚀 Cursor 앱에서 프로젝트 열기..."
open -a Cursor /Users/jack/Documents/breath-trainer-main

echo ""
echo "✅ Cursor 로컬 앱 설정 완료!"
echo ""
echo "🔄 다음 단계:"
echo "1. Cursor 앱이 열리면 프로젝트 파일들이 표시됩니다"
echo "2. Cmd+Shift+L을 눌러 ChatGPT 패널을 엽니다"
echo "3. ChatGPT 계정으로 로그인합니다"
echo "4. 프로젝트 컨텍스트가 자동으로 전달되는지 확인합니다"
echo ""
echo "💡 사용 팁:"
echo "- Cmd+Shift+L: ChatGPT 열기"
echo "- Cmd+K: 코드 제안"
echo "- Cmd+Shift+P: 명령 팔레트"
echo ""
echo "🎯 테스트:"
echo "ChatGPT에 '이 프로젝트의 구조를 설명해줘'라고 질문해보세요"
