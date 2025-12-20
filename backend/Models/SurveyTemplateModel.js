import mongoose from "mongoose";

const surveyTemplateSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true , unique: true},
    description: { type: String },
    requiresApproval: { type: Boolean, default: false },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "SurveyTemplate" }]
}, { timestamps: true });

export default mongoose.model("SurveyTemplate", surveyTemplateSchema);