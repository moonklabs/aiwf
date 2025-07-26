# Generate Product Documentation Workflow

This rule guides AI to collect input through several key questions, then **sequentially** generate PRD → IA → UCD → UI/UX documents. All outputs use **Markdown** format.

---

## 1. Question Phase

AI collects the following information from the user through **questions**:

1. `<product-overview>`
2. `<references>` (List of URLs)
3. `<must-features>` (List of must-have features)
4. `<target-user-persona>`
5. `<target-platforms>`
6. `<storage-type>`
7. `<tech-stack>`

> ⚠️ All questions are in English, and if needed, request additional reference service or competitive product information.

---

## 2. PRD Writing Phase

After collecting all inputs from the user, create a PRD document based on the following **sample prompt** structure:

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
- Provide accurate answers with reliable references
- Clearly separate each section
- Collect additional reference services and provide detailed rationale
- Do not include detailed data structure and storage design
</guidelines>
```

Additional instructions to include in the document:

- Use tables or lists where appropriate to organize information systematically.
- Include at least 3 reference services, with detailed rationale for each.

After completing the PRD, append a **English** question asking if the user wants to proceed to the IA phase, with a message "✅ PRD completed".

---

## 3. IA(Information Architecture) Writing Phase

If the user chooses to continue, create an IA document based on the following information:

The IA document should include:

1. **Site Map** – Represented as a tree structure
2. **Content Inventory** – List of key content for each page
3. **User Flow** – Provide at least 2 core scenarios in text-based flowchart format
4. **Navigation Structure and URL Patterns**

Document format: Markdown, English

### IA Sample Prompt

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
- Provide accurate answers with reliable references
- Clearly separate each section
- Consider user experience and accessibility
- Include responsive design considerations
- Consider SEO best practices
</guidelines>
```

After completing the IA, append a **English** question asking if the user wants to proceed to the UCD phase, with a message "✅ IA completed".

---

## 4. UCD(User-Centered Design) Writing Phase

The UCD document should include:

1. **Main Persona** – 2-3 personas, summarized in a table (goals, motivations, pain points)
2. **Scenarios** – At least 2 core scenarios per persona
3. **Requirements Matrix** – Mapping of features to personas

Document format: Markdown, English

### UCD Sample Prompt

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
- Provide accurate answers with reliable references
- Clearly separate each section
- Include detailed step-by-step descriptions
- Consider error cases and alternative flows
- Include technical considerations
</guidelines>
```

After completing the UCD, append a **English** question asking if the user wants to proceed to the UI/UX phase, with a message "✅ UCD completed".

---

## 5. UI/UX Guide Writing Phase

내용:

1. **Wireframe Description** – Layout and components of each core screen (text description)
2. **Navigation Principles** – Description of consistent UI patterns
3. **Style Guide Draft** – Color palette, typography, component rules
4. **Accessibility Considerations** – WCAG 2.1 compliance key points

Document format: Markdown, English

### UI/UX Sample Prompt

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
- Considering color scheme, select proper color for each color in tailwindcss palette
- Provide specific color codes
- Provide rationale for design decisions
- Always include responsive design considerations
- Include all text content in UI
- If needed, use enough images in each components
- provide each image's url. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
- must handle root route
- consider proper grid system for all components
</guidelines>
```

After completing all documents, inform the user with a message "🎉 All documents created" and guide them to the next step (sprint/task decomposition).

---

## 6. Sprint/Task Decomposition Preparation

After all documents are completed, inform the user that AI can automatically create development sprints and tasks using the `yolo` or `create_sprints_from_milestone` commands.

---

### Example Usage

1. AI → Question Phase
2. User → Provide Information
3. AI → PRD Creation, IA Progress Question
4. User → "Continue"
5. AI → IA Creation, UCD Progress Question … Repeat
