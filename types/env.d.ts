declare module 'bun' {
  interface Env {
    APP_NAME: string;
    APP_ENV: string;
    DEBUG?: boolean;

    REDIS_HOST: string;
    REDIS_PASSWORD?: string;
    REDIS_PORT: number;

    DISCORD_TOKEN: string;
    LOCALE?: string;
    OPENAI_ENDPOINT?: string;
    OPENAI_API_KEY: string;
    OPENAI_CHATGPT_MODEL: string;
  }
}

export {};
