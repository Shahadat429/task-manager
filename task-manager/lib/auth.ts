import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
}

export interface AuthTokenPayload {
    userId: string;
    email: string;
}

export function signToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
    // Throws if invalid/expired - callers catch this and respond 401.
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

