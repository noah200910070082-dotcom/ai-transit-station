# AI Gateway UI Redesign

## Direction

Build a restrained product console combining A6API's operational density with Right Code's hierarchy. Preserve real new-api behavior and remove the previous single-screen template structure.

## Application Shell

- Authentication is a standalone viewport with no sidebar.
- After authentication, show a fixed grouped sidebar, compact top bar, and scrollable content canvas.
- Member navigation: overview, usage logs, API keys, models, wallet, account.
- Admin navigation adds user management, channels, and system overview based on the backend role.
- The mobile shell uses an overlay drawer and stable top bar.

## Page Composition

### Overview

Four compact metrics, a quick-start endpoint panel, recent usage table, account summary, and invitation block. Values must be live or explicitly unavailable.

### Usage Logs

Cost, RPM, and TPM summary metrics followed by a filter toolbar and dense table. Filters include time range, token, model, group, and request ID where supported by new-api.

### API Keys

Toolbar and key table using `/api/token`. Never expose a secret beyond the backend response. Empty and loading states remain actionable.

### Models

Searchable model list from `/api/user/models`. Model names may be grouped visually by provider family but no availability is invented.

### Wallet

Current quota, redemption form, and payment methods from `/api/user/topup/info`. Disabled payment methods are explained by backend state.

### Account and Invitation

Account metadata, group, API base URL, invitation code and invitation totals. Invitation is content, not a sidebar item.

### Administration

Real user and channel tables from admin endpoints. Admin access is inferred from the authenticated backend role and is never advertised on the login screen.

## Visual System

- Canvas: `#f5f7f8`; surfaces: `#ffffff`; primary text: `#17211f`.
- Accent: teal `#0f766e`; information: blue `#2563eb`; warning: amber; danger: red.
- Border: neutral gray with high enough contrast for table scanning.
- Radius: 6-8px. No pills except statuses and compact metadata.
- Typography: system sans-serif, compact 14px body, 12px metadata, 24-28px page headings.
- Motion: 120-180ms state transitions; respect reduced motion.

## Accessibility

- Keyboard-visible focus states on all controls.
- Icon-only buttons include accessible names and tooltips.
- Status never relies on color alone.
- Tables degrade into horizontally scrollable regions on narrow screens.
- Text and controls meet WCAG AA contrast targets.

## Backend Contract

Use new-api sessions with credentials included. Boot checks `/api/status` then `/api/user/self`. Member data failures do not fabricate fallback values. Admin-only calls run only for admin roles.

## Acceptance Criteria

- Login and registration remain connected to new-api.
- Every sidebar selection renders a distinct functional view.
- Logs and models use real new-api endpoints.
- Language selection changes all primary navigation and page copy.
- Desktop and mobile layouts have no overlap or clipped controls.
- `npm run build` and `npm run design:check` complete successfully.
