import User from "../Models/UserModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get user by id error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRoleToEmployee = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: "employee" }, { new: true });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Update role to employee error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};