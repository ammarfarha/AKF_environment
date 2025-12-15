import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema({
    surveyProject: { type: mongoose.Schema.Types.ObjectId, ref: "SurveyProject", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recommendations: { type: String }
}, { timestamps: true });

export default mongoose.model("Approval", approvalSchema);