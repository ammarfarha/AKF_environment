import Question from "../Models/QuestionModel.js";
import Answer from "../Models/AnswerModel.js";

export const getTableColumns = async (req, res) => {
  try {
    const { surveyTemplateId } = req.params;

    const columns = await Question.find({
      surveyTemplate: surveyTemplateId,
      type: "table"
    })
      .sort({ createdAt: 1 })
      .select("_id questionText");

    return res.json(columns);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load table columns"
    });
  }
};

// Controller: getTableRows
// Purpose: Retrieve all table rows for a specific survey project
// Ensures that each row contains all columns, even if some answers are missing
// Route: GET /surveys/:surveyTemplateId/:surveyProjectId/table/rows
export const getTableRows = async (req, res) => {
  try {
    const { surveyProjectId, surveyTemplateId } = req.params;

    // 1. Fetch all table columns for the survey template
    const columns = await Question.find({
      surveyTemplate: surveyTemplateId,
      type: "table"
    }).sort({ createdAt: 1 });

    const columnIds = columns.map(col => col._id.toString());

    // 2. Fetch all answers for the survey project, ordered by row and creation time
    const answers = await Answer.find({ surveyProject: surveyProjectId })
      .sort({ order: 1, createdAt: 1 });

    // 3. Group answers by row order to reconstruct table rows
    const rowsMap = {};
    answers.forEach(answer => {
      const rowOrder = answer.order;

      if (!rowsMap[rowOrder]) {
        rowsMap[rowOrder] = { order: rowOrder, cells: {} };
      }

      rowsMap[rowOrder].cells[answer.question.toString()] = answer.value;
    });

    // 4. Ensure each row contains all columns (fill missing with empty string)
    const rows = Object.values(rowsMap).map(row => {
      columnIds.forEach(colId => {
        if (!(colId in row.cells)) {
          row.cells[colId] = ""; // Empty string for missing answers
        }
      });
      return row;
    });

    return res.json(rows);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load table rows" });
  }
};



// Controller to add or update a table row for a survey project
// Ensures that all columns are filled and no empty values are allowed
export const upsertTableRow = async (req, res) => {
  try {
    const { surveyProjectId, surveyTemplateId } = req.params;
    const { order, cells } = req.body;

    // Validate that cells object is provided
    if (!cells || typeof cells !== "object") {
      return res.status(400).json({ message: "Cells object is required" });
    }

    // Fetch all table columns for this survey template
    const columns = await Question.find({
      surveyTemplate: surveyTemplateId,
      type: "table"
    });

    const columnIds = columns.map(c => c._id.toString());

    // Validate that all columns have a value and no empty values
    for (const colId of columnIds) {
      if (!(colId in cells)) {
        return res.status(400).json({ message: `Missing value for column ${colId}` });
      }
      if (!cells[colId] || String(cells[colId]).trim() === "") {
        return res.status(400).json({ message: `Empty value not allowed for column ${colId}` });
      }
    }

    let rowOrder = order;

    // If order is not provided, create a new row with next order value
    if (rowOrder === undefined || rowOrder === null) {
      const lastAnswer = await Answer.findOne({ surveyProject: surveyProjectId })
        .sort({ order: -1 }); // Get the last row order

      rowOrder = lastAnswer ? lastAnswer.order + 1 : 0;
    }

    // Remove any existing row answers with the same order (edit mode)
    await Answer.deleteMany({
      surveyProject: surveyProjectId,
      order: rowOrder
    });

    // Prepare new answers for this row
    const docs = Object.entries(cells).map(([questionId, value]) => ({
      surveyProject: surveyProjectId,
      question: questionId,
      value: String(value), // Store everything as string
      order: rowOrder
    }));

    // Insert all answers for the row
    await Answer.insertMany(docs);

    return res.status(200).json({
      message: "Row saved successfully",
      order: rowOrder
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to save table row" });
  }
};



// Route: GET /surveys/:templateId/table/columns
// Returns all table columns ordered by creation time
export const getAdminTableColumns = async (req, res) => {
  try {
    const { templateId } = req.params;

    const columns = await Question.find({
      surveyTemplate: templateId,
      type: "table"
    }).sort({ createdAt: 1 });

    return res.status(200).json(columns);
  } catch {
    return res.status(500).json({ message: "Failed to fetch columns" });
  }
};

// Route: POST /admin/surveys/:templateId/table/columns
// Creates a new table column (question)
export const addTableColumn = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { questionText, section, category } = req.body;

    if (!questionText) {
      return res.status(400).json({ message: "Question text is required" });
    }

    const column = await Question.create({
      surveyTemplate: templateId,
      questionText,
      type: "table",
      section,
      category
    });

    return res.status(201).json(column);
  } catch {
    return res.status(500).json({ message: "Failed to add column" });
  }
};

// Route: PUT /admin/table/columns/:questionId
// Updates an existing table column
export const updateTableColumn = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { questionText, section, category } = req.body;

    const updated = await Question.findByIdAndUpdate(
      questionId,
      { questionText, section, category },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Column not found" });
    }

    return res.status(200).json(updated);
  } catch {
    return res.status(500).json({ message: "Failed to update column" });
  }
};


// Controller to delete a table column (question)
// Deletes the column and all its related answers
// Route: DELETE /admin/table/columns/:questionId
export const deleteTableColumn = async (req, res) => {
  try {
    const { questionId } = req.params;

    // Remove all answers for this question
    await Answer.deleteMany({ question: questionId });

    // Remove the column itself
    const deleted = await Question.findByIdAndDelete(questionId);

    if (!deleted) {
      return res.status(404).json({ message: "Column not found" });
    }

    return res.status(200).json({ message: "Column deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete column" });
  }
};


// Controller to update all cells in a specific row
// Ensures that all columns are filled and no empty values are allowed
// Route: PUT /admin/table/rows/:surveyProjectId/:order
export const updateTableRow = async (req, res) => {
  try {
    const { surveyProjectId, order } = req.params;
    const { values } = req.body; // values = [{ questionId, value, note }]

    if (!Array.isArray(values)) {
      return res.status(400).json({ message: "Values must be an array" });
    }

    // Fetch all table columns for the survey project to ensure no missing columns
    const surveyProject = await SurveyProject.findById(surveyProjectId).populate("surveyTemplate");
    const columns = await Question.find({
      surveyTemplate: surveyProject.surveyTemplate._id,
      type: "table"
    });
    const columnIds = columns.map(c => c._id.toString());

    // Map submitted values by questionId
    const valuesMap = {};
    for (const cell of values) {
      if (!cell.value || String(cell.value).trim() === "") {
        return res.status(400).json({ message: `Empty value not allowed for question ${cell.questionId}` });
      }
      valuesMap[cell.questionId] = cell.value;
    }

    // Ensure all columns are present in submitted values
    for (const colId of columnIds) {
      if (!(colId in valuesMap)) {
        return res.status(400).json({ message: `Missing value for column ${colId}` });
      }
    }

    // Update or insert each cell
    for (const cell of values) {
      await Answer.findOneAndUpdate(
        {
          surveyProject: surveyProjectId,
          question: cell.questionId,
          order: Number(order)
        },
        {
          value: cell.value,
          note: cell.note
        },
        { new: true, upsert: true } // upsert ensures new cell is inserted if missing
      );
    }

    return res.status(200).json({ message: "Row updated successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update row" });
  }
};


// Controller to update a single table cell
// Ensures the value is not empty
// Route: PUT /admin/table/cell/:answerId
export const updateTableCell = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { value, note } = req.body;

    if (!value || String(value).trim() === "") {
      return res.status(400).json({ message: "Empty value not allowed" });
    }

    const updated = await Answer.findByIdAndUpdate(
      answerId,
      { value, note },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Cell not found" });
    }

    return res.status(200).json(updated);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update cell" });
  }
};


// Route: DELETE /admin/table/rows/:surveyProjectId/:order
// Deletes all cells of a specific row
export const deleteTableRow = async (req, res) => {
  try {
    const { surveyProjectId, order } = req.params;

    await Answer.deleteMany({
      surveyProject: surveyProjectId,
      order: Number(order)
    });

    return res.status(200).json({ message: "Row deleted successfully" });
  } catch {
    return res.status(500).json({ message: "Failed to delete row" });
  }
};
