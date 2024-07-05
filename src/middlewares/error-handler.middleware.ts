import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorHandler implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (err) {
      const status = err.status || 500;
      const message = err.message || 'Internal Server Error';

      res.status(status).json({
        code: status,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method,
        message,
      });
    }
  }
}
