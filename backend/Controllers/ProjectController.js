import Project from "../Models/ProjectModel.js";

// إنشاء مشروع
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

    return res.status(201).json({ project });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
