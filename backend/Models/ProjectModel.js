import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String },
    description: { type: String },
    status: { type: String, enum: ["proposed","do", "cancelled", "work"], default: "proposed" },
    screeningDate: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);