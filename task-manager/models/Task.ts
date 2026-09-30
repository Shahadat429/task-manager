import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface ITask extends Document {
    title: string;
    description?: string;
    status: TaskStatus;
    workspace: Types.ObjectId; // denormalized again - same reasoning as Project
    project: Types.ObjectId;
    assignee?: Types.ObjectId;
    createdBy: Types.ObjectId;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
        workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
        project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        assignee: { type: Schema.Types.ObjectId, ref: "User" },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        dueDate: { type: Date },
    },
    { timestamps: true }
);

TaskSchema.index({ project: 1 });
TaskSchema.index({ workspace: 1, assignee: 1 });

export const Task: Model<ITask> =
    mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

