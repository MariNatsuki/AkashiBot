import Redis from 'ioredis';
import { createModule } from 'utils/create-module';

export default createModule(() => {
  const redis = new Redis({
    host: Bun.env.REDIS_HOST,
    port: Bun.env.REDIS_PORT,
    password: Bun.env.REDIS_PASSWORD,
  });

  return {
    name: 'Redis',
    provide: {
      redis,
    },
  };
});
