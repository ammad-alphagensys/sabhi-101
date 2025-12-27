import type { Request, Response } from "express";
import type { NextFunction } from "express-serve-static-core";
import { Error } from "mongoose";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { MulterError } from "multer";

import { Constant } from "@/constant";
import { AppError } from "@/library/app-error";
import { winsLogger } from "@/library/logger";

const handleCastErrorDB = (err: Error.CastError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleMulterError = (_: MulterError) => {
  const message = "please send file in right path";
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const key = Object.keys(err.keyValue!).join(".");
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${key} ${value.replace(
    "\\",
    "",
  )}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: Error.ValidationError) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data - ${errors.join(" & ")}`;
  return new AppError(message, 400);
};

function handleInvalidLocation(_: Error) {
  return new AppError("invalid cooridnates please send long-lat format", 400);
}
const handleJWTError = () => new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  console.error("ERROR 💥", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  // Send error to Sentry
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    // A) OPERATIONAL, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    winsLogger.error("ERROR 💥", err);
    // 2) Send generic message

    return res?.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  winsLogger.error(`ERROR 💥 ${err}`);

  // 2) Send generic message
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later.",
  });
};

/*  MIDDLEWARE: ERROR */
export const errorMiddleware = (err: any, req: Request, res: Response, _: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  const nodeEnv = Constant.instance.server.nodeEnv;

  winsLogger.error(`Error 💥 ${nodeEnv} : ${err}`);
  if (nodeEnv === "development") {
    sendErrorDev(err, req, res);
  } else if (nodeEnv === "production" || nodeEnv === "test") {
    let error = err;
    error.message = err.message;

    if (error instanceof Error.CastError) error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    if (error.code === 16755) error = handleInvalidLocation(error);

    if (error instanceof Error.ValidationError) error = handleValidationErrorDB(error);

    if (error instanceof MulterError) error = handleMulterError(error);

    if (error instanceof JsonWebTokenError) error = handleJWTError();

    if (error instanceof TokenExpiredError) error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
