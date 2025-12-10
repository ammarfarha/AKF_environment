import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    description: { type: String },
    // status: { type: String, enum: ["pending", "inProgress", "done"], default: "pending" },
    //   startDate: { type: Date },
    //   endDate: { type: Date }
}, { timestamps: true });

export default mongoose.model("Activity", activitySchema);