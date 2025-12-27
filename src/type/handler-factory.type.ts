import Joi from "joi";

export interface FactoryContext {
  req: any;
  result?: any;
}

export interface FactoryOptions {
  schema?: Joi.ObjectSchema;

  rateLimits?: Array<(req: any) => Promise<void>>;
  permissions?: Array<(req: any) => Promise<void>>;

  beforeFn?: (ctx: FactoryContext) => Promise<void>;
  createFn?: (ctx: FactoryContext) => Promise<any>;
  updateFn?: (ctx: FactoryContext) => Promise<any>;
  deleteFn?: (ctx: FactoryContext) => Promise<any>;
  afterFn?: (ctx: FactoryContext) => Promise<void>;

  invalidateModels?: string[];
  skipCacheInvalidation?: boolean;

  /** Soft delete */
  softDelete?: boolean;
}
