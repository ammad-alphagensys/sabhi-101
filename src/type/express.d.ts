import type { IUser } from "./"

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}
