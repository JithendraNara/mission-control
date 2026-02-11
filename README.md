# Mission Control

Task management system for the Mission Baseline autonomous agent team.

## Overview

Mission Control replaces manual `TASKS.md` with a proper API + UI for tracking tasks across 6 agent roles:
- Atlas (Orchestrator)
- Forge (Backend)
- Frontend (Frontend)
- Designer (Design)
- QA (QA)
- Minerva (Product/Research)

## Project Structure

```
mission-control/
├── backend/          # Fastify + TypeScript API
├── frontend/         # React + Vite UI (Frontend owns this)
├── docs/             # Architecture, API specs
└── .github/          # CI/CD workflows
```

## Quick Start

### Prerequisites
- Node.js 22+
- Docker + Docker Compose
- pnpm (or npm)

### 1. Start Infrastructure

```bash
docker-compose up -d postgres redis
```

### 2. Setup Backend

```bash
cd backend
pnpm install
pnpm db:migrate
pnpm dev
```

API runs at http://localhost:3000

### 3. Setup Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

UI runs at http://localhost:5173

## API Documentation

Once running, visit: http://localhost:3000/documentation

## Task State Machine

```
todo → doing → review → done
        ↓
      blocked → doing
```

## Environment Variables

```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/mission_control
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
```

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## License

MIT
