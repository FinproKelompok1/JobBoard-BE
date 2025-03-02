import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      file?: any;
      files?: any;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    file?: any;
    files?: any;
  }
}
