module.exports = {
  apps: [
    {
      name: 'discord-watchtower-worker',
      script: './index.js',
      env: {
        DEBUG: 'discord-watchtower*',
        WORKER: 1
      }
    },
    {
      name: 'discord-watchtower-api',
      script: './index.js',
      env: {
        DEBUG: 'discord-watchtower*'
      },
      exec_mode: 'cluster',
      instances: 'auto'
    }
  ]
}
