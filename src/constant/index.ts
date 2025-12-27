import { envJoi } from "@/validation";
export class Constant {
  private static _instance: Constant;

  readonly server: { port: number; apiVersion: string; nodeEnv: string };
  readonly appUrl: string;
  readonly sentry: { dsn: string };
  readonly redis: { host: string; port: number; password: string };
  readonly db: { url: string };
  readonly google: { clientId: string; clientSecret: string; redirectUrl: string };
  readonly s3: { bucket: string; accessKey: string; secretKey: string; region: string };
  readonly jwt: {
    accessSecret: string;
    refreshSecret: string;
    resetSecret: string;
    accessExpire: string;
    refreshExpire: string;
    resetExpire: string;
  };
  readonly mailtrap: { from: string; host: string; port: number; userName: string; password: string };
  readonly sendgrid: { from: string; host: string; port: number; apiKey: string };

  private constructor() {
    const { error, value: env } = envJoi.validate(Bun.env, { allowUnknown: true, abortEarly: false });
    if (error) {
      throw new Error(`Environment validation error: ${error.message}`);
    }

    this.server = {
      port: Number(env.PORT),
      apiVersion: env.API_VERSION,
      nodeEnv: env.NODE_ENV,
    };

    this.appUrl = env.APP_URL;

    this.sentry = { dsn: env.SENTRY_DSN ?? "" };

    this.redis = {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
      password: env.REDIS_PASSWORD,
    };

    this.db = { url: env.MONGO_URL };

    this.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUrl: env.GOOGLE_REDIRECT_URI,
    };

    this.s3 = {
      bucket: env.S3_BUCKET_NAME,
      accessKey: env.S3_ACCESS_KEY,
      secretKey: env.S3_SECRET_KEY,
      region: env.S3_REGION,
    };

    this.jwt = {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      resetSecret: env.JWT_RESET_SECRET,
      accessExpire: env.JWT_ACCESS_EXPIRE,
      refreshExpire: env.JWT_REFRESH_EXPIRE,
      resetExpire: env.JWT_RESET_EXPIRE,
    };

    this.mailtrap = {
      from: env.MAILTRAP_FROM,
      host: env.MAILTRAP_HOST,
      port: Number(env.MAILTRAP_PORT),
      userName: env.MAILTRAP_USERNAME,
      password: env.MAILTRAP_PASSWORD,
    };

    this.sendgrid = {
      from: env.SENDGRID_SENDER_EMAIL,
      host: env.SENDGRID_HOST,
      port: Number(env.SENDGRID_PORT),
      apiKey: env.SENDGRID_API_KEY,
    };
  }

  static get instance(): Constant {
    if (!Constant._instance) Constant._instance = new Constant();
    return Constant._instance;
  }

  /** Mask secrets for logging */
  private mask(secret: string): string {
    if (!secret) return "";
    return secret.slice(0, 4) + "...";
  }

  /** Safe string representation without exposing secrets */
  public toString(): string {
    const { server, db, s3, jwt, mailtrap } = this;
    return `
          ============= Env Variables <Start> =============
          server: { port: ${server.port}, nodeEnv: ${server.nodeEnv}, apiVersion: ${server.apiVersion} }
          db: { url: ${db.url} }
          s3: { bucket: ${s3.bucket}, region: ${s3.region}, accessKey: ${this.mask(s3.accessKey)}, secretKey: ${this.mask(s3.secretKey)} }
          jwt: { accessSecret: ${this.mask(jwt.accessSecret)}, refreshSecret: ${this.mask(jwt.refreshSecret)} }
          mailtrap: { from: ${mailtrap.from}, host: ${mailtrap.host}, port: ${mailtrap.port}, userName: ${mailtrap.userName}, password: ${this.mask(mailtrap.password)} }
          ============= Env Variables <End> =============
`;
  }
}
