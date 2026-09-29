import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type WorkspaceRole = "owner" | "admin" | "member";

export interface IWorkspaceMember {
    user: Types.ObjectId;
    role: WorkspaceRole;
    joinedAt: Date;
}

export interface IWorkspace extends Document {
    name: string;
    slug: string;
    owner: Types.ObjectId;
    members: IWorkspaceMember[];
    createdAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["owner", "admin", "member"], required: true, default: "member" },
        joinedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const WorkspaceSchema = new Schema<IWorkspace>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        members: { type: [WorkspaceMemberSchema], default: [] },
    },
    { timestamps: true }
);

// Every write that touches a workspace needs to check the member's role,
// so this index makes "am I a member, and what's my role" cheap to query.
WorkspaceSchema.index({ "members.user": 1 });

export const Workspace: Model<IWorkspace> =
    mongoose.models.Workspace || mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);

