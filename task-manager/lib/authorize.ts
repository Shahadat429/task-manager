import { connectDB } from "@/lib/db";
import { Workspace, IWorkspace, WorkspaceRole } from "@/models/Workspace";

const ROLE_RANK: Record<WorkspaceRole, number> = {
    member: 0,
    admin: 1,
    owner: 2,
};

/**
 * Loads a workspace and resolves the given user's role within it in one
 * step. Returns null if the workspace doesn't exist OR the user isn't a
 * member - routes treat both cases the same way (404/403), so they're
 * deliberately not distinguished here.
 */
export async function getWorkspaceAndRole(
    workspaceId: string,
    userId: string
): Promise<{ workspace: IWorkspace; role: WorkspaceRole } | null> {
    await connectDB();

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return null;

    const member = workspace.members.find((m) => m.user.toString() === userId);
    if (!member) return null;

    return { workspace, role: member.role };
}

/**
 * Role check with "at least this level" semantics - owner > admin > member.
 * e.g. hasMinimumRole(role, "admin") is true for both admin and owner.
 * Use this instead of an exact match for most permission checks.
 */
export function hasMinimumRole(role: WorkspaceRole, minimum: WorkspaceRole): boolean {
    return ROLE_RANK[role] >= ROLE_RANK[minimum];
}