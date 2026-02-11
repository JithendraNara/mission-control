# Mission Control - Project Roadmap

## Phase 1: MVP (Current)
**Goal:** Working task management API + basic UI

### Backend (Forge) ✅
- [x] Fastify + TypeScript setup
- [x] PostgreSQL + Drizzle ORM
- [x] Task CRUD endpoints
- [x] Status workflow (todo→doing→review→done/blocked)
- [x] Role-based filtering
- [x] Swagger documentation
- [x] Test suite
- [x] Docker Compose setup

### Frontend (Frontend) 🔄
- [ ] Vite + React + Tailwind setup
- [ ] Task list view with filters
- [ ] Task card component
- [ ] Create/Edit forms
- [ ] Status update UI
- [ ] Blocked tasks dashboard
- [ ] API integration with TanStack Query

### Design (Designer) 🔄
- [ ] Design system (colors, typography, spacing)
- [ ] Task card mockup
- [ ] List view mockup
- [ ] Form mockups
- [ ] Responsive breakpoints

### QA (QA) 🔄
- [ ] API integration tests
- [ ] E2E test suite (Playwright)
- [ ] CI/CD workflow refinement
- [ ] Release checklist

### Product (Minerva) 🔄
- [x] Requirements defined (implied by API)
- [ ] User stories documentation
- [ ] Competitive analysis (Linear, GitHub Projects)

---

## Phase 2: Enhanced Collaboration
**Goal:** Real-time updates, notifications, agent webhooks

- [ ] WebSocket support for live updates
- [ ] Webhook system for agent notifications
- [ ] Email/Slack integration
- [ ] Task comments/threads
- [ ] File attachments

---

## Phase 3: Intelligence
**Goal:** AI-assisted task management

- [ ] Auto-prioritization suggestions
- [ ] Blocker prediction
- [ ] Workload balancing across agents
- [ ] Sprint planning automation

---

## Technical Debt

- [ ] Add authentication (JWT)
- [ ] Rate limiting
- [ ] Request logging/monitoring
- [ ] Database backups
- [ ] Production deployment config
