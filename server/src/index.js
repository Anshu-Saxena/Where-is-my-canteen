import { createApp } from './app.js';
import { config } from './config.js';
import { prisma } from './database.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Canteen API listening on port ${config.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received; closing API server.`);
  server.close(async error => {
    if (error) {
      console.error('Failed to close the API server cleanly.', error);
      process.exitCode = 1;
    }
    await prisma.$disconnect();
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
