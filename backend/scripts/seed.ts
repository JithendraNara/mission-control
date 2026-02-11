import 'dotenv/config';
import { db } from './src/db/index.js';
import { tasks } from './src/db/schema.js';

async function seed() {
  console.log('🌱 Seeding database...');

  const sampleTasks = [
    {
      title: 'Design system foundation',
      description: 'Create color palette, typography, and spacing tokens',
      owner: 'designer',
      priority: 'high',
      status: 'doing',
    },
    {
      title: 'API authentication',
      description: 'Implement JWT auth for API endpoints',
      owner: 'forge',
      priority: 'high',
      status: 'todo',
    },
    {
      title: 'React component library',
      description: 'Build reusable task card and list components',
      owner: 'frontend',
      priority: 'normal',
      status: 'todo',
    },
    {
      title: 'E2E test suite',
      description: 'Set up Playwright for critical path testing',
      owner: 'qa',
      priority: 'normal',
      status: 'blocked',
      blockerReason: 'Waiting for frontend implementation',
    },
    {
      title: 'Competitor analysis',
      description: 'Research Linear, GitHub Projects, Asana workflows',
      owner: 'minerva',
      priority: 'low',
      status: 'done',
    },
  ];

  for (const task of sampleTasks) {
    await db.insert(tasks).values(task);
  }

  console.log(`✅ Seeded ${sampleTasks.length} tasks`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
