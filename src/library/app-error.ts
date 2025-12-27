export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export type PermissionFn = (req: any) => void | Promise<void>;

export const requireRole =
  (...roles: string[]): PermissionFn =>
  async (req) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this task", 403);
    }
  };

export const requireOwnership =
  (getOwnerId: (req: any) => Promise<string | null>): PermissionFn =>
  async (req) => {
    const ownerId = await getOwnerId(req);
    if (!ownerId || ownerId !== req.user.id) {
      throw new AppError("You do not have permission to perform this task", 403);
    }
  };
