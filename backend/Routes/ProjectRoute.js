import express from "express";
import { createProject, getAllProjects, getFocalPointProjects, getFocalPointProjectsUsedId } from "../Controllers/ProjectController.js";
import { Authenticate } from "../Middlewares/AuthMiddleware.js";
import { isAdmin } from "../Middlewares/IsAdminMiddleware.js";
import { audit } from "../Middlewares/AuditMiddleware.js";

const projectRotes = express.Router();

projectRotes.use(Authenticate);

projectRotes.get("/", isAdmin, getAllProjects);
projectRotes.get("/projectFocal", audit({
    entityType: "Project",
    action: "view",
    description: (req) => `He reviews all his projects`,
}), getFocalPointProjects);
projectRotes.get("/projectFocal/:userId", isAdmin, getFocalPointProjectsUsedId);
projectRotes.post("/", isAdmin, createProject);

export default projectRotes;