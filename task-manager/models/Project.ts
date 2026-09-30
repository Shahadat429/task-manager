import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  workspace: Types.ObjectId; // denormalized from team, avoids a join on every auth check
  team: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ workspace: 1 });
ProjectSchema.index({ team: 1 });

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
  