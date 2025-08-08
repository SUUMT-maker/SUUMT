#!/bin/bash

echo "🧹 안전한 브라우저 캐시 삭제 중..."

# 사용자 권한으로만 삭제 가능한 캐시들
echo "📱 사용자 캐시 삭제..."

# Chrome 사용자 캐시
if [ -d "$HOME/Library/Application Support/Google/Chrome/Default/Cache" ]; then
    rm -rf "$HOME/Library/Application Support/Google/Chrome/Default/Cache"
    echo "✅ Chrome 사용자 캐시 삭제됨"
fi

# Safari 사용자 캐시
if [ -d "$HOME/Library/Caches/com.apple.Safari" ]; then
    rm -rf "$HOME/Library/Caches/com.apple.Safari"
    echo "✅ Safari 사용자 캐시 삭제됨"
fi

# Firefox 사용자 캐시
if [ -d "$HOME/Library/Caches/Firefox" ]; then
    rm -rf "$HOME/Library/Caches/Firefox"
    echo "✅ Firefox 사용자 캐시 삭제됨"
fi

# Edge 사용자 캐시
if [ -d "$HOME/Library/Caches/com.microsoft.edgemac" ]; then
    rm -rf "$HOME/Library/Caches/com.microsoft.edgemac"
    echo "✅ Edge 사용자 캐시 삭제됨"
fi

echo "✅ 안전한 캐시 삭제 완료!"
echo ""
echo "🔄 다음 단계:"
echo "1. 모든 브라우저를 완전히 종료하세요"
echo "2. 브라우저를 다시 시작하세요"
echo "3. ChatGPT에 접속하세요"
echo "4. 설정 → 앱 연동에서 Cursor extension을 다시 시도해보세요"
echo ""
echo "💡 만약 여전히 문제가 있다면:"
echo "- 다른 브라우저로 시도해보세요"
echo "- Cursor extension을 수동으로 설치해보세요"
echo "- Cursor AI 웹사이트에서 직접 사용해보세요"
