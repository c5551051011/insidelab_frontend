# InsideLab - React & Flutter

InsideLab은 대학원 연구실 정보와 리뷰를 제공하는 플랫폼입니다. React 웹 버전과 Flutter 모바일/웹 버전을 모두 포함합니다.

---

## 🌐 React Frontend

Flutter 앱과 완전히 동일한 디자인과 기능을 가진 React 기반 InsideLab 프론트엔드입니다.

### 🚀 시작하기

#### 필수 요구사항
- Node.js 16 이상
- npm 또는 yarn

#### 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 개발 서버 시작
```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속할 수 있습니다.

### 📁 React 프로젝트 구조

```
src/
├── components/              # 재사용 가능한 컴포넌트
├── pages/                  # 페이지 컴포넌트
├── lib/                    # 유틸리티 및 서비스
│   └── analytics/          # GA4, Amplitude 이벤트 트래킹
├── theme/                  # 테마 시스템
├── App.js                  # 메인 앱 컴포넌트
└── index.js                # 엔트리 포인트
```

### 🛠 기술 스택

- **React 18** - UI 라이브러리
- **React Router** - 라우팅
- **Lucide React** - 아이콘
- **Axios** - HTTP 클라이언트
- **Google Analytics 4** - 사용자 행동 분석
- **Amplitude** - 이벤트 트래킹

### 📊 Analytics 트래킹

다음 이벤트들이 자동으로 트래킹됩니다:
- `page_view` - 페이지 방문 (UTM 파라미터 포함)
- `search_performed` - 검색 실행
- `filter_changed` - 필터 변경
- `lab_viewed` - 랩 상세 조회
- `lab_favorite_added/removed` - 북마크 추가/제거
- `review_write_started` - 리뷰 작성 시작

---

## 📱 Flutter Application

크로스 플랫폼 모바일 및 웹 애플리케이션

### Getting Started

이 프로젝트는 Flutter로 작성된 크로스 플랫폼 애플리케이션입니다.

Flutter 개발을 처음 시작하는 경우 다음 리소스를 참고하세요:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

자세한 내용은 [Flutter 공식 문서](https://docs.flutter.dev/)를 참조하세요.

---

## 🔗 관련 문서

- `BACKEND_INTEGRATION.md` - 백엔드 API 연동 가이드
- `DEPLOYMENT.md` - 배포 가이드
- `GOOGLE_AUTH_SETUP.md` - Google 인증 설정
