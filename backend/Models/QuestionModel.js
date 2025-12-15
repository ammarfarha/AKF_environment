import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    surveyTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "SurveyTemplate", required: true },
    questionText: { type: String, required: true },
    type: { type: String, enum: ["text", "number", "select", "checkbox", "radio", "table"], required: true },
    section: { type: String },
    category: { type: String },
    options: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("Question", questionSchema);