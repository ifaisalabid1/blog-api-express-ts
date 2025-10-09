import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import logger from "../utils/logger";

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        logger.warn("Validation error:", { errors, body: req.body });

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      logger.error("Unexpected validation error:", error);
      next(error);
    }
  };
};
