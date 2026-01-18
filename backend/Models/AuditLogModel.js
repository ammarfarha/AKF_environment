
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },

    action: {
      type: String,
      required: true,
      enum: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "approve",
        "reject",
        "submit",
        "view",
        "assign",
        "change_status",
        "upload",
        "download",
      ],
    },

    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
