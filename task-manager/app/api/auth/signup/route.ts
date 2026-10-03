import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

const signupSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.email(),
    password: z.string().min(8),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = signupSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: z.flattenError(parsed.error) },
                { status: 400 }
            );
        }

        const { name, email, password } = parsed.data;

        await connectDB();

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        // Password is hashed by the User model's pre-save hook - never hash here.
        const user = await User.create({ name, email, password });

        const token = signToken({ userId: user._id.toString(), email: user.email });

        const response = NextResponse.json(
            { user: { id: user._id, name: user.name, email: user.email } },
            { status: 201 }
        );

        // httpOnly so client-side JS can't read it (XSS protection). The real-time server reads this same token from the socket handshake, not the cookie.
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days, matches signToken's expiresIn
            path: "/",
        });

        return response;
    } catch (err) {
        console.error("Signup error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}