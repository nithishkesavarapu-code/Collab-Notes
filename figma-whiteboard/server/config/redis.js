const Redis = require('ioredis');

const redisUrl = process.env.UPSTASH_REDIS_URL;

let redisClient = null;
let pubClient = null;
let subClient = null;

if (redisUrl && !redisUrl.includes('your-upstash-endpoint')) {
  redisClient = new Redis(redisUrl);
  pubClient = new Redis(redisUrl);
  subClient = new Redis(redisUrl);

  redisClient.on('connect', () => console.log('Connected to Upstash Redis'));
  redisClient.on('error', (err) => console.error('Redis error:', err));
} else {
  console.warn("Missing UPSTASH_REDIS_URL in .env. Real-time scaling disabled.");
}

module.exports = { redisClient, pubClient, subClient };
