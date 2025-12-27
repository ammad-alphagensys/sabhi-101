import { catchAsync } from "@/library/catch-async";
import { rateLimitByUser, rateLimitByIP } from "@/library/rate-limiter";

export const globalRateLimiter = catchAsync(async (req, _, next) => {
  //  100 requests per user per 60 seconds
  if (req.user) await rateLimitByUser("global", 100, 60)(req);
  // fallback for non-authenticated users by IP
  else await rateLimitByIP("global", 50, 60)(req);
  next();
});
