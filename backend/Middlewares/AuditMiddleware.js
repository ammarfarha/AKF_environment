import AuditLog from "../Models/AuditLogModel.js";

export const audit =
    ({ entityType, action, getEntityId, description }) =>
        async (req, res, next) => {
            res.on("finish", async () => {
                try {
                    if (![200, 201].includes(res.statusCode)) return;

                    await AuditLog.create({
                        entityType,
                        entityId: getEntityId ? getEntityId(req, res) : null,
                        action,
                        user: req.user?._id,
                        description:
                            typeof description === "function"
                                ? description(req, res)
                                : description,
                    });
                } catch (err) {
                    console.error("Audit middleware error:", err.message);
                }
            });

            next();
        };
