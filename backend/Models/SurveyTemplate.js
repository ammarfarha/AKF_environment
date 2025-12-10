import mongoose from "mongoose";

const surveyTemplateSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    requiresApproval: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("SurveyTemplate", surveyTemplateSchema);