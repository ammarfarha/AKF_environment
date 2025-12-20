import express from "express";
import { submitSurveyAnswers, approveSurveyProject, getSurveyProjectsByProject, getSurveyWithAnswers } from "../Controllers/SurveyProjectController.js";
import { isAdmin } from "../Middlewares/IsAdminMiddleware.js";
import { Authenticate } from "../Middlewares/AuthMiddleware.js";

const surveyProjectRoutes = express.Router();

surveyProjectRoutes.use(Authenticate);

surveyProjectRoutes.get("/project/:projectId", getSurveyProjectsByProject);

surveyProjectRoutes.post(
  "/:projectId/surveys/:templateId/answers",
  submitSurveyAnswers
);

surveyProjectRoutes.get("/:surveyProjectId", getSurveyWithAnswers
)

surveyProjectRoutes.post(
  "/approve/:surveyProjectId",
  isAdmin,
  approveSurveyProject
);

export default surveyProjectRoutes;

