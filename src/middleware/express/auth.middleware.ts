import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "@/library/catch-async";
import { AppError } from "@/library/app-error";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { winsLogger } from "@/library/logger";
import { Constant } from "@/constant";
import { User } from "@/model";
import { EUserStatus } from "@/enum";

export const restrictTo = (...roles: string[]) => {
  return (req: Request, _: Response, next: NextFunction) => {
    let roleAccess = null;
    for (const role of roles) {
      if (req.user?.role.includes(role)) {
        roleAccess = role;
        break;
      }
    }
    if (!roleAccess) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    /*  INFO: 1) GETTING_TOKEN_ */
    let accessToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      accessToken = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      accessToken = req.cookies.accessToken;
      winsLogger.info("AccessToken Coming From httpCookie :::");
    }

    if (!accessToken) {
      return next(
        new AppError(
          "Token not found. You are not logged in! Please log in to get access",
          401,
        ),
      );
    }

    /*  INFO: 2) VERIFICATION_TOKEN */
    const decoded = jwt.verify(
      accessToken,
      Constant.instance.jwt.accessSecret,
    ) as JwtPayload;

    /* 3) CHECK_IF_USER_STILL_EXISTS */
    const currentUser = await User.findById(decoded.id);

    /** 4) CHECK_IF_USER_EMAIL_VERIFIED
     * IGNORE this check in test environment
     * */
    if (!currentUser?.email_verified && Constant.instance.server.nodeEnv !== "test") {
      return next(
        new AppError(
          "Please verify your email.",
          403,
        ),
      );
    }

    /* Check Block*/
    if (currentUser?.status === EUserStatus.BLOCKED)
      return next(new AppError("You Are Blocked By Admin", 403));

    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does not longer exist.",
          401,
        ),
      );
    }

    // 4)  TODO:: Check if user changed password after the token was issued
    // if (currentUser?.changePasswordAfter(decoded.iat!)) {
    //   return next(
    //     new AppError(
    //       "User recently changed password! Please log in again.",
    //       401
    //     )
    //   );
    // }

    //  INFO: GRANT_ACCESS_TO_PROTECTED_ROUTE
    req.user = currentUser;

    res.locals.user = currentUser;
    // req.token = accessToken;
    next();
  },
);
