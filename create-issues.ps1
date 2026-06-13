#Requires -Version 7.0
# Create GitHub issues for the Priority Filter feature
# Run: . .opencode/skills/github-project-manager/scripts/*.ps1; .\create-issues.ps1

$Owner = "pronative-ai"
$Repo = "ai-assisted-student-AS-2606-101-ST-2606-1008"

Write-Host "Creating issues for $Owner/$Repo..." -ForegroundColor Cyan

# ─── EPIC ────────────────────────────────────────────────────────────────────

$epicBody = @'
### Summary
As a platform engineer, I want to filter service requests by priority so that I can quickly focus on high-priority requests. This epic covers adding a priority filter control to the service request list with options for All, Low, Medium, and High. The implementation is frontend-only with no backend changes.

### Requirements

#### Functional Requirements
| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| FR-1 | Priority filter control | High | Add a dropdown or button group above the service request list that allows selection of filter values: All, Low, Medium, and High. |
| FR-2 | Filter service request list by priority | High | When a priority filter is selected, only service requests whose priority field matches the selected value are displayed in the list. |
| FR-3 | Visual indication of active filter | Medium | The currently selected filter option should be visually distinct. |
| FR-4 | Filter resets on request list update | Low | The active filter persists across request creation within the same session. |

#### Non-Functional Requirements
| ID | Category | Priority | Description |
|----|----------|----------|-------------|
| NFR-1 | Usability | High | Filter control visible above list without scrolling. |
| NFR-2 | Performance | Medium | Client-side filtering with no perceptible delay. |
| NFR-3 | Accessibility | Medium | Keyboard accessible + screen reader announcements. |
| NFR-4 | Compatibility | Medium | Works with existing features without conflicts. |
| NFR-5 | Maintainability | High | Frontend-only, no data model changes, single PR. |

### Scope & Constraints
Frontend-only using existing framework. No new frameworks. No data model changes. No backend changes. Single pull request.

### Architecture Overview
- Client-side filter-on-render via local component state
- Native `<select>` element bound to `selectedPriority` state
- Pure `filterByPriority()` function for testability
- Empty state: "No requests match this priority"
- No backend or data model changes

### Story Checklist
- [ ] #STORY_NUMBER [User Story] Priority filter control for service request list
'@

$epic = New-GitHubIssue -Owner $Owner -Repo $Repo -Title "[Epic] Add Priority Filter To Service Request Tracker" -Body $epicBody -Labels @("epic")
$epicNum = $epic.number
Write-Host "Created Epic #$epicNum" -ForegroundColor Green

# ─── USER STORY ──────────────────────────────────────────────────────────────

$storyBody = @"
As a platform engineer, I want to select a priority value from a filter control so that the service request list shows only requests matching that priority.

**Epic:** #$epicNum

### Acceptance Criteria
| ID | Description | Priority |
|----|-------------|----------|
| AC-1 | Filter control above list with All/Low/Medium/High | High |
| AC-2 | 'All' displays all requests | High |
| AC-3 | 'High' shows only high-priority requests | High |
| AC-4 | 'Medium' shows only medium-priority requests | High |
| AC-5 | 'Low' shows only low-priority requests | High |
| AC-6 | Active filter visually distinct | Medium |
| AC-7 | Empty state when no matches | Medium |
| AC-8 | Filter persists on new request creation | Low |
| AC-9 | Keyboard accessible (Tab, Enter, Space) | Medium |
| AC-10 | Screen reader announces filter changes | Medium |
| AC-11 | No network requests on filter change | High |
| AC-12 | Responsive at desktop and tablet widths | Medium |

### Definition of Done
1. Filter control rendered above list
2. Selecting filter updates list
3. 'All' restores full list
4. Active filter visually distinct
5. Empty state when no matches
6. Keyboard accessible
7. Filter persists on new requests
8. No network requests
9. All AC-1 through AC-12 satisfied
10. Single PR, no backend/data model changes

### Task Checklist
- [ ] #TASK1 [Task] Add priority filter state and <select> control to ServiceRequestList
- [ ] #TASK2 [Task] Apply priority filter to the rendered request list
- [ ] #TASK3 [Task] Extract filterByPriority pure function for testability
- [ ] #TASK4 [Task] Add accessibility support for filter control
- [ ] #TASK5 [Task] Add CSS styling for filter control
- [ ] #TASK6 [Task] Add unit tests for filterByPriority function
"@

$story = New-GitHubIssue -Owner $Owner -Repo $Repo -Title "[User Story] Priority filter control for service request list" -Body $storyBody -Labels @("user-story")
$storyNum = $story.number
Write-Host "Created User Story #$storyNum" -ForegroundColor Green

# ─── TASKS ───────────────────────────────────────────────────────────────────

$tasks = @(
    @{
        Title = "[Task] Add priority filter state and <select> control to ServiceRequestList"
        Body = @"
**Story:** #$storyNum

Add a `selectedPriority` state variable initialized to 'all' in the ServiceRequestList component. Render a native `<select>` dropdown above the list with four `<option>` elements: All (value 'all'), Low (value 'low'), Medium (value 'medium'), High (value 'high'). The `<select>` value is bound to `selectedPriority`. On change, update the state. Apply a CSS class for styling.

**Related FR:** FR-1, FR-2, FR-3
**Related NFR:** NFR-1, NFR-3
**AC:** AC-1, AC-6, AC-9, AC-12
**File:** ServiceRequestList.tsx
"@
    },
    @{
        Title = "[Task] Apply priority filter to the rendered request list"
        Body = @"
**Story:** #$storyNum

Before rendering, filter requests by `selectedPriority`. 'all' shows all; otherwise show only `request.priority === selectedPriority` (case-sensitive). Show "No requests match this priority" when filtered list is empty. No network requests on filter change.

**Related FR:** FR-2, FR-4
**Related NFR:** NFR-2, NFR-5
**AC:** AC-2, AC-3, AC-4, AC-5, AC-7, AC-11
**File:** ServiceRequestList.tsx
"@
    },
    @{
        Title = "[Task] Extract filterByPriority pure function for testability"
        Body = @"
**Story:** #$storyNum

Extract filter logic into `filterByPriority(requests, priority)` pure function. Returns filtered array. 'all' or falsy returns full array unchanged. Export and import in ServiceRequestList.

**Related FR:** FR-2
**Related NFR:** NFR-2, NFR-5
**AC:** AC-2, AC-3, AC-4, AC-5, AC-11
**File:** filterByPriority.ts (new)
"@
    },
    @{
        Title = "[Task] Add accessibility support for filter control"
        Body = @"
**Story:** #$storyNum

Add `aria-label="Filter by priority"` to `<select>`. Add `<div aria-live="polite">` announcing "Showing {priority} priority requests" on filter change. Ensure natural Tab order.

**Related FR:** FR-1
**Related NFR:** NFR-3
**AC:** AC-9, AC-10
**File:** ServiceRequestList.tsx
"@
    },
    @{
        Title = "[Task] Add CSS styling for filter control"
        Body = @"
**Story:** #$storyNum

Style the `<select>` with appropriate spacing, sizing, border, and font matching the design system. Position above list. Responsive at desktop and tablet widths.

**Related FR:** FR-1, FR-3
**Related NFR:** NFR-1, NFR-4
**AC:** AC-1, AC-6, AC-12
**File:** ServiceRequestList.css
"@
    },
    @{
        Title = "[Task] Add unit tests for filterByPriority function"
        Body = @"
**Story:** #$storyNum

If test framework exists, add unit tests: 'all' returns full list, each priority filters correctly, no matches returns empty, null/undefined returns full list, empty input returns empty.

**Related FR:** FR-2
**Related NFR:** NFR-2
**AC:** AC-2, AC-3, AC-4, AC-5, AC-7, AC-11
**File:** filterByPriority.test.ts (new)
"@
    }
)

$taskNumbers = @()
foreach ($task in $tasks) {
    $issue = New-GitHubIssue -Owner $Owner -Repo $Repo -Title $task.Title -Body $task.Body -Labels @("task")
    $taskNumbers += $issue.number
    Write-Host "Created Task #$($issue.number): $($task.Title)" -ForegroundColor Green
    Start-Sleep -Milliseconds 300
}

# ─── UPDATE EPIC BODY WITH STORY CHECKLIST ──────────────────────────────────

$epicUpdatedBody = $epicBody -replace '#STORY_NUMBER', "#$storyNum"
Update-GitHubIssueBody -Owner $Owner -Repo $Repo -Number $epicNum -Body $epicUpdatedBody
Write-Host "Updated Epic #$epicNum with story checklist" -ForegroundColor Yellow

# ─── UPDATE STORY BODY WITH TASK CHECKLIST ──────────────────────────────────

$storyUpdatedBody = $storyBody `
    -replace '#TASK1', "#$($taskNumbers[0])" `
    -replace '#TASK2', "#$($taskNumbers[1])" `
    -replace '#TASK3', "#$($taskNumbers[2])" `
    -replace '#TASK4', "#$($taskNumbers[3])" `
    -replace '#TASK5', "#$($taskNumbers[4])" `
    -replace '#TASK6', "#$($taskNumbers[5])"
Update-GitHubIssueBody -Owner $Owner -Repo $Repo -Number $storyNum -Body $storyUpdatedBody
Write-Host "Updated User Story #$storyNum with task checklist" -ForegroundColor Yellow

# ─── ADD TO PROJECT BOARD ────────────────────────────────────────────────────

$projectId = Get-ProjectId -OrgName "pronative-ai" -ProjectNumber 1
Write-Host "Project ID: $projectId" -ForegroundColor Cyan

Add-IssueToProject -Owner $Owner -Repo $Repo -IssueNumber $epicNum -ProjectId $projectId
Write-Host "Added Epic #$epicNum to project" -ForegroundColor Yellow

Add-IssueToProject -Owner $Owner -Repo $Repo -IssueNumber $storyNum -ProjectId $projectId
Write-Host "Added User Story #$storyNum to project" -ForegroundColor Yellow

foreach ($tn in $taskNumbers) {
    Add-IssueToProject -Owner $Owner -Repo $Repo -IssueNumber $tn -ProjectId $projectId
    Start-Sleep -Milliseconds 200
}
Write-Host "Added all tasks to project" -ForegroundColor Yellow

# ─── SUMMARY ─────────────────────────────────────────────────────────────────

Write-Host "`n=============== SUMMARY ===============" -ForegroundColor Cyan
Write-Host "Epic:       #$epicNum - https://github.com/$Owner/$Repo/issues/$epicNum"
Write-Host "User Story: #$storyNum - https://github.com/$Owner/$Repo/issues/$storyNum"
for ($i = 0; $i -lt $tasks.Count; $i++) {
    Write-Host "Task:       #$($taskNumbers[$i]) - $($tasks[$i].Title)"
}
Write-Host "======================================" -ForegroundColor Cyan
