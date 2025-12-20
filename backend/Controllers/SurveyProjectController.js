import SurveyProject from "../Models/SurveyProjectModel.js";
import Answer from "../Models/AnswerModel.js";
import SurveyTemplate from "../Models/SurveyTemplateModel.js";
import Project from "../Models/ProjectModel.js";
import Question from "../Models/QuestionModel.js";
import Approval from "../Models/ApprovalModel.js";





export const submitSurveyAnswers = async (req, res) => {
  try {
    const { projectId, templateId } = req.params;
    const { answers } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Authentication required" });
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "answers must be a non-empty array" });
    }

    const [project, template] = await Promise.all([
      Project.findById(projectId),
      SurveyTemplate.findById(templateId),
    ]);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!template) return res.status(404).json({ message: "Survey template not found" });

    if (template.prerequisites && template.prerequisites.length > 0) {
      const prerequisiteSurveys = await SurveyProject.find({
        surveyTemplate: { $in: template.prerequisites },
        project: projectId,
        user: userId,
        isDone: true,
      });

      const completedPrerequisiteIds = prerequisiteSurveys.map(sp => sp.surveyTemplate.toString());
      const requiredPrerequisiteIds = template.prerequisites.map(id => id.toString());
      const missingPrerequisites = requiredPrerequisiteIds.filter(id => !completedPrerequisiteIds.includes(id));

      if (missingPrerequisites.length > 0) {
        const missingTemplates = await SurveyTemplate.find({ _id: { $in: missingPrerequisites } });
        const missingTitles = missingTemplates.map(t => t.title).join(", ");
        return res.status(403).json({
          message: "Prerequisites not completed",
          missingPrerequisites: missingTitles,
        });
      }
    }

    const totalQuestions = await Question.countDocuments({ surveyTemplate: templateId });
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds }, surveyTemplate: templateId });
    if (questions.length !== questionIds.length) return res.status(400).json({ message: "Some questions do not belong to this template" });

    let surveyProject = await SurveyProject.findOne({ surveyTemplate: templateId, project: projectId, user: userId });
    const isNew = !surveyProject;
    if (isNew) {
      surveyProject = await SurveyProject.create({ surveyTemplate: templateId, project: projectId, user: userId });
    }

    if (answers.length === 1) {
      const answerData = answers[0];
      await Answer.findOneAndUpdate(
        { surveyProject: surveyProject._id, question: answerData.questionId },
        { surveyProject: surveyProject._id, question: answerData.questionId, value: answerData.value, note: answerData.note, order: answerData.order ?? 0 },
        { new: true, upsert: true }
      );
    } else {
      await Answer.deleteMany({ surveyProject: surveyProject._id });
      const docs = answers.map((a, idx) => ({ surveyProject: surveyProject._id, question: a.questionId, value: a.value, note: a.note, order: a.order ?? idx }));
      await Answer.insertMany(docs);
    }

    const totalAnswersCount = await Answer.countDocuments({ surveyProject: surveyProject._id });
    surveyProject.isDone = totalAnswersCount === totalQuestions;
    await surveyProject.save();

    const allAnswers = await Answer.find({ surveyProject: surveyProject._id }).populate("question");

    const severityBuckets = ["Negligible", "Low", "Medium", "High", "Not Applicable"];

    const sectionImpacts = {};
    const categoryImpacts = {};

    const radioAnswers = allAnswers.filter(ans => ans.question.type === "radio");

    const sectionMap = {};
    const categoryMap = {};

    radioAnswers.forEach(ans => {
      const section = ans.question.section || "";
      const category = ans.question.category || "";

      if (!sectionMap[section]) sectionMap[section] = [];
      sectionMap[section].push(ans);

      if (!categoryMap[category]) categoryMap[category] = [];
      categoryMap[category].push(ans);
    });

    for (const [section, answersArr] of Object.entries(sectionMap)) {
      const totalSectionQuestions = await Question.countDocuments({ surveyTemplate: templateId, section, type: "radio" });
      const isComplete = answersArr.length === totalSectionQuestions;

      const impactCounts = severityBuckets.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});
      if (isComplete) {
        answersArr.forEach(ans => {
          const val = typeof ans.value === "string" ? ans.value.trim() : ans.value;
          if (val && impactCounts.hasOwnProperty(val)) impactCounts[val] += 1;
        });
      }

      sectionImpacts[section] = {
        isComplete,
        impactCounts,
        dominantImpact: isComplete ? calculateDominantImpact(impactCounts, severityBuckets) : null,
      };
    }

    for (const [category, answersArr] of Object.entries(categoryMap)) {
      const totalCategoryQuestions = await Question.countDocuments({ surveyTemplate: templateId, category, type: "radio" });
      const isComplete = answersArr.length === totalCategoryQuestions;

      const impactCounts = severityBuckets.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});
      if (isComplete) {
        answersArr.forEach(ans => {
          const val = typeof ans.value === "string" ? ans.value.trim() : ans.value;
          if (val && impactCounts.hasOwnProperty(val)) impactCounts[val] += 1;
        });
      }

      categoryImpacts[category] = {
        isComplete,
        impactCounts,
        dominantImpact: isComplete ? calculateDominantImpact(impactCounts, severityBuckets) : null,
      };
    }


    return res.status(isNew ? 201 : 200).json({
      surveyProject,
      sectionImpacts,
      categoryImpacts,
      message: isNew ? "Survey created and answers saved" : "Survey answers updated",
    });

  } catch (error) {
    console.error("Submit survey answers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const approveSurveyProject = async (req, res) => {
  try {
    const { surveyProjectId } = req.params;
    const { recommendations } = req.body;
    const userAprover = req.user?._id;

    if (!userAprover) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let surveyProject = await SurveyProject.findById(surveyProjectId);

    if (!surveyProject) {
      return res.status(404).json({ message: "Survey project not found" });
    }

    const template = await SurveyTemplate.findById(surveyProject.surveyTemplate);
    if (!template) {
      return res.status(404).json({ message: "Survey template not found" });
    }

    if (!template.requiresApproval) {
      return res.status(400).json({
        message: "This survey does not require approval",
      });
    }

    if (!surveyProject.isDone) {
      return res.status(400).json({
        message: "Survey must be completed before approval",
      });
    }

    const existingApproval = await Approval.findOne({
      surveyProject: surveyProject._id,
      user: userAprover,
    });

    if (existingApproval) {
      existingApproval.recommendations = recommendations;
      await existingApproval.save();

      return res.status(200).json({
        approval: existingApproval,
        surveyProject,
        message: "Approval updated successfully",
      });
    }

    const approval = await Approval.create({
      surveyProject: surveyProject._id,
      user: userAprover,
      recommendations: recommendations || "",
    });

    return res.status(201).json({
      approval,
      surveyProject,
      message: "Survey approved successfully",
    });
  } catch (error) {
    console.error("Approve survey project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};





// إرجاع جميع استبيانات مشروع معيّن
export const getSurveyProjectsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const surveyProjects = await SurveyProject.find({ project: projectId })
      .populate("surveyTemplate")
      .populate("user", "-password");

    return res.status(200).json({ surveyProjects });
  } catch (error) {
    console.error("Get survey projects by project error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




export const getSurveyWithAnswers = async (req, res) => {
  try {
    const { surveyProjectId } = req.params;

    // 1️⃣ جلب SurveyProject
    const surveyProject = await SurveyProject.findById(surveyProjectId)
      .populate("surveyTemplate")
      .populate("project")
      .populate("user");

    if (!surveyProject) {
      return res.status(404).json({ message: "SurveyProject not found" });
    }

    // 2️⃣ جلب الأسئلة الخاصة بالـ Template
    const questions = await Question.find({
      surveyTemplate: surveyProject.surveyTemplate._id,
    }).sort({ createdAt: 1 });

    // 3️⃣ جلب الأجوبة الخاصة بهذا SurveyProject
    const answers = await Answer.find({
      surveyProject: surveyProjectId,
    });

    // 4️⃣ دمج السؤال مع جوابه
    const questionsWithAnswers = questions.map((q) => {
      const answer = answers.find(
        (a) => a.question.toString() === q._id.toString()
      );

      return {
        _id: q._id,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        section: q.section,
        category: q.category,
        answer: answer
          ? {
            value: answer.value,
            note: answer.note,
            order: answer.order,
          }
          : null,
      };
    });

    res.json({
      surveyProject,
      questions: questionsWithAnswers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// للاستدعاء فوق
function calculateDominantImpact(impactCounts, severityBuckets) {
  const counts = severityBuckets.map(k => impactCounts[k] ?? 0);
  const max = Math.max(...counts);
  return severityBuckets[counts.lastIndexOf(max)] ?? null;
}




