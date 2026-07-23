const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz"); // /api/quizzes

router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res
      .status(500)
      .json({ message: "failed fetching quiz", error: err.message });
  }
});

// create quiz
router.post("/", async (req, res) => {
  try {
    const { courseCode, title, questions } = req.body;

    if (!courseCode || !title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "please fill in all info" });
    }

    // init option count (all 0)
    const formattedQuestions = questions.map((q) => ({
      ...q,
      optionCounts: new Array(q.options.length).fill(0),
    }));

    const newQuiz = new Quiz({
      courseCode,
      title,
      questions: formattedQuestions,
      isActive: false,
    });

    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (err) {
    res.status(400).json({ message: "creation failed", error: err.message });
  }
});

// Submit Answers
router.post("/:id/submit", async (req, res) => {
  try {
    const { answers } = req.body; // e.g. [0, 2]
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Can't find quiz!" });
    }

    if (!quiz.isActive) {
      return res.status(403).json({ message: "Quiz closed!" });
    }

    if (!answers || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: "answer number does not match!" });
    }

    let score = 0;
    const incUpdates = {};

    // 1. Calculate score & build $inc payload
    quiz.questions.forEach((q, index) => {
      const selectedOption = answers[index];

      if (selectedOption === q.correctOption) {
        score += 1;
      }

      if (
        selectedOption !== undefined &&
        selectedOption >= 0 &&
        selectedOption < q.options.length
      ) {
        // Build dynamic MongoDB update path: questions.0.optionCounts.2
        incUpdates[`questions.${index}.optionCounts.${selectedOption}`] = 1;
      }
    });

    // 2. Perform direct, atomic increment in MongoDB
    await Quiz.updateOne({ _id: req.params.id }, { $inc: incUpdates });

    res.json({
      message: "answer submitted！",
      score,
      totalQuestions: quiz.questions.length,
    });
  } catch (err) {
    res.status(500).json({ message: "submittion failed!", error: err.message });
  }
});

// Get Quiz Stats
router.get("/:id/stats", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Can't find quiz!" });
    }

    // total submittion = count on question 1
    const firstQCounts = quiz.questions[0]?.optionCounts || [];
    const totalSubmissions = firstQCounts.reduce((a, b) => a + b, 0);

    const stats = quiz.questions.map((q) => {
      const counts = q.optionCounts || [];
      const correctCount = counts[q.correctOption] || 0;
      const qTotal = counts.reduce((a, b) => a + b, 0);

      const correctRate =
        qTotal > 0 ? `${((correctCount / qTotal) * 100).toFixed(1)}%` : "0.0%";

      return {
        questionText: q.questionText,
        correctOption: q.correctOption,
        correctCount,
        correctRate,
        optionCounts: counts,
      };
    });

    res.json({
      quizTitle: quiz.title,
      courseCode: quiz.courseCode,
      totalSubmissions,
      stats,
    });
  } catch (err) {
    res.status(500).json({ message: "fetch Stat failed!", error: err.message });
  }
});

// Toggle isActive
router.patch("/:id/toggle-active", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Can't find quiz" });

    quiz.isActive = !quiz.isActive;
    await quiz.save();

    res.json({
      message: `Quiz${quiz.isActive ? "Opened" : "Closed"}`,
      isActive: quiz.isActive,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "failed updating quiz!", error: err.message });
  }
});

module.exports = router;
