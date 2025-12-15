import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    surveyProject: { type: mongoose.Schema.Types.ObjectId, ref: "SurveyProject", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    note: { type: String },
    order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Answer", answerSchema);