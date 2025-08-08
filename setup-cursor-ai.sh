#!/bin/bash

# Cursor AI 환경 변수 설정 스크립트
echo "🔧 Cursor AI 환경 변수 설정 중..."

# 현재 프로젝트 경로 설정
export CURSOR_AI_ENABLED=true
export CURSOR_AI_PROJECT_PATH="/Users/jack/Documents/breath-trainer-main"
export CURSOR_AI_CONFIG_PATH="/Users/jack/Documents/breath-trainer-main/.cursor-ai-config.json"

# 환경 변수 영구 설정 (zsh 사용)
echo 'export CURSOR_AI_ENABLED=true' >> ~/.zshrc
echo 'export CURSOR_AI_PROJECT_PATH="/Users/jack/Documents/breath-trainer-main"' >> ~/.zshrc
echo 'export CURSOR_AI_CONFIG_PATH="/Users/jack/Documents/breath-trainer-main/.cursor-ai-config.json"' >> ~/.zshrc

# 환경 변수 확인
echo "✅ 환경 변수 설정 완료:"
echo "CURSOR_AI_ENABLED: $CURSOR_AI_ENABLED"
echo "CURSOR_AI_PROJECT_PATH: $CURSOR_AI_PROJECT_PATH"
echo "CURSOR_AI_CONFIG_PATH: $CURSOR_AI_CONFIG_PATH"

# 파일 권한 확인
echo "📁 파일 권한 확인 중..."
ls -la .cursor-ai-config.json

# 브라우저 캐시 삭제 안내
echo "🌐 브라우저 캐시 삭제를 위해 다음을 실행하세요:"
echo "1. Chrome: Cmd+Shift+Delete"
echo "2. Safari: Cmd+Option+E"
echo "3. Firefox: Cmd+Shift+Delete"

echo "🔄 터미널을 재시작하거나 다음 명령어를 실행하세요:"
echo "source ~/.zshrc"

echo "🎯 이제 ChatGPT에서 Cursor AI extension을 다시 시도해보세요!"
