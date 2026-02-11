# Contributing to Mission Control

## Development Setup

### 1. Clone and Start Infrastructure

```bash
git clone https://github.com/JithendraNara/mission-control.git
cd mission-control
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev
```

API runs at http://localhost:3000  
Swagger docs at http://localhost:3000/documentation

### 3. Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

UI runs at http://localhost:5173

## Project Structure

```
mission-control/
├── backend/           # Fastify API
│   ├── src/
│   │   ├── db/           # Drizzle ORM + schema
│   │   ├── modules/      # Domain modules
│   │   └── types/        # Shared types
│   └── tests/            # Vitest tests
├── frontend/          # React + Vite UI
├── docs/              # Documentation
└── .github/workflows/ # CI/CD
```

## Testing

```bash
# Backend tests
cd backend
pnpm test

# With coverage
pnpm test --coverage
```

## Database Migrations

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

## API Design Guidelines

1. **Always use the standard response format**
2. **Validate inputs with Zod** at route level
3. **Include requestId in meta** for tracing
4. **Use proper HTTP status codes**
5. **Log errors but don't leak internals**

## Git Workflow

1. Create feature branch: `git checkout -b feat/description`
2. Make atomic commits with clear messages
3. Push and open PR
4. Ensure CI passes before merge

## Commit Message Convention

```
feat: Add new feature
fix: Fix bug
docs: Documentation change
test: Add tests
refactor: Code restructuring
chore: Maintenance tasks
```

## Code Style

- TypeScript strict mode enabled
- ESLint for linting
- Prettier for formatting (if configured)
- Prefer `async/await` over callbacks

## Questions?

Open an issue or check `docs/API_SPEC.md` for API details.
