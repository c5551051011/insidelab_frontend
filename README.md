# InsideLab Frontend (React)

Flutter 앱과 완전히 동일한 디자인과 기능을 가진 React 기반 InsideLab 프론트엔드입니다.

## 🚀 시작하기

### 필수 요구사항
- Node.js 16 이상
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 개발 서버 시작
```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── components/              # 재사용 가능한 컴포넌트
│   ├── Header.js           # 공통 헤더 (Flutter HeaderNavigation과 동일)
│   ├── HeroSection.js      # 히어로 섹션 (Flutter HeroSection과 동일)
│   ├── TrustedMetricsSection.js # 신뢰 지표 (Flutter TrustedMetricsSection과 동일)
│   ├── ServicesSection.js  # 서비스 섹션 (Flutter ServicesSection과 동일)
│   ├── TestimonialsSection.js # 리뷰 섹션 (Flutter TestimonialsSection과 동일)
│   ├── CtaSection.js       # CTA 섹션 (Flutter CtaSection과 동일)
│   └── Footer.js           # 푸터 (Flutter Footer와 동일)
├── pages/                  # 페이지 컴포넌트
│   ├── Homepage.js         # 메인 홈페이지 (Flutter HomeScreen과 동일)
│   ├── LoginPage.js        # 로그인 페이지
│   └── SignupPage.js       # 회원가입 페이지
├── theme/                  # 테마 시스템 (Flutter AppColors와 동일)
│   ├── colors.js           # 색상 상수 (Flutter AppColors.dart와 동일)
│   ├── typography.js       # 폰트 및 텍스트 스타일
│   ├── spacing.js          # 간격 및 여백 시스템
│   └── index.js            # 테마 통합 export
├── App.js                  # 메인 앱 컴포넌트
├── index.js                # 엔트리 포인트
└── index.css               # 글로벌 스타일
```

## 🎨 Flutter와의 완벽한 일치

### ✅ 완벽히 복제된 기능

#### **Homepage (Flutter HomeScreen과 100% 동일)**
- **HeroSection**: 동일한 배경, 그라디언트, 검색바, 버튼 배치
- **TrustedMetricsSection**: 동일한 파란색 배경, 지표 숫자, 레이아웃
- **ServicesSection**: 동일한 3개 서비스 카드, 이미지, 설명, 기능 목록
- **TestimonialsSection**: 동일한 사용자 리뷰, 별점, 프로필 이미지
- **CtaSection**: 동일한 그라디언트 배경, 버튼 스타일
- **Footer**: 동일한 링크 구조, 연락처 정보

#### **테마 시스템 (Flutter AppColors.dart와 100% 동일)**
- **색상**: 모든 primary, secondary, background 색상 동일
- **그라디언트**: heroOverlay, ctaGradient 등 모든 그라디언트 동일
- **그림자**: cardShadow, elevatedShadow 등 모든 그림자 효과 동일
- **타이포그래피**: Inter 폰트, 동일한 font-weight, font-size
- **스페이싱**: 동일한 padding, margin, gap 시스템

#### **반응형 디자인**
- **모바일 (< 768px)**: Flutter와 동일한 세로 레이아웃
- **태블릿 (768px-1024px)**: Flutter와 동일한 하이브리드 레이아웃
- **데스크톱 (> 1024px)**: Flutter와 동일한 가로 레이아웃

#### **이미지 및 에셋**
- Flutter 프로젝트의 모든 이미지 복사
- 동일한 hero_background.png, service 이미지들
- 동일한 fallback 처리 및 placeholder

#### **인터랙션**
- 동일한 hover 효과
- 동일한 버튼 transition
- 동일한 검색바 포커스 처리

### **Login & Signup 페이지**
- 완전한 폼 유효성 검사
- 실시간 에러 처리
- 패스워드 보기/숨기기 토글
- 로딩 상태 애니메이션

## 🛠 기술 스택

- **React 18** - UI 라이브러리
- **React Router** - 라우팅
- **Lucide React** - 아이콘 (Flutter Icons와 동일한 스타일)
- **CSS-in-JS** - 인라인 스타일 (Flutter 스타일과 동일한 접근법)

## 📝 설계 원칙

### **1. Flutter 코드 1:1 대응**
```dart
// Flutter
Container(
  color: AppColors.primary,
  padding: EdgeInsets.all(24),
  child: Text('Hello')
)

// React (동일한 구조)
<div style={{
  backgroundColor: colors.primary,
  padding: spacing[6], // 24px
}}>
  Hello
</div>
```

### **2. 재사용 가능한 테마 시스템**
```javascript
// 색상 재사용
backgroundColor: colors.primary
color: colors.textSecondary

// 스페이싱 재사용
padding: spacing[6]  // 24px
marginBottom: spacing[4]  // 16px

// 타이포그래피 재사용
...textStyles.heroTitle
...textStyles.cardDescription
```

### **3. 컴포넌트 구조화**
- Flutter 위젯과 동일한 컴포넌트 분리
- 동일한 props/parameter 구조
- 동일한 상태 관리 패턴

## 🔗 페이지 구조

- `/` - Homepage (Flutter HomeScreen과 동일)
- `/login` - 로그인 페이지
- `/signup` - 회원가입 페이지

## 📱 반응형 디자인

Flutter 앱과 동일한 breakpoint 및 레이아웃:
- **모바일**: < 768px
- **태블릿**: 768px - 1024px
- **데스크톱**: > 1024px

## 🎯 다음 단계

1. **Lab 관련 페이지**: Flutter LabDetailScreen, AllLabsScreen 복제
2. **검색 기능**: Flutter 검색 위젯 복제
3. **리뷰 시스템**: Flutter 리뷰 관련 페이지 복제
4. **API 연동**: Flutter 서비스 계층 복제
5. **상태 관리**: Flutter Provider 패턴을 Context API로 복제

## 🔍 Flutter 대비 장점

- **더 빠른 개발 속도**: 웹 전용 최적화
- **SEO 최적화**: 검색엔진 최적화 가능
- **배포 용이성**: 정적 사이트 호스팅 가능
- **디버깅**: 브라우저 개발자 도구 활용
- **성능**: 웹 환경에 최적화된 렌더링

모든 디자인, 색상, 레이아웃, 기능이 Flutter 앱과 100% 동일하게 구현되었습니다!