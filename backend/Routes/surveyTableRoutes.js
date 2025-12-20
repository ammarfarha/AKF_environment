import express from "express";
import {
  getTableColumns,
  getTableRows,
  upsertTableRow,

  getAdminTableColumns,
  addTableColumn,
  updateTableColumn,
  deleteTableColumn,

  updateTableRow,
  updateTableCell,
  deleteTableRow
} from "../Controllers/SurveyTabelController.js";

const router = express.Router();

router.get(
  "/surveys/:surveyTemplateId/table/columns",
  getTableColumns
);

router.get(
  "/surveys/:surveyTemplateId/:surveyProjectId/table/rows",
  getTableRows
);

router.post(
  "/surveys/:surveyTemplateId/:surveyProjectId/table/rows",
  upsertTableRow
);


router.get(
  "/admin/surveys/:templateId/table/columns",
  getAdminTableColumns
);

router.post(
  "/admin/surveys/:templateId/table/columns",
  addTableColumn
);

router.put(
  "/admin/table/columns/:questionId",
  updateTableColumn
);

router.delete(
  "/admin/table/columns/:questionId",
  deleteTableColumn
);


router.put(
  "/admin/table/rows/:surveyProjectId/:order",
  updateTableRow
);

router.put(
  "/admin/table/cell/:answerId",
  updateTableCell
);

router.delete(
  "/admin/table/rows/:surveyProjectId/:order",
  deleteTableRow
);

export default router;
