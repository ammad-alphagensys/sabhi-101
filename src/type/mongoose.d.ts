import "mongoose";

declare module "mongoose" {
  interface Query<ResultType, DocType, THelpers = {}, RawDocType = DocType> {
    /** Enable Redis caching for this query */
    cache(options?: { key?: string; ttl?: number }): this;

    /** Internal flags */
    useCache?: boolean;
    hashKey?: string;
    isCached?: boolean;
    ttl?: number;
    op: string;
    customCacheKey?: string;
  }
}
