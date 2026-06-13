# Issue Manifest: Add Priority Filter To Service Request Tracker

## Epic

### [Epic] Add Priority Filter To Service Request Tracker

**Labels:** `epic`

**Body:**

### Summary
As a platform engineer, I want to filter service requests by priority so that I can quickly focus on high-priority requests. This epic covers adding a priority filter control to the service request list with options for All, Low, Medium, and High. The implementation is frontend-only with no backend changes.

### Requirements

#### Functional Requirements
| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| FR-1 | Priority filter control | High | Add a dropdown or button group above the service request list that allows selection of filter values: All, Low, Medium, and High. |
| FR-2 | Filter service request list by priority | High | When a priority filter is selected, only service requests whose priority field matches the selected value are displayed in the list. Selecting 'All' displays all requests with no filtering. |
| FR-3 | Visual indication of active filter | Medium | The currently selected filter option should be visually distinct so the user can easily tell which filter is active. |
| FR-4 | Filter resets on request list update | Low | If new requests are added to the list, the active filter continues to apply. The filter state persists across request creation within the same session. |

#### Non-Functional Requirements
| ID | Category | Priority | Description |
|----|----------|----------|-------------|
| NFR-1 | Usability | High | The filter control must be clearly visible above the request list without requiring scrolling. |
| NFR-2 | Performance | Medium | Filtering must be applied client-side with no perceptible delay. |
| NFR-3 | Accessibility | Medium | The filter control must be keyboard accessible and announce changes to screen readers. |
| NFR-4 | Compatibility | Medium | The filter must work correctly with any existing features without conflicts. |
| NFR-5 | Maintainability | High | Frontend-only, no data model changes, contained in single PR. |

### Scope & Constraints
The implementation must be frontend-only using the existing framework. No new frontend framework or library may be introduced. The existing data model for service requests (including the priority field) must remain unchanged. The backend API must not be modified. The change must be small enough for a single pull request.

**Out of Scope:** Authentication, RBAC, advanced search, sorting, pagination, database changes, new backend endpoints, new frameworks.

### Architecture Overview
- **Pattern:** Client-side filter-on-render via local component state
- **Filter:** Native `<select>` element bound to `selectedPriority` state
- **Filter logic:** Pure `filterByPriority()` function — `requests.filter(r => priority === 'all' || r.priority === priority)`
- **Empty state:** "No requests match this priority" shown when filtered list is empty
- **No backend or data model changes**

### Story Checklist
- [ ] #? [User Story] Priority filter control for service request list

---

## User Story

### [User Story] Priority filter control for service request list

**Labels:** `user-story`

**Epic:** #? (to be filled after Epic creation)

**Body:**

As a platform engineer, I want to select a priority value from a filter control so that the service request list shows only requests matching that priority.

### Acceptance Criteria
| ID | Description | Priority |
|----|-------------|----------|
| AC-1 | The service request list displays a priority filter control above the list with options: All, Low, Medium, High. | High |
| AC-2 | Selecting 'All' (default) displays all service requests without filtering. | High |
| AC-3 | Selecting 'High' displays only service requests with priority 'high'. | High |
| AC-4 | Selecting 'Medium' displays only service requests with priority 'medium'. | High |
| AC-5 | Selecting 'Low' displays only service requests with priority 'low'. | High |
| AC-6 | The currently selected filter option is visually distinct from unselected options. | Medium |
| AC-7 | When no service requests match the selected priority, the list shows an empty state message. | Medium |
| AC-8 | Creating a new service request while a filter is active does not reset the filter. | Low |
| AC-9 | The filter control is focusable via keyboard Tab navigation and activatable via Enter or Space keys. | Medium |
| AC-10 | When the filter selection changes, screen readers announce the new filter state. | Medium |
| AC-11 | Filtering the list does not trigger any network request or page reload. | High |
| AC-12 | The filter control and filtered list render correctly at standard desktop and tablet viewport widths. | Medium |

### GWT Scenarios
| ID | Given | When | Then |
|----|-------|------|------|
| GWT-1 | requests with priorities high, medium, low exist | select 'High' | only high-priority requests displayed |
| GWT-2 | requests with priorities high, medium, low exist | select 'Medium' | only medium-priority requests displayed |
| GWT-3 | requests with priorities high, medium, low exist | select 'Low' | only low-priority requests displayed |
| GWT-4 | a non-All filter is selected | select 'All' | all requests displayed |
| GWT-5 | no requests match 'high' | select 'High' | empty state shown |
| GWT-6 | 'High' filter active | create low-priority request | new request not shown, filter stays |
| GWT-7 | 'High' filter active | create high-priority request | new request shown, filter stays |
| GWT-8 | filter control rendered | press Tab | filter control receives focus |
| GWT-9 | filter control focused, selection 'All' | press Down then Enter | filter changes to 'Low' |
| GWT-10 | filter set to 'Medium' | change to 'High' | screen reader announces change |

### Verification & Edge Cases
- Empty list, no matches, single request, case mismatch, null/undefined priority, rapid switching, long list
- See: specification-2.response.json for full details

### Test Guidance
- **Unit:** filterByPriority() pure function — returns correct filtered array for each priority, 'all' returns full list, no matches returns empty array, handles null/empty input
- **Integration:** component renders filter control, clicking each option updates list, new request with active filter behaves correctly, active filter visual style
- **Manual:** 11-step manual test script (see specification-2.response.json)

### Definition of Done
1. Filter control rendered above list with All/Low/Medium/High
2. Selecting filter updates list to show only matching requests
3. 'All' restores full unfiltered list
4. Active filter visually distinct
5. Empty state when no matches
6. Keyboard accessible (Tab, Arrow keys, Enter)
7. Filter persists when new requests added
8. No network requests triggered by filter changes
9. All acceptance criteria AC-1 through AC-12 satisfied
10. Single PR with no backend/data model changes

### Task Checklist
- [ ] #? [Task] Add priority filter state and <select> control to ServiceRequestList
- [ ] #? [Task] Apply priority filter to the rendered request list
- [ ] #? [Task] Extract filterByPriority pure function for testability
- [ ] #? [Task] Add accessibility support for filter control
- [ ] #? [Task] Add CSS styling for filter control
- [ ] #? [Task] Add unit tests for filterByPriority function

---

## Tasks

### [Task] Add priority filter state and <select> control to ServiceRequestList

**Labels:** `task`

**Story:** #? (to be filled after User Story creation)

**Body:**

Add a `selectedPriority` state variable initialized to 'all' in the ServiceRequestList component. Render a native `<select>` dropdown above the list with four `<option>` elements: All (value 'all'), Low (value 'low'), Medium (value 'medium'), High (value 'high'). The `<select>` value is bound to `selectedPriority`. On change, update the state. Apply a CSS class for styling the filter control.

**Related Functional Requirements:** FR-1, FR-2, FR-3
**Related Non-Functional Requirements:** NFR-1, NFR-3

**Acceptance Criteria:**
- AC-1: The service request list displays a priority filter control above the list with options: All, Low, Medium, High.
- AC-6: The currently selected filter option is visually distinct from unselected options.
- AC-9: The filter control is focusable via keyboard Tab navigation and activatable via Enter or Space keys.
- AC-12: The filter control and filtered list render correctly at standard desktop and tablet viewport widths.

**Implementation:**
- File: `ServiceRequestList.tsx` — add useState for selectedPriority, add <select> JSX before list rendering
- Initial value: `'all'`
- Options: `all`, `low`, `medium`, `high`
- The native <select> provides built-in keyboard accessibility and visual selection indication

---

### [Task] Apply priority filter to the rendered request list

**Labels:** `task`

**Story:** #? (to be filled after User Story creation)

**Body:**

Before rendering the service request list, filter the requests array using the `selectedPriority` state. If `selectedPriority` is 'all', render all requests. Otherwise, render only requests where `request.priority === selectedPriority`. Use case-sensitive exact match. Show an empty state message 'No requests match this priority' when the filtered list is empty. Verify no network requests occur when changing the filter.

**Related Functional Requirements:** FR-2, FR-4
**Related Non-Functional Requirements:** NFR-2, NFR-5

**Acceptance Criteria:**
- AC-2: Selecting 'All' (default) displays all service requests without filtering.
- AC-3: Selecting 'High' displays only service requests with priority 'high'.
- AC-4: Selecting 'Medium' displays only service requests with priority 'medium'.
- AC-5: Selecting 'Low' displays only service requests with priority 'low'.
- AC-7: When no service requests match the selected priority, the list shows an empty state message.
- AC-11: Filtering the list does not trigger any network request or page reload.

**Implementation:**
- File: `ServiceRequestList.tsx` — add filter logic before rendering
- Logic: `const filteredRequests = selectedPriority === 'all' ? requests : requests.filter(r => r.priority === selectedPriority)`
- Empty state: `<p>No requests match this priority</p>` when filteredRequests.length === 0

---

### [Task] Extract filterByPriority pure function for testability

**Labels:** `task`

**Story:** #? (to be filled after User Story creation)

**Body:**

Extract the filtering logic into a standalone pure function `filterByPriority(requests, priority)` in a separate file. The function returns the filtered array. If priority is 'all' or falsy, return the original array unchanged. Export the function. Import and use it in the ServiceRequestList component.

**Related Functional Requirements:** FR-2
**Related Non-Functional Requirements:** NFR-2, NFR-5

**Acceptance Criteria:**
- AC-2: Selecting 'All' (default) displays all service requests without filtering.
- AC-3: Selecting 'High' displays only service requests with priority 'high'.
- AC-4: Selecting 'Medium' displays only service requests with priority 'medium'.
- AC-5: Selecting 'Low' displays only service requests with priority 'low'.
- AC-11: Filtering the list does not trigger any network request or page reload.

**Implementation:**
- New file: `filterByPriority.ts` (co-located with component)
- Signature: `export function filterByPriority<T extends { priority: string }>(requests: T[], priority: string): T[]`
- Logic: `priority === 'all' ? [...requests] : requests.filter(r => r.priority === priority)`

---

### [Task] Add accessibility support for filter control

**Labels:** `task`

**Story:** #? (to be filled after User Story creation)

**Body:**

Add an ARIA label to the `<select>` element (e.g., `aria-label="Filter by priority"`). Use an ARIA live region (`aria-live="polite"`) to announce filter changes to screen readers — text content updated to "Showing {priority} priority requests" when filter changes. Ensure the filter control is reachable in the natural Tab order of the page.

**Related Functional Requirements:** FR-1
**Related Non-Functional Requirements:** NFR-3

**Acceptance Criteria:**
- AC-9: The filter control is focusable via keyboard Tab navigation and activatable via Enter or Space keys.
- AC-10: When the filter selection changes, screen readers announce the new filter state.

**Implementation:**
- File: `ServiceRequestList.tsx`
- Add `aria-label="Filter by priority"` to `<select>` element
- Add `<div aria-live="polite" aria-atomic="true">` with dynamic text
- The native `<select>` is inherently keyboard accessible via Tab, Arrow keys, Enter

---

### [Task] Add CSS styling for filter control

**Labels:** `task`

**Story:** #? (to be filled after User Story creation)

**Body:**

Add CSS rules to style the priority filter `<select>` dropdown. Style should match the existing application design system. The control should be positioned above the request list with appropriate spacing and sizing. Ensure it is responsive and does not break layout at different viewport widths.

**Related Functional Requirements:** FR-1, FR-3
**Related Non-Functional Requirements:** NFR-1, NFR-4

**Acceptance Criteria:**
- AC-1: The service request list displays a priority filter control above the list with options: All, Low, Medium, High.
- AC-6: The currently selected filter option is visually distinct from unselected options.
- AC-12: The filter control and filtered list render correctly at standard desktop and tablet viewport widths.

**Implementation:**
- File: `ServiceRequestList.css` (or equivalent stylesheet)
- Style rules for `.priority-filter` class: spacing, sizing, border, font, margin-bottom
- Responsive: use relative units, test at 768px-1920px widths

---

### [Task] Add unit tests for filterByPriority function

**Labels:** `task`

**Story:** #? (to be filled after User Story creation)

**Body:**

If the repository has an existing test framework, add unit tests for the `filterByPriority` function covering: returns all requests when priority is 'all', filters correctly for 'low', 'medium', 'high', returns empty array for priority with no matches, handles null/undefined priority gracefully, handles empty input array.

**Related Functional Requirements:** FR-2
**Related Non-Functional Requirements:** NFR-2

**Acceptance Criteria:**
- AC-2: Selecting 'All' displays all service requests without filtering.
- AC-3: Selecting 'High' displays only high-priority requests.
- AC-4: Selecting 'Medium' displays only medium-priority requests.
- AC-5: Selecting 'Low' displays only low-priority requests.
- AC-7: Empty state when no requests match selected filter.
- AC-11: No network requests triggered by filter changes.

**Implementation:**
- File: `filterByPriority.test.ts` (co-located with filter function)
- Test cases:
  1. `'all'` returns full list unchanged
  2. `'high'` returns only high-priority requests
  3. `'medium'` returns only medium-priority requests
  4. `'low'` returns only low-priority requests
  5. No matches returns empty array
  6. `null`/`undefined` priority returns full list
  7. Empty input array returns empty array
