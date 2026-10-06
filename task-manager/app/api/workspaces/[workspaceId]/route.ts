import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Workspace } from "@/models/Workspace";
import { getAuthUser } from "@/lib/verifyAuth";
import { getWorkspaceAndRole, hasMinimumRole } from "@/lib/authorize";

const updateWorkspaceSchema = z.object({
    name: z.string().min(2).max(100),
});

type Params = { params: Promise<{ workspaceId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId } = await params;
    const result = await getWorkspaceAndRole(workspaceId, user._id.toString());
    // Not found and not-a-member both 404 here - see lib/authorize.ts for why.
    if (!result){
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ workspace: result.workspace, role: result.role });
}

export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { workspaceId } = await params;
        const result = await getWorkspaceAndRole(workspaceId, user._id.toString());
        if (!result){
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (!hasMinimumRole(result.role, "admin")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const parsed = updateWorkspaceSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: z.flattenError(parsed.error) },
                { status: 400 }
            );
        }

        result.workspace.name = parsed.data.name;
        await result.workspace.save();

        return NextResponse.json({ workspace: result.workspace });
    } catch (err) {
        console.error("Update workspace error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const user = await getAuthUser(req);
        if (!user){
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { workspaceId } = await params;
        const result = await getWorkspaceAndRole(workspaceId, user._id.toString());
        if (!result){
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Deliberately stricter than PATCH: only the owner can delete, not admins.
        // Deleting the whole workspace is destructive enough to reserve for owner.
        if (result.role !== "owner") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await Workspace.findByIdAndDelete(workspaceId);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete workspace error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}