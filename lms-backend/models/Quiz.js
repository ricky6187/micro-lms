const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, "course code required"],
      trim: true,
      uppercase: true,
    },

    title: {
      type: String,
      required: true,
    },

    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String }],
        correctOption: { type: Number, required: true },
        // record each option being chosen eg. [10, 2, 5, 1]
        optionCounts: { type: [Number], default: [] },
      },
    ],

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Quiz", QuizSchema);
