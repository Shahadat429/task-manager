import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITeam extends Document {
  name: string;
  workspace: Types.ObjectId;
  members: Types.ObjectId[]; // subset of workspace.members
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Almost every query is "give me this workspace's teams" - index the pair.
TeamSchema.index({ workspace: 1 });

export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);