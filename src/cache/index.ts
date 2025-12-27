import mongoose from "mongoose";
import stringify from "fast-json-stable-stringify";
import { RedisCache } from "@/library/redis-cache";

/**
 * Enhances Mongoose queries with caching support.
 */
export const enhanceQueryWithCache = () => {
  const exec = mongoose.Query.prototype.exec;

  mongoose.Query.prototype.cache = function (options: {
    key?: string;
    ttl?: number;
  } = {}) {
    this.useCache = true;
    this.ttl = options.ttl ?? 60 * 60 * 24; // 24h
    this.customCacheKey = options.key;
    return this;
  };

  mongoose.Query.prototype.exec = async function (...args: any[]) {
    if (!this.useCache) {
      return exec.apply(this, args);
    }

    try {
      /** 🔥 AUTO SCOPE DETECTION */
      const scope =
        this.op === "findOne" || this.op === "findById"
          ? "doc"
          : "list";

      const key =
        this.customCacheKey ??
        stringify({
          model: this.model.modelName,
          scope,
          op: this.op,

          // 🔑 QUERY SHAPE (THIS IS THE IMPORTANT PART)
          filter: this.getFilter(),
          options: this.getOptions(),

          // 🔥 THESE ARE OFTEN MISSED
          fields: this._fields,
          populate: this._mongooseOptions?.populate,
        });


      const cached = await RedisCache.instance.client.json.get(key);
      if (cached) {
        this.isCached = true;
        return cached;
      }

      const result = await exec.apply(this, args);

      await RedisCache.instance.client.json.set(key, "$", result);
      await RedisCache.instance.client.expire(key, this.ttl ?? 60 * 60 * 24);

      this.isCached = false;
      return result;
    } catch (err) {
      console.error("Redis cache error:", err);
      return exec.apply(this, args);
    }
  };
};

/**
 * Clears a Redis cache entry associated with a hash key
 * @param hashKey
 */
export const clearHash = async (hashKey: string) => {
  try {
    await RedisCache.instance.client.del(JSON.stringify(hashKey));
  } catch (err) {
    console.error("Failed to clear cache:", err);
  }
};
