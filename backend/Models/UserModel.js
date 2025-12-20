import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: [true, 'first name required'], trim: true },
    lastName: { type: String, required: [true, 'last name required'], trim: true },
    email: { type: String, required: [true, 'email required'], unique: true, lowercase: true },
    password: {
        type: String, require: [true, 'password required'], minlength: [8, 'Too short password'],
    },
    role: { type: String, enum: ["admin", "user", "employee"], default: "user" },
    position: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("User", userSchema);