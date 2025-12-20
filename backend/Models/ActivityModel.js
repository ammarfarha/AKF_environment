import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    description: { type: String },
}, { timestamps: true });

export default mongoose.model("Activity", activitySchema);