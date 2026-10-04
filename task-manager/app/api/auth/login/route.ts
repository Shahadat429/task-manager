import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signToken } from "@/lib/auth";

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: z.flattenError(parsed.error) },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        await connectDB();

        // password has `select: false` on the schema, so it must be explicitly requested here - this is the one place in the app that needs it.
        const user = await User.findOne({ email }).select("+password");

        // Same error for "no such user" and "wrong password" - don't leak which one it was, that's a free account-enumeration oracle otherwise.
        if (!user || !(await user.comparePassword(password))) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const token = signToken({ userId: user._id.toString(), email: user.email });

        const response = NextResponse.json(
            { user: { id: user._id, name: user.name, email: user.email } },
            { status: 200 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}