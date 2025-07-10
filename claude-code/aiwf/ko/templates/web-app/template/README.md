# {{projectName}}

AIWF가 통합된 React + TypeScript 웹 애플리케이션입니다.

## 시작하기

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

### 프리뷰

```bash
npm run preview
```

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 빌드 도구
- **Tailwind CSS** - 유틸리티 우선 CSS
- **React Router** - 클라이언트 사이드 라우팅
- **Zustand** - 상태 관리
- **AIWF** - AI 지원 개발 워크플로우

## 프로젝트 구조

```
src/
├── components/      # 재사용 가능한 컴포넌트
│   ├── Layout.tsx
│   └── aiwf/       # AIWF 관련 컴포넌트
├── pages/          # 페이지 컴포넌트
├── stores/         # Zustand 스토어
├── hooks/          # 커스텀 훅
├── utils/          # 유틸리티 함수
└── types/          # TypeScript 타입 정의
```

## AIWF 기능

### Feature Ledger

프로젝트에서 개발된 모든 기능을 자동으로 추적합니다.

```bash
npm run aiwf:feature list    # 기능 목록 보기
npm run aiwf:feature add     # 새 기능 추가
npm run aiwf:feature update  # 기능 상태 업데이트
```

### Context 압축

토큰 사용을 최적화하여 비용을 절감합니다.

```bash
npm run aiwf:context status  # 현재 상태 확인
npm run aiwf:context compress # 수동 압축 실행
```

### AI 페르소나

프로젝트 유형에 맞는 AI 어시스턴트를 활성화합니다.

- `fullstack-developer` - 풀스택 개발 (기본값)
- `frontend-specialist` - 프론트엔드 전문
- `ui-ux-designer` - UI/UX 디자인
- `performance-optimizer` - 성능 최적화
- `security-auditor` - 보안 감사

## 개발 가이드

### 컴포넌트 생성

```tsx
// src/components/MyComponent.tsx
interface MyComponentProps {
  title: string
  children: React.ReactNode
}

export default function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

### 상태 관리

```tsx
// src/stores/myStore.ts
import { create } from 'zustand'

interface MyStore {
  count: number
  increment: () => void
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

### 스타일링

Tailwind CSS 클래스를 사용합니다:

```tsx
<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    제목
  </h1>
</div>
```

## 배포

### Vercel

```bash
npm run build
vercel
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## 라이선스

MIT