import { spawn } from 'node:child_process';
import * as process from 'node:process';

async function run() {
  console.log('Applying migrations to messenger database');
  await migrateDatabase();
  console.log('Migration completed!');
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: true, stdio: 'inherit' });

    child.on('error', reject);

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Process exited with code ${code}`));
    });
  });
}

async function migrateDatabase(): Promise<void> {
  const mode = process.argv.at(2) ?? 'dev';
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL must be provided in .env');
  }

  console.log(`Running migration with ${mode} mode`);

  await runCommand('npx', [
    'cross-env',
    `DATABASE_URL=${url}`,
    'prisma',
    'migrate',
    mode,
    '--config=.config/prisma.ts',
  ]);
}

run().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
