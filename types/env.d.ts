declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_NAME: string;
      APP_ENV: string;

      REDIS_HOST: string;
      REDIS_PASSWORD?: string;
      REDIS_PORT: number;

      DISCORD_TOKEN: string;
      LOCALE?: string;
      OPENAI_ENDPOINT?: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};
