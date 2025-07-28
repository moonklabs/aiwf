# Generate Product Documentation Workflow

이 규칙은 AI가 몇 가지 핵심 질문을 통해 입력을 수집한 뒤, PRD → IA → UCD → UI/UX 문서를 **순차적으로** 생성하도록 안내합니다. 모든 출력은 **Markdown** 형식을 사용하며 **한국어**로 작성됩니다.

---

## 1. 질문 단계

AI는 다음 정보를 **질문**을 통해 사용자에게서 수집합니다.

1. `<product-overview>`
2. `<references>` (URL 목록)
3. `<must-features>` (필수 기능 목록)
4. `<target-user-persona>`
5. `<target-platforms>`
6. `<storage-type>`
7. `<tech-stack>`

> ⚠️ 모든 질문은 한글로 하며, 필요 시 추가적인 참고 서비스·경쟁 제품 정보를 요청합니다.

---

## 2. PRD 작성 단계

사용자로부터 모든 입력을 받은 뒤, 아래 **샘플 프롬프트** 구조를 참고하여 PRD를 생성합니다.

```prompt
Write a PRD document based on the following information:
<product-overview>
${productOverview}
</product-overview>
<references>
${references}
</references>
<must-features>
${mustFeatures}
</must-features>
<target-user-persona>
${persona}
</target-user-persona>
<target-platforms>
${platforms}
</target-platforms>
<storage-type>
${storageType}
</storage-type>
<tech-stack>
${techStack}
</tech-stack>
PRD must include the following contents:
<table-of-contents>
- Detailed product description
- Reference Services with detailed rationale
- Core features and specifications
- Suggested additional features
- User persona and scenarios
- Technical stack recommendations
</table-of-contents>
<response-format>
Use markdown format
</response-format>
<guidelines>
- Use tables or lists where appropriate to organize information systematically.
- All user interactions, including inputs and outputs, must be in Korean.
- Provide accurate answers with reliable references
- Write in Korean
- Clearly separate each section
- Collect additional reference services and provide detailed rationale
- Do not include detailed data structure and storage design
</guidelines>
```

문서에 포함해야 할 **추가 지침**:

- 표와 리스트를 활용해 정보를 구조화할 것.
- 참고 서비스는 최소 3개 이상, 각 서비스 사용 이유를 2~3줄로 기술.

PRD 작성을 완료하면 "✅ PRD 완료" 메시지와 함께 IA 단계 진행 여부를 묻는 **한글** 질문을 덧붙입니다.

---

## 3. IA(Information Architecture) 작성 단계

사용자가 **계속**을 선택하면 IA 문서를 생성합니다.

IA 문서는 다음을 포함합니다:

1. **사이트맵** – 트리 형태로 표현
2. **콘텐츠 인벤토리** – 페이지별 주요 콘텐츠 표
3. **사용자 흐름** – 순서도(텍스트 기반)로 최소 2개 핵심 시나리오 제공
4. **내비게이션 구조 및 URL 패턴**

문서 형식: Markdown, 한국어

### IA 샘플 프롬프트

```prompt
Write an Information Architecture document based on PRD, and following information:
<navigation-type>
${navigationType}
</navigation-type>
<auth-type>
${authType}
</auth-type>
IA document must include the following contents:
<table-of-contents>
- Site Map
- User Flow
- Navigation Structure
- Page Hierarchy
- Content Organization
- Interaction Patterns
- URL Structure
- Component Hierarchy
</table-of-contents>
<response-format>
Use markdown format
</response-format>
<guidelines>
- Use tables or lists where appropriate to organize information systematically
- All user interactions, including inputs and outputs, must be in Korean
- Provide accurate answers with reliable references
- Write in Korean
- Clearly separate each section
- Consider user experience and accessibility
- Include responsive design considerations
- Consider SEO best practices
</guidelines>
```

IA 작성 후 "✅ IA 완료" 메시지와 함께 UCD 단계 진행 여부 질의.

---

## 4. UCD(User-Centered Design) 작성 단계

UCD 문서는 다음을 포함합니다:

1. **주요 페르소나 2–3개** – 표로 정리 (목표, 동기, pain point)
2. **시나리오** – 페르소나별 핵심 사용 시나리오 2개 이상
3. **요구사항 매트릭스** – 기능 ↔ 페르소나 매핑

문서 형식: Markdown, 한국어

### UCD 샘플 프롬프트

```prompt
Write a detailed use case document based on PRD, IA, and following information:
Use case document must include the following contents:
<table-of-contents>
- Actor Definitions
- Use Case Scenarios
- Main Steps
- Exception Handling
- Comprehensive Actor Definitions
- Detailed Use Case Scenarios
- Main Steps and Flow of Events
- Alternative Flows and Edge Cases
- Preconditions and Postconditions
- Business Rules and Constraints
- Exception Handling Procedures
- User Interface Considerations
- Data Requirements and Data Flow
- Security and Privacy Considerations
</table-of-contents>
<response-format>
Use markdown format
</response-format>
<guidelines>
- Use tables or lists where appropriate to organize information systematically
- All user interactions, including inputs and outputs, must be in Korean
- Provide accurate answers with reliable references
- Write in Korean
- Clearly separate each section
- Include detailed step-by-step descriptions
- Consider error cases and alternative flows
- Include technical considerations
</guidelines>
```

완료 후 "✅ UCD 완료" 메시지와 함께 UI/UX 단계 진행 여부 질의.

---

## 5. UI/UX 가이드 작성 단계

내용:

1. **와이어프레임 설명** – 각 핵심 화면의 레이아웃과 구성 요소(텍스트 설명)
2. **네비게이션 원칙** – 일관된 UI 패턴 설명
3. **스타일 가이드 초안** – 컬러 팔레트, 타이포그래피, 컴포넌트 규칙
4. **접근성 고려사항** – WCAG 2.1 준수 핵심 포인트

문서 형식: Markdown, 한국어

### UI/UX 샘플 프롬프트

```prompt
<role>
senior UI/UX designer.
</role>
<task>
Write a comprehensive UI/UX design guide based on the following information:
</task>
<design-preferences>
Theme details: Please analyze the reference service and suggest appropriate:
- Design style
- Color scheme
- Primary colors
</design-preferences>
<references>
${references}
</references>
<additional-instructions>
Please analyze the reference service's design system and suggest appropriate:
- Overall design style and patterns
- Color scheme and palette
- Primary colors
- Mood and atmosphere
</additional-instructions>
Design guide must include the following contents:
<table-of-contents>
- Design System Overview
- Color Palette for tailwindcss (primary, secondary, accent, neutral, etc.)
- Page Implementations
  detailed design guide for each pages
  - core purpose of the page
  - key components
  - layout structure
- Layout Components
  - applicable routes
  - core components
  - responsive behavior
- Interaction Patterns
- Breakpoints
</table-of-contents>
<breakpoints>
$breakpoints: (
├── 'mobile': 320px,
├── 'tablet': 768px,
├── 'desktop': 1024px,
└── 'wide': 1440px
);
</breakpoints>
<response-format>
Use markdown format
</response-format>
<guidelines>
- Use tables or lists where appropriate to organize information systematically
- All descriptions must be in Korean
- Considering color scheme, select proper color for each color in tailwindcss palette
- Provide specific color codes
- Provide rationale for design decisions
- Always include responsive design considerations
- Include all text content in UI
- If needed, use enough images in each components
- provide each image's url. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
- Write in Korean
- must handle root route
- consider proper grid system for all components
</guidelines>
```

완료 후 "🎉 모든 문서 생성 완료" 메시지와 함께 다음 단계(스프린트/태스크 분해) 안내.

---

## 6. 스프린트/태스크 분해 준비

모든 문서가 완료되면, AI는 `yolo` 또는 `create_sprints_from_milestone` 명령을 사용해 개발 스프린트와 태스크를 자동으로 생성할 수 있음을 사용자에게 알립니다.

---

### 사용 예

1. AI → 질문 단계 진행
2. 사용자 → 정보 제공
3. AI → PRD 생성, IA 진행 여부 질문
4. 사용자 → "계속"
5. AI → IA 생성, UCD 진행 여부 질문 … 반복
