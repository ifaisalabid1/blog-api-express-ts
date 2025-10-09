import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}
