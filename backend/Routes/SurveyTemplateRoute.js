import express from "express";
import { addQuestionToSurvey, createSurveyTemplate } from "../Controllers/SurveyTemplateController.js";

const surveyTemplateRoutes = express.Router();

surveyTemplateRoutes.post("/", createSurveyTemplate);
surveyTemplateRoutes.post("/:templateId/question", addQuestionToSurvey);

export default surveyTemplateRoutes;