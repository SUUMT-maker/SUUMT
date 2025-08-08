#!/bin/bash

echo "🧹 브라우저 캐시 삭제 중..."

# Chrome 캐시 삭제
echo "📱 Chrome 캐시 삭제..."
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Cache
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Code\ Cache
rm -rf ~/Library/Caches/Google/Chrome

# Safari 캐시 삭제
echo "🍎 Safari 캐시 삭제..."
rm -rf ~/Library/Caches/com.apple.Safari
rm -rf ~/Library/Safari/LocalStorage

# Firefox 캐시 삭제
echo "🦊 Firefox 캐시 삭제..."
rm -rf ~/Library/Caches/Firefox
rm -rf ~/Library/Application\ Support/Firefox/Profiles/*/cache2

# 기타 브라우저 캐시 삭제
echo "🌐 기타 브라우저 캐시 삭제..."
rm -rf ~/Library/Caches/com.microsoft.edgemac
rm -rf ~/Library/Application\ Support/Microsoft\ Edge/Default/Cache

# 시스템 캐시 삭제
echo "💻 시스템 캐시 삭제..."
sudo rm -rf /Library/Caches/*
rm -rf ~/Library/Caches/*

echo "✅ 브라우저 캐시 삭제 완료!"
echo "🔄 이제 브라우저를 완전히 종료하고 다시 시작하세요."
echo "🎯 ChatGPT에서 Cursor extension을 다시 시도해보세요."
