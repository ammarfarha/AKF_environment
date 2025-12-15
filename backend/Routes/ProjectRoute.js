import express from "express";
import { createProject } from "../Controllers/ProjectController.js";

const projectRotes = express.Router();

projectRotes.post("/", createProject);

export default projectRotes;