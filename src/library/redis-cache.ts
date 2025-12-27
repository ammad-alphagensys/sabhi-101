import { createClient, type RedisClientType } from "redis";
import { Constant } from "@/constant";
import { winsLogger } from "./logger";

/*
 * Singleton Class For Managing a Redis Cache Instance.
 *
 * This class provides a singleton instance of a Redis client configured
 * with connection details from the application's constants. It initializes
 * the Redis client upon instantiation and logs initialization status.
 */
export class RedisCache {
  private static _instance: RedisCache;
  readonly client: RedisClientType;

  /*
   * Private constructor initializes the Redis client using connection details
   * from the application's constants.
   */
  private constructor() {
    if (Constant.instance.server.nodeEnv === "test") this.client = createClient();
    else {
      const { password, port, host } = Constant.instance.redis;

      this.client = createClient({
        password,
        socket: {
          host,
          port: +port,
        },
      });
    }
  }

  /*
   * Initializes the Redis client connection asynchronously.
   * Logs success or failure during Redis initialization.
   */
  async initialize() {
    await this.client.connect();
    this.client.on("connect", () => winsLogger.info("REDIS_CONNECTED_SUCCESSFULLY"));
    this.client.on("error", (err) => winsLogger.error("REDIS_ERROR", err));
  }

  /*
   * Static method to retrieve the singleton instance of RedisCache.
   *
   * If an instance already exists, returns it; otherwise, creates a new instance.
   *
   * @returns The singleton instance of RedisCache.
   */
  static get instance(): RedisCache {
    if (RedisCache._instance != null) return RedisCache._instance;
    this._instance = new RedisCache();
    return RedisCache._instance;
  }

  /**
   * Invalidate cache keys by pattern using SCAN (safe for production)
   */
  private async invalidateByPattern(pattern: string) {
    let cursor = "0";
    const keys: string[] = [];

    do {
      const result = await this.client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });

      cursor = result.cursor;
      keys.push(...result.keys);
    } while (cursor !== "0");

    console.log(keys);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  /**
   * Invalidate ALL list caches for a model
   */
  async invalidateList(modelName: string) {
    return this.invalidateByPattern(`*"model":"${modelName}","scope":"list"*`);
  }

  /**
   * Invalidate a SINGLE document cache
   */
  async invalidateDoc(modelName: string, id: string) {
    return this.invalidateByPattern(`*"model":"${modelName}","scope":"doc"*${id}*`);
  }
  /** Graceful shutdown */
  async shutdown(): Promise<void> {
    if (this.client) {
      winsLogger.info("Closing Redis connection...");
      await this.client.quit();
    }
  }
}
