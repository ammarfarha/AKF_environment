import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user", "employee"], default: "user" },
    position: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("User", userSchema);