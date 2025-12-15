import SurveyTemplate from "../Models/SurveyTemplateModel.js";
import Question from "../Models/QuestionModel.js";

export const createSurveyTemplate = async (req, res) => {
    try {
        const { title, description, requiresApproval, prerequisites } = req.body;

        if (!title) {
            return res.status(400).json({ message: "title is required" });
        }

        const existingTitle = await SurveyTemplate.findOne({ title });
        if (existingTitle) {
            return res.status(409).json({ message: "You have a survey with the same title" });
        }

        if (prerequisites && !Array.isArray(prerequisites)) {
            return res.status(400).json({ message: "prerequisites must be an array" });
        }

        const surveyTemplate = await SurveyTemplate.create({
            title,
            description,
            requiresApproval: requiresApproval ?? false,
            prerequisites: prerequisites ?? [],
        });

        return res.status(201).json({ surveyTemplate });
    } catch (error) {
        console.error("Create survey template error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addQuestionToSurvey = async (req, res) => {
    try {
        const surveyTemplateId = req.params.templateId;
        const { questionText, type, section, category, options } = req.body;

        if (!questionText || !type) {
            return res.status(400).json({ message: "questionText and type are required" });
        }


        if (["select", "checkbox", "radio"].includes(type)) {
            if (!Array.isArray(options) || options.length === 0) {
                return res.status(400).json({ message: "options must be a non-empty array" });
            }
        }

        const surveyTemplate = await SurveyTemplate.findById(surveyTemplateId);
        if (!surveyTemplate) {
            return res.status(404).json({ message: "Survey template not found" });
        }

        const question = await Question.create({
            surveyTemplate: surveyTemplateId,
            questionText,
            type,
            section,
            category,
            options,
        });

        return res.status(201).json({ question });
    } catch (error) {
        console.error("Add question to survey error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
