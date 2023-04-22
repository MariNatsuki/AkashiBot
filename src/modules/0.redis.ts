import Redis from 'ioredis';

import { createModule } from '../utils/create-module';

export default createModule(() => {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  });

  return {
    name: 'Redis',
    provide: {
      redis
    }
  };
});
