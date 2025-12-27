export type OptionalService<T> = T | undefined;

export interface IConstant {
  server: { port: number; nodeEnv: string; apiVersion: string };
  appUrl: string;
  db: { url: string };
  redis: { host: string; port: number; password: string };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    resetSecret: string;
    accessExpire: string;
    refreshExpire: string;
    resetExpire: string;
  };
  s3?: { bucket: string; accessKey: string; secretKey: string; region: string };
  mailtrap?: { from: string; host: string; port: number; userName: string; password: string };
  sendgrid?: { from: string; host: string; port: number; apiKey: string };
  google?: { clientId: string; clientSecret: string; redirectUrl: string };
  sentry?: { dsn: string };
}

