import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/verifyAuth";

export async function GET(req: NextRequest) {
    const user = await getAuthUser(req);

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
        user: { id: user._id, name: user.name, email: user.email },
    });
}