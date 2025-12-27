import type { Request, Response, NextFunction } from "express";

/**
 *  INFO: Wraps an asynchronous Express.js middleware function with error handling.
 * @param {Function} fn - The asynchronous middleware function to be wrapped.
 * @retur {Function} Returns an Express middleware function.
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
