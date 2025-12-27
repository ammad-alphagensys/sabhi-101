import { AppError } from "@/library/app-error";
import { catchAsync } from "@/library/catch-async";
import type { FactoryContext, FactoryOptions } from "@/type";
import type { Model } from "mongoose";
import { RedisCache } from "@/library/redis-cache";
import { APIFeatures } from "@/library/api-features";
import { winsLogger } from "@/library/logger";

export const createOne = (Model: Model<any>, options: FactoryOptions = {}) =>
  catchAsync(async (req, res, next) => {
    /* Rate-Limit */
    await runHooks(options.rateLimits, req);

    /* Permissions */
    await runHooks(options.permissions, req);

    const ctx: FactoryContext = { req };

    if (options.schema) {
      const { error } = options.schema.validate(req.body, { abortEarly: false });
      if (error) return next(new AppError(error.message, 400));
    }

    if (options.beforeFn) await options.beforeFn(ctx);

    ctx.result = options.createFn ? await options.createFn(ctx) : await Model.create(req.body);

    if (!ctx.result) throw new AppError("Create failed", 400);

    if (options.afterFn) await options.afterFn(ctx);

    if (!options.skipCacheInvalidation) {
      const models = options.invalidateModels ?? [Model.modelName];
      winsLogger.info(models);
      for (const _ of models) await RedisCache.instance.invalidateList(Model.modelName);
    }

    res.status(201).json({ status: "success", doc: ctx.result });
  });

export const updateOne = (Model: Model<any>, options: FactoryOptions = {}) =>
  catchAsync(async (req, res, next) => {
    /* Rate-Limit */
    await runHooks(options.rateLimits, req);

    /* Permissions */
    await runHooks(options.permissions, req);

    const ctx: FactoryContext = { req };

    if (options.schema) {
      const { error } = options.schema.validate(req.body, { abortEarly: false });
      if (error) return next(new AppError(error.message, 400));
    }

    if (options.beforeFn) await options.beforeFn(ctx);

    ctx.result = options.updateFn
      ? await options.updateFn(ctx)
      : await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });

    if (!ctx.result) throw new AppError("Document not found", 404);

    if (options.afterFn) await options.afterFn(ctx);

    if (!options.skipCacheInvalidation) {
      const models = options.invalidateModels ?? [Model.modelName];
      for (const m of models) {
        await RedisCache.instance.invalidateList(m);
        await RedisCache.instance.invalidateDoc(m, req.params.id!);
      }
    }

    res.status(200).json({ status: "success", doc: ctx.result });
  });

export const deleteOne = (Model: Model<any>, options: FactoryOptions = {}) =>
  catchAsync(async (req, res, next) => {
    /* 1️⃣ Rate limit */
    await runHooks(options.rateLimits, req);

    /* 2️⃣ Permissions */
    await runHooks(options.permissions, req);

    const ctx: FactoryContext = { req };

    try {
      ctx.result = options.deleteFn
        ? await options.deleteFn(ctx)
        : await Model.findByIdAndDelete(req.params.id);

      if (!ctx.result) next(new AppError("Document not found", 404));

      if (options.afterFn) await options.afterFn(ctx);

      if (!options.skipCacheInvalidation) {
        const models = options.invalidateModels ?? [Model.modelName];

        for (const m of models) {
          await RedisCache.instance.invalidateList(m);
          await RedisCache.instance.invalidateDoc(m, req.params.id!);
        }
      }

      res.status(204).json({ status: "success" });
    } catch (err) {
      return next(err);
    }
  });

export const getOne = (Model: Model<any>) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id).cache();

    if (req.query.populate) {
      query = new APIFeatures(query, { populate: req.query.populate as string })
        .populate()
        .cache().query;
    }

    const doc = await query;

    if (!doc) return next(new AppError("Document not found", 404));

    res.status(200).json({ status: "success", from_cache: query.isCached, doc });
  });

export const getAll = (Model: Model<any>) =>
  catchAsync(async (req, res) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate()
      .cache();

    const docs = await features.query;

    res.status(200).json({
      status: "success",
      cache: features.query.isCached,
      results: docs.length,
      docs,
    });
  });

async function runHooks(hooks: any[] | undefined, req: any) {
  if (!hooks) return;
  for (const hook of hooks) {
    await hook(req);
  }
}
