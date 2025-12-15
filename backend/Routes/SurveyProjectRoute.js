import express from "express";
import { submitSurveyAnswers, approveSurveyProject } from "../Controllers/SurveyProjectController.js";
import { isAdmin } from "../Middlewares/IsAdminMiddleware.js";
import { Authenticate } from "../Middlewares/authMiddleware.js";

const surveyProjectRoutes = express.Router();

surveyProjectRoutes.use(Authenticate);

surveyProjectRoutes.post(
  "/:projectId/surveys/:templateId/answers",
  submitSurveyAnswers
);


surveyProjectRoutes.post(
  "/approve/:surveyProjectId",
  isAdmin,
  approveSurveyProject
);

export default surveyProjectRoutes;

