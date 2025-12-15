import mongoose from "mongoose";

const surveyProjectSchema = new mongoose.Schema({
    surveyTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "SurveyTemplate", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isDone: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("SurveyProject", surveyProjectSchema);