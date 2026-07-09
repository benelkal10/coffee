import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

export const redisConnection = process.env.USE_MOCK === 'true' 
  ? null as any 
  : new Redis({
      host: redisHost,
      port: redisPort,
      maxRetriesPerRequest: null,
    });

if (redisConnection) {
  redisConnection.on('connect', () => {
    console.log('Redis connected successfully');
  });

  redisConnection.on('error', (err: any) => {
    console.error('Redis connection error:', err);
  });
} else {
  console.log('Redis: Running in Mock Mode (Bypassed Connection)');
}
