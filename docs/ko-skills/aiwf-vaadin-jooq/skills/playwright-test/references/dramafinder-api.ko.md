# Drama Finder API 참조

> 휴먼 리뷰용 한글 번역입니다. 실행 원문: [원문](../../../../../../plugins/aiwf-vaadin-jooq/skills/playwright-test/references/dramafinder-api.md). 번역과 자동 검사는 승인을 뜻하지 않으며, 검토 상태와 원문 SHA256은 [관리 목록](../../../../manifest.json)에서 확인합니다.

<!--
Copyright 2025-2026 Simon Martinelli and the AI Unified Process contributors.
Part of the AI Unified Process — https://unifiedprocess.ai
Licensed under the Apache License, Version 2.0. See LICENSE and NOTICE.
-->

Drama Finder `1.1.0` Javadoc(`org.vaadin.addons:dramafinder:1.1.0`)에서 가져왔습니다. 이것이 Playwright 테스트를 작성하기 위한 권위 있는 API 참조입니다 — 런타임에 문서를 가져오는 대신 이것을 사용하십시오.
여기 나열되지 않은 클래스가 필요하거나 의존성을 업그레이드했으면 JavaDocs MCP 서버(SKILL.md 참고)로 조회하고 이 파일을 갱신하십시오.

모든 요소 래퍼는 `org.vaadin.addons.dramafinder.element` 아래에 있습니다(공유 믹스인은 `...element.shared`). 테스트 기본 클래스는 `org.vaadin.addons.dramafinder.AbstractBasePlaywrightIT`입니다.

## 로케이터 수준

모든 래퍼는 두 개의 로케이터 수준을 노출합니다(`VaadinElement` / `HasValueElement`에서):

- `getLocator()` — 컴포넌트 루트. `theme`, CSS 클래스, `opened`, `invalid` 상태에 사용.
- `getInputLocator()` — 내부 네이티브 입력. `value`, `maxlength`, `pattern`, 포커스에 사용.

CSS 선택자는 섀도 DOM을 자동으로 통과하지만, XPath는 통과하지 않습니다.

## 사용 가능한 요소 클래스

`AccordionElement`, `AccordionPanelElement`, `AvatarElement`, `BigDecimalFieldElement`,
`ButtonElement`, `CardElement`, `CheckboxElement`, `ComboBoxElement`, `ContextMenuElement`,
`DatePickerElement`, `DateTimePickerElement`, `DetailsElement`, `DialogElement`, `EmailFieldElement`,
`GridElement` (+ `RowElement`, `CellElement`, `HeaderCellElement`), `IntegerFieldElement`,
`ListBoxElement`, `MenuBarElement`, `MenuElement`, `MenuItemElement`, `MessageInputElement`,
`MessageListElement`, `MultiSelectComboBoxElement`, `NotificationElement`, `NumberFieldElement`,
`PasswordFieldElement`, `PopoverElement`, `ProgressBarElement`, `RadioButtonGroupElement`,
`SelectElement`, `SideNavigationElement`, `SideNavigationItemElement`, `SplitLayoutElement`,
`TabElement`, `TabSheetElement`, `TextAreaElement`, `TextFieldElement`, `TimePickerElement`,
`TreeGridElement` (+ `TreeRowElement`), `UploadElement`, `VirtualListElement`.

## 공유 메서드 (모든 요소에서 사용 가능)

### `VaadinElement` (기반 클래스)

- `void click()` — 컴포넌트 루트 클릭
- `String getText()` — 루트의 텍스트 콘텐츠(또는 `null`)
- `com.microsoft.playwright.Locator getLocator()`
- `boolean isVisible()` / `void assertVisible()`
- `boolean isHidden()` / `void assertHidden()`
- `Object getProperty(String name)` / `void setProperty(String name, Object value)` — 원시 DOM 속성 접근

### 공유 믹스인 인터페이스 (컴포넌트가 지원하는 곳에서 상속됨)

- **`HasValueElement`**: `void setValue(String)`, `String getValue()`, `void clear()`,
  `void assertValue(String)`, `Locator getInputLocator()`
- **`HasValidationPropertiesElement`**: `void assertValid()`, `void assertInvalid()`,
  `void assertErrorMessage(String)`, `Locator getErrorMessageLocator()`
- **`HasEnabledElement`**: `boolean isEnabled()`, `void assertEnabled()`, `void assertDisabled()`
- **`HasLabelElement`**: `String getLabel()`, `void assertLabel(String)`
- **`HasPlaceholderElement`**: `String getPlaceholder()`, `void setPlaceholder(String)`, `void assertPlaceholder(String)`
- **`HasHelperElement`**: `String getHelperText()`, `void assertHelperHasText(String)`
- **`HasClearButtonElement`**: `void clickClearButton()`, `boolean isClearButtonVisible()`,
  `void assertClearButtonVisible()` / `assertClearButtonNotVisible()`
- **`FocusableElement`**: `void focus()`, `void blur()`, `void assertIsFocused()`, `void assertIsNotFocused()`, `int getTabIndex()`
- **`HasAriaLabelElement`**: `String getAriaLabel()`, `void assertAriaLabel(String)`
- **`HasThemeElement`**: `String getTheme()`, `void assertTheme(String)`
- **`HasStyleElement`**: `void assertCssClass(String...)`, `String getCssClass()`
- **`HasTooltipElement`**: `String getTooltipText()`, `void assertTooltipHasText(String)`
- **`HasPrefixElement`** / **`HasSuffixElement`**: `assertPrefixHasText(String)` / `assertSuffixHasText(String)`

## 요소 API

### `TextFieldElement` (및 하위 클래스 `EmailFieldElement`, `PasswordFieldElement`, `TextAreaElement`)

`HasValueElement`, `HasValidationPropertiesElement`, `HasEnabledElement`, `HasLabelElement`,
`HasPlaceholderElement`, `HasHelperElement`, `HasClearButtonElement`, `FocusableElement` 등을 구현합니다.

- `static TextFieldElement getByLabel(Page page, String label)`
- `static TextFieldElement getByLabel(Locator scope, String label)`
- `Integer getMinLength()` / `void setMinLength(int)` / `void assertMinLength(Integer)`
- `Integer getMaxLength()` / `void setMaxLength(int)` / `void assertMaxLength(Integer)`
- `String getPattern()` / `void setPattern(String)` / `void assertPattern(String)`
- 그리고 모든 `HasValueElement`(`setValue`/`getValue`/`clear`/`assertValue`)와 검증 단언

### `ButtonElement`

`getByText`는 접근 가능한 이름 또는 보이는 텍스트와 일치합니다. 아이콘만 있는 버튼은 서버 사이드에서 `setAriaLabel(...)`을 설정한 뒤 `getByText(page, "<aria label>")`로 조회하십시오.

- `static ButtonElement getByText(Page page, String text)`
- `static ButtonElement getByText(Locator scope, String text)`
- `static ButtonElement getByLabel(Page page, String text)` — `getByText`의 별칭
- `click()`, `assertEnabled()/assertDisabled()`, `focus()`, 테마/툴팁 단언을 상속

### `ComboBoxElement`

`HasValueElement`(읽기 전용 `getValue`/`assertValue` — 값은 표시되는 레이블), `HasValidationPropertiesElement`, `HasEnabledElement`, `HasLabelElement`를 구현합니다.

- `static ComboBoxElement getByLabel(Page page, String label)` / `(Locator scope, String label)`
- `void selectItem(String item)` — 오버레이를 열고 보이는 레이블로 일치하는 항목을 클릭
- `void filterAndSelectItem(String filter, String item)`
- `void setFilter(String filter)` / `String getFilter()`
- `void open()` / `void close()` / `boolean isOpened()` / `assertOpened()` / `assertClosed()`
- `void clickToggleButton()`
- `int getOverlayItemCount()` / `void assertItemCount(int)`
- `boolean isReadOnly()` / `assertReadOnly()` / `assertNotReadOnly()`
- `String getValue()` / `void assertValue(String)`

### `CheckboxElement`

`HasValueElement`, `HasValidationPropertiesElement`, `HasEnabledElement`, `HasLabelElement`를 구현합니다.

- `static CheckboxElement getByLabel(Page page, String label)`
- `void check()` / `void uncheck()`
- `boolean isChecked()` / `void assertChecked()` / `void assertNotChecked()`
- `boolean isIndeterminate()` / `void setIndeterminate(boolean)` / `assertIndeterminate()` / `assertNotIndeterminate()`

### `DatePickerElement`

`java.time.LocalDate`와 함께 동작합니다. String 값/`setValue(String)`은 뷰 형식 `dd/mm/yyyy`를 사용합니다.

- `static DatePickerElement getByLabel(Page page, String label)` / `(Locator scope, String label)`
- `void setValue(LocalDate date)` — 값을 ISO-8601로 설정
- `void setValue(String value)` — 뷰에서와 같은 형식(`dd/mm/yyyy`)의 값
- `LocalDate getValueAsLocalDate()`
- `void assertValue(LocalDate value)` / `void assertValue(String value)`
- 검증, 클리어 버튼, 활성화 단언을 상속

### `DialogElement`

- `new DialogElement(Page page)` — ARIA 역할로 다이얼로그를 해석
- `new DialogElement(Locator locator)`
- `static DialogElement getByHeaderText(Page page, String headerText)`
- `boolean isOpen()` / `void assertOpen()` / `void assertClosed()`
- `String getHeaderText()` / `void assertHeaderText(String)`
- `boolean isModal()` / `void assertModal()` / `void assertModeless()`
- `void closeWithEscape()`
- `Locator getHeaderLocator()` / `getContentLocator()` / `getFooterLocator()`

다이얼로그 안에서 조회 범위를 한정하려면 `dialog.getLocator()`를 다른 요소의 팩터리에 넘기십시오, 예:
`ButtonElement.getByText(dialog.getLocator(), "Confirm")`.

### `NotificationElement`

`<vaadin-notification-card>`를 감쌉니다.

- `new NotificationElement(Page page)` / `new NotificationElement(Locator locator)`
- `boolean isOpen()` / `void assertOpen()` / `void assertClosed()`
- `Locator getContentLocator()`

### `GridElement`

셀 접근은 그리드의 내부 API에 대한 JS 평가를 사용합니다(본문 셀은 섀도 DOM에서 가상화됨).
데이터 단언에는 항상 `getTotalRowCount()`를 사용하십시오 — 뷰포트가 렌더링되는 행 수를 제한합니다.

- `static GridElement get(Page page)` / `static GridElement get(Locator parent)`
- `static GridElement getById(Page page, String id)`
- `int getTotalRowCount()` — 전체 데이터 항목(개수에는 이것을 사용)
- `int getRenderedRowCount()` — 현재 DOM에 있는 행(가상화로 인해 전체 이하)
- `int getColumnCount()`
- `List<String> getHeaderCellContents()`
- `Optional<CellElement> findCell(int row, int column)`
- `Optional<CellElement> findCell(int row, String columnHeaderText)`
- `Optional<RowElement> findRow(int rowIndex)` — 필요하면 스크롤
- `Optional<HeaderCellElement> findHeaderCell(int columnIndex)` / `findHeaderCellByText(String)`
- `List<Integer> findRowIndexesWithColumnText(int columnIndex, String text)`
- `void select(int rowIndex)` / `void deselect(int rowIndex)` / `int getSelectedItemCount()`
- 전체 선택: `checkSelectAll()` / `uncheckSelectAll()` / `isSelectAllChecked()` / `isSelectAllIndeterminate()`
- `void scrollToRow(int)` / `scrollToStart()` / `scrollToEnd()`
- `void waitForGridToStopLoading()` — 비동기/지연 그리드를 스크롤한 후 호출

#### `GridElement.RowElement`

- `int getRowIndex()` / `Locator getRowLocator()`
- `CellElement getCell(int columnIndex)` / `CellElement getCell(String columnHeaderText)`
- `void select()` / `void deselect()` / `boolean isSelected()`
- `void openDetails()` / `void closeDetails()` / `boolean isDetailsOpen()` / `CellElement getDetailsCell()`

#### `GridElement.CellElement`

- `Locator getCellContentLocator()` — `vaadin-grid-cell-content`(텍스트 단언에 사용, 예: `assertThat(cell.getCellContentLocator()).hasText("..."))`)
- `Locator getTableCellLocator()` — `td`/`th`
- `int getColumnIndex()`(상세 셀은 `-1`)
- `void click()`

## 참고

- 원시 `isVisible()`/`getAttribute()` 불리언 검사보다 자동 재시도 단언(`assertValue`, `assertVisible`, Playwright `assertThat(locator)...`)을 선호하십시오 — 단언만 재시도합니다.
- `TreeGridElement`는 `GridElement`를 확장합니다(`TreeRowElement` 추가). `MultiSelectComboBoxElement`는 다중 선택을 위해 `ComboBoxElement`를 그대로 따릅니다.
