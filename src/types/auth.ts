export type UserRole = "user" | "admin" | "developer";

export interface VerificationToken {
  email: string;
  type: "user" | "admin";
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: number;
  role: UserRole;
}

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      verificationToken?: VerificationToken;
    }
  }
}
