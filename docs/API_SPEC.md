# Mission Control API Specification

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api/v1`

## Overview

REST API for task management across the Mission Baseline agent team.

## Authentication

*Not implemented in MVP - add JWT in v1.1*

## Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "data": T | null,
  "error": {
    "code": string,
    "message": string,
    "details": unknown
  } | null,
  "meta": {
    "requestId": string,
    "timestamp": string,
    "pagination": {
      "page": number,
      "limit": number,
      "total": number
    }
  }
}
```

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_INPUT` | 400 | Validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Server error |

## Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T04:00:00.000Z"
}
```

---

### Create Task

```http
POST /tasks
```

**Body:**
```json
{
  "title": "string (required, max 200)",
  "description": "string (optional, max 2000)",
  "owner": "enum (required): atlas | forge | frontend | designer | qa | minerva",
  "priority": "enum (optional): low | normal | high | urgent (default: normal)",
  "dueDate": "ISO8601 datetime (optional)",
  "metadata": "object (optional)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string | null",
    "owner": "string",
    "status": "todo",
    "priority": "string",
    "dueDate": "datetime | null",
    "startedAt": "datetime | null",
    "completedAt": "datetime | null",
    "blockerReason": "string | null",
    "artifactPath": "string | null",
    "metadata": "object",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "meta": { "requestId": "uuid", "timestamp": "datetime" }
}
```

---

### List Tasks

```http
GET /tasks?page=1&limit=20&sort=createdAt:desc&filter=status:todo
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `sort` (string, format: `field:asc|desc`)
- `filter` (string, format: `key:value,key2:value2`)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [/* Task objects */],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42
    }
  },
  "meta": { "requestId": "uuid", "timestamp": "datetime" }
}
```

---

### Get Task

```http
GET /tasks/:id
```

**Response:** Task object or 404

---

### Update Task

```http
PATCH /tasks/:id
```

**Body:** Same as Create (all fields optional)

**Response:** Updated task object

---

### Delete Task

```http
DELETE /tasks/:id
```

**Response:**
```json
{ "success": true, "data": { "deleted": true }, "meta": {...} }
```

---

### Update Status

```http
PATCH /tasks/:id/status
```

**Body:**
```json
{
  "status": "todo | doing | review | done | blocked",
  "blockerReason": "string (required if status=blocked)"
}
```

**Response:** Updated task with new status

**Status Machine:**
- `todo` → `doing`
- `doing` → `review` | `blocked`
- `review` → `done` | `doing`
- `blocked` → `doing`
- `done` (terminal)

---

### List by Owner

```http
GET /tasks/by-owner/:owner?page=1&limit=20
```

**Response:** Paginated tasks filtered by owner role

---

### List by Status

```http
GET /tasks/by-status/:status?page=1&limit=20
```

**Response:** Paginated tasks filtered by status

---

### List Blocked Tasks

```http
GET /tasks/blocked/all
```

**Response:** Array of all blocked tasks (for Atlas dashboard)

---

### Get Enums

```http
GET /tasks/meta/enums
```

**Response:**
```json
{
  "success": true,
  "data": {
    "statuses": ["todo", "doing", "review", "done", "blocked"],
    "roles": ["atlas", "forge", "frontend", "designer", "qa", "minerva"]
  }
}
```

---

## Task Object

```typescript
interface Task {
  id: string;           // UUID
  projectId: string;    // UUID (default: zeros for MVP)
  title: string;        // max 200 chars
  description: string | null;
  owner: string;        // role identifier
  assigneeId: string | null;
  status: TaskStatus;   // todo | doing | review | done | blocked
  priority: TaskPriority; // low | normal | high | urgent
  dueDate: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  artifactPath: string | null;
  blockerReason: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Frontend Integration Guide

### Using TanStack Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3000/api/v1';

// Fetch tasks
function useTasks(params = {}) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams(params);
      const res = await fetch(`${API_URL}/tasks?${searchParams}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error.message);
      return json.data;
    },
  });
}

// Create task
function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task) => {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Update status
function useUpdateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, blockerReason }) => {
      const res = await fetch(`${API_URL}/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, blockerReason }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

## Change Log

### v1.0.0
- Initial release
- Task CRUD operations
- Status workflow
- Role-based filtering
