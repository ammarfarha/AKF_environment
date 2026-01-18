import Project from "../Models/ProjectModel.js";

export const createProject = async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      status,
      screeningDate,
      startDate,
      endDate,
      manager,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const project = await Project.create({
      name,
      location,
      description,
      status,
      screeningDate,
      startDate,
      endDate,
      manager,
    });

    // res.locals.createdProjectId = project._id;
    return res.status(201).json({ project });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Get all projects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFocalPointProjects = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ message: "Authentication required" });

    const projects = await Project.find({ manager: userId });
    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Get managed projects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFocalPointProjectsUsedId = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId)
      return res.status(401).json({ message: "Authentication required" });

    const projects = await Project.find({ manager: userId });
    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Get managed projects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
