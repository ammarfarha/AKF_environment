import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: { type: String, enum: ["create", "update", "delete"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    time: { type: Date, default: Date.now }
});

export default mongoose.model("AuditLog", auditLogSchema);