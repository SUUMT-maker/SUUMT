# SUUMT v2 - AI 호흡 트레이너

AI 기반 호흡 트레이너로 건강한 호흡을 만들어보세요.

## 🚀 프로젝트 개요

SUUMT v2는 기존 SUUMT 프로젝트의 완전히 새로운 프론트엔드 버전입니다. 기존 Supabase 백엔드를 그대로 활용하면서 모던하고 직관적인 사용자 인터페이스를 제공합니다.

## ✨ 주요 기능

- **🤖 AI 기반 호흡 트레이닝**: 개인화된 호흡 운동 가이드
- **📊 실시간 운동 기록**: 상세한 운동 데이터 추적
- **🎯 목표 달성률**: 일일 목표 설정 및 달성률 표시
- **📱 PWA 지원**: 오프라인 사용 및 앱 설치 가능
- **🔐 카카오 로그인**: 간편한 소셜 로그인

## 🛠️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 모던 스타일링 및 반응형 디자인
- **Vanilla JavaScript**: ES6+ 모듈 시스템
- **PWA**: Service Worker, Manifest

### Backend (기존 유지)
- **Supabase**: 데이터베이스 및 인증
- **PostgreSQL**: 관계형 데이터베이스
- **Edge Functions**: AI 조언 생성

## 📁 프로젝트 구조

```
suumt-v2/
├── public/
│   ├── assets/          # 이미지, 아이콘 등 정적 파일
│   ├── manifest.json    # PWA 매니페스트
│   └── service-worker.js # PWA 서비스 워커
├── src/
│   ├── index.html       # 메인 HTML 파일
│   ├── css/
│   │   └── style.css    # 메인 스타일시트
│   └── js/
│       ├── app.js       # 메인 앱 로직
│       ├── auth.js      # 인증 관련
│       ├── supabase.js  # Supabase 설정
│       ├── home.js      # 홈 탭 기능
│       ├── records.js   # 기록 탭 기능
│       └── utils.js     # 유틸리티 함수
└── README.md
```

## 🚀 시작하기

### 1. 프로젝트 클론
```bash
git clone https://github.com/SUUMT-maker/SUUMT.git
cd SUUMT
```

### 2. 로컬 서버 실행
```bash
# Python 3
python -m http.server 8000

# 또는 Node.js
npx serve .

# 또는 Live Server (VS Code 확장)
```

### 3. 브라우저에서 접속
```
http://localhost:8000/src/index.html
```

## 🔧 개발 가이드

### 탭 구조
- **홈 탭**: AI 메시지, 오늘의 요약, 목표 달성률
- **기록 탭**: 운동 기록 및 통계 (준비 중)
- **설정 탭**: 사용자 설정 및 로그아웃

### 시간대 처리
- **UTC → KST 변환**: `toKSTDateString()` 함수 사용
- **데이터베이스**: UTC 기준 저장
- **표시**: KST 기준 표시

### PWA 기능
- **오프라인 지원**: Service Worker 캐싱
- **앱 설치**: Manifest 설정
- **백그라운드 동기화**: 네트워크 복구 시 데이터 동기화

## 📱 PWA 설치

1. 브라우저에서 앱 접속
2. 주소창 옆 설치 아이콘 클릭
3. "SUUMT 설치" 선택
4. 홈 화면에 앱 아이콘 생성

## 🔐 인증

### 카카오 로그인
- Supabase OAuth 설정 활용
- 기존 카카오 개발자 앱 연동
- 사용자 동의 기록 유지

## 📊 데이터베이스

### 기존 테이블 구조 유지
- **exercise_sessions**: 운동 세션 데이터
- **ai_advice**: AI 조언 데이터

### 주요 컬럼
```sql
exercise_sessions:
- id (UUID)
- user_id (TEXT)
- created_at (TIMESTAMP)
- exercise_time (TEXT)
- completed_sets (INTEGER)
- completed_breaths (INTEGER)
- inhale_resistance (INTEGER)
- exhale_resistance (INTEGER)
- user_feedback (TEXT)
- is_aborted (BOOLEAN)
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#667eea` (보라색)
- **Secondary**: `#764ba2` (진보라색)
- **Background**: `#f8f9fa` (연회색)
- **Text**: `#333333` (진회색)

### 타이포그래피
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI'
- **Responsive**: 모바일 우선 디자인

## 🔄 버전 관리

### Git 브랜치
- **main**: 최신 안정 버전
- **backup-old-version**: 이전 버전 백업

### 커밋 컨벤션
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `style:` 스타일 변경
- `refactor:` 코드 리팩토링

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**SUUMT v2** - 건강한 호흡, 건강한 삶 🌬️
