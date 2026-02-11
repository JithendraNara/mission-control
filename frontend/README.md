# Mission Control - Frontend

React + TypeScript + Vite + Tailwind CSS frontend for the Mission Control task management system.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **TanStack Query** - Data fetching
- **React Router** - Routing
- **Zustand** - State management

## Setup

```bash
pnpm install
pnpm dev
```

## Project Structure (To Be Implemented)

```
frontend/src/
├── components/     # Reusable UI components
├── features/       # Feature-based modules
│   └── tasks/      # Task management feature
├── hooks/          # Custom React hooks
├── lib/            # Utilities
├── stores/         # Zustand stores
├── types/          # TypeScript types
└── App.tsx         # Root component
```

## API Integration

See `/docs/API_SPEC.md` for backend integration details.

Base URL: `http://localhost:3000/api/v1`

## Features Needed

- [ ] Task list view with filters
- [ ] Task card component
- [ ] Create/Edit task forms
- [ ] Status update workflow
- [ ] Blocked tasks dashboard
- [ ] Role-based views
