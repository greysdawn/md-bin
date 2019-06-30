module.exports = {
  apps : [{
    name: 'md-bin',
    script: 'index.js',

    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
