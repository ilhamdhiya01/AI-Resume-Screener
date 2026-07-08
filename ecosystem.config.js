/**
 * @file PM2 ecosystem configuration for production deployment.
 * Manages the Next.js web app and multiple BullMQ worker processes.
 *
 * How to use:
 * 1. Install PM2 globally: `npm install -g pm2`
 * 2. Start all processes: `pm2 start ecosystem.config.js`
 * 3. Check status: `pm2 status`
 * 4. View logs: `pm2 logs`
 * 5. Restart all: `pm2 restart ecosystem.config.js`
 * 6. Stop all: `pm2 stop ecosystem.config.js`
 */
module.exports = {
  apps: [
    {
      name: 'resume-web',
      script: 'pnpm',
      args: 'start',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      log_file: './logs/web.log',
      out_file: './logs/web.out.log',
      error_file: './logs/web.err.log',
      merge_logs: true,
    },
    {
      name: 'resume-worker',
      script: 'pnpm',
      args: 'worker',
      interpreter: 'none',
      instances: 5,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      log_file: './logs/worker.log',
      out_file: './logs/worker.out.log',
      error_file: './logs/worker.err.log',
      merge_logs: true,
    },
  ],
};
