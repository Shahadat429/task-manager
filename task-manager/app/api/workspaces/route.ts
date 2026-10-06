import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Workspace } from "@/models/Workspace";
import { getAuthUser } from "@/lib/verifyAuth";

const createWorkspaceSchema = z.object({
    name: z.string().min(2).max(100),
});

function slugify(name: string): string {
    return (
        name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") +
        "-" +
        Math.random().toString(36).slice(2, 7) // short suffix, keeps slugs unique without a lookup loop
    );
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createWorkspaceSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: z.flattenError(parsed.error) },
                { status: 400 }
            );
        }

        await connectDB();

        const workspace = await Workspace.create({
            name: parsed.data.name,
            slug: slugify(parsed.data.name),
            owner: user._id,
            members: [{ user: user._id, role: "owner", joinedAt: new Date() }],
        });

        return NextResponse.json({ workspace }, { status: 201 });
    } catch (err) {
        console.error("Create workspace error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const workspaces = await Workspace.find({ "members.user": user._id }).sort({
            createdAt: -1,
        });

        return NextResponse.json({ workspaces });
    } catch (err) {
        console.error("List workspaces error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}