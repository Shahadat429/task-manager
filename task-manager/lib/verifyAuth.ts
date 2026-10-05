import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/User";

/**
 * Reads the `token` cookie, verifies it, and loads the user it belongs to.
 * Returns null on any failure (missing cookie, expired/invalid token, or
 * user no longer exists) - callers just check for null and return 401.
 *
 * Deliberately re-fetches the user from the DB rather than trusting the
 * token payload alone: the token only carries userId/email, and a route
 * might need fresher fields (e.g. if you add an `isDisabled` flag later,
 * this is the one place that check lives).
 */
export async function getAuthUser(req: NextRequest): Promise<IUser | null> {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        return null; // expired or tampered
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    return user ?? null;
}