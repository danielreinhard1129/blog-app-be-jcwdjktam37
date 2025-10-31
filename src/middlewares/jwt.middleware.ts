import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { verify } from "jsonwebtoken";
import { Role } from "../generated/prisma";

export class JwtMiddleware {
  verifyToken = (secretKey: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new ApiError("No token provided", 401);
      }

      verify(token, secretKey, (err, payload) => {
        if (err) {
          throw new ApiError("invalid token / token expired", 401);
        }

        res.locals.user = payload;
        next();
      });
    };
  };

  verifyRole = (roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = res.locals.user.role;

      if (!userRole || !roles.includes(userRole)) {
        throw new ApiError("Unauthorized", 401);
      }

      next();
    };
  };
}
