# FBM Order Dashboard

Browser-based SPA for grouping and reviewing unshipped Amazon.de FBM (Fulfillment by Merchant) orders. Built with TypeScript and zero framework dependencies.

## Tech Stack

- **Language:** TypeScript 5.7 (ES2022 target)
- **Runtime:** Node.js 22+
- **Build:** TypeScript Compiler (`tsc`) — no bundler
- **Modules:** ES modules (`"type": "module"`)
- **Output:** Vanilla JS, HTML, CSS served as static files
- **Persistence:** Browser `localStorage` with in-memory fallback

## Prerequisites

- Node.js 22+
- npm 10+

## Getting Started

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Serve locally (requires npx)
npm start
```

Open `http://localhost:8080` in a browser.

## Project Structure

```
src/
├── app/                  # Entry point and shell orchestration
│   ├── index.ts
│   └── shell.ts
├── components/           # UI rendering (pure functions)
│   ├── activity_log/
│   ├── dashboard/
│   └── order_details/
├── data/
│   └── mock/             # Embedded mock dataset and provider
├── domain/
│   └── orders/           # Pure domain logic (grouping, review, summaries)
├── state/                # Client state, persistence, activity log
└── types/                # Shared TypeScript type definitions
public/
├── index.html
├── styles.css
└── js/                   # Compiled output (gitignored)
```

## Architecture

| Layer | Responsibility |
|-------|---------------|
| **Types** | `Order`, `OrderItem`, `GroupCategory`, `ReviewFlag`, etc. |
| **Domain** | Pure functions for grouping, review-flagging, and summary calculations |
| **Mock Provider** | Supplies embedded mock data behind an `OrderProvider` interface |
| **State** | `OrderStateStore` (localStorage persistence + duplicate prevention), `ActivityLog` |
| **Components** | Pure HTML-string renderers with delegated event handling |
| **Shell** | Bootstraps the app, wires state and components, handles clicks |

All grouping and review logic lives in `src/domain/orders/` as isolated pure functions with no DOM dependencies, making them testable and swappable when real API integration is added.

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `public/js/` |
| `npm start` | Serve `public/` on port 8080 |

## CI/CD

Pull requests trigger a GitHub Actions workflow that runs the build and then dispatches ADLC review agents (code review + critic review).

## License

Private — internal use.
