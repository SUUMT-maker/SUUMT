# SUUMT v2 - AI 기반 호흡 트레이너

AI 기반 호흡 트레이너 웹앱으로 건강한 호흡을 만들어보세요.

## 🚀 개발 서버 실행

### Python HTTP 서버 (권장)
```bash
# 프로젝트 루트에서 실행
python3 -m http.server 8000

# 브라우저에서 접속
http://localhost:8000/index.html
```

### Node.js 서버
```bash
# npx serve 사용
npx serve .

# 또는 live-server 사용
npx live-server
```

## 📁 프로젝트 구조

```
breath-trainer-main/
├── index.html              # 메인 진입점
├── vercel.json             # Vercel 배포 설정
├── src/
│   ├── css/
│   │   └── style.css       # 메인 스타일시트
│   └── js/
│       ├── components/     # UI 컴포넌트들
│       ├── app.js          # 메인 앱 로직
│       ├── auth.js         # 인증 관련
│       └── ...
└── public/
    ├── assets/             # PWA 아이콘들
    ├── manifest.json       # PWA 매니페스트
    └── service-worker.js   # 서비스 워커
```

## 🧪 테스트

브라우저 개발자 도구 콘솔에서:

```javascript
// 통합 상태 체크
checkIntegration()

// 전체 훈련 플로우 테스트
testSession()

// 빠른 세션 테스트
testQuickSession()

// 개별 컴포넌트 테스트
testCountdown()
testRest()
testEffortSurvey()
```

## 🔧 주요 기능

- ✅ 카카오 로그인
- ✅ 호흡 훈련 세션
- ✅ 세트 간 휴식 + 퀴즈
- ✅ 난이도 평가
- ✅ 운동 기록 관리
- ✅ PWA 지원

## 🚀 배포

Vercel을 통한 자동 배포:
- GitHub 저장소 연결
- `vercel.json` 설정으로 SPA 라우팅 지원
- 모든 경로가 `index.html`로 fallback

## 📱 PWA 기능

- 홈 화면에 추가 가능
- 오프라인 지원
- 푸시 알림 (준비 중)

## 🔗 기술 스택

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Supabase (Auth, Database)
- **Deployment**: Vercel
- **PWA**: Service Worker, Web App Manifest
