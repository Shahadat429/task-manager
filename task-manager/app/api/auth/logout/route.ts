import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true }, { status: 200 });

    // Overwrite with an already-expired cookie - the standard way to clear an httpOnly cookie, since client JS can't delete it directly.
    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });

    return response;
}