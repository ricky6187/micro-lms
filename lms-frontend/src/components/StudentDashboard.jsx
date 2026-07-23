import React, { useState, useEffect } from "react";
import "./StudentDashboard.css";

function StudentDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState([]); // student choice eg. [0, 2, 1]
  const [submissionResult, setSubmissionResult] = useState(null);

  const API_BASE = "http://localhost:5000/api/quizzes";

  // only get quizzes
  const fetchActiveQuizzes = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (res.ok) {
        // only show active quizzes
        const activeOnly = data.filter((q) => q.isActive);
        setQuizzes(activeOnly);
      }
    } catch (err) {
      console.error("failed getting quizzes:", err);
    }
  };

  useEffect(() => {
    fetchActiveQuizzes();
  }, []);

  // choose and enter a quiz
  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    // init the answer array, -1 mean not selected
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setSubmissionResult(null);
  };

  const handleSelectOption = (qIndex, oIndex) => {
    const updated = [...answers];
    updated[qIndex] = oIndex;
    setAnswers(updated);
  };

  const handleSubmitAnswers = async (e) => {
    e.preventDefault();

    // check not answered question
    if (answers.includes(-1)) {
      if (
        !window.confirm(
          "You haven't answered all the questions. Are you sure you want to submit?",
        )
      ) {
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/${selectedQuiz._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmissionResult(data); // save the  { score, totalQuestions } from backend
      } else {
        alert(data.error || "submittion failed");
      }
    } catch (err) {
      console.error("submittion failed:", err);
    }
  };

  return (
    <div className="student-container">
      <div className="dashboard-header">
        <h2>👨 Quiz Center</h2>
        {selectedQuiz && (
          <button
            className="btn-start"
            style={{ backgroundColor: "#64748b" }}
            onClick={() => setSelectedQuiz(null)}
          >
            Back to List
          </button>
        )}
      </div>

      {/* quiz list */}
      {!selectedQuiz && (
        <div className="quiz-list">
          {quizzes.length === 0 ? (
            <p>No quiz in progress. Please wait for the teacher.</p>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-card-student">
                <div>
                  <h4>
                    <span className="course-badge">{quiz.courseCode}</span>
                    {quiz.title}
                  </h4>
                  <small style={{ color: "#64748b" }}>
                    No. of question: {quiz.questions.length}
                  </small>
                </div>
                <button
                  className="btn-start"
                  onClick={() => handleStartQuiz(quiz)}
                >
                  Start
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* answer question part */}
      {selectedQuiz && (
        <div>
          {/* show result after submit */}
          {submissionResult ? (
            <div className="result-card">
              <h3>Submitted!</h3>
              <p>
                Your score in <strong>{selectedQuiz.title}</strong> is:
              </p>
              <div className="score-display">
                {submissionResult.score} / {submissionResult.totalQuestions} 分
              </div>
              <button
                className="btn-start"
                onClick={() => setSelectedQuiz(null)}
              >
                Back to Quiz List
              </button>
            </div>
          ) : (
            /* submit form */
            <form className="quiz-form" onSubmit={handleSubmitAnswers}>
              <h3>
                <span className="course-badge">{selectedQuiz.courseCode}</span>
                {selectedQuiz.title}
              </h3>

              {selectedQuiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="question-card">
                  <h4>
                    {qIndex + 1}: {q.questionText}
                  </h4>
                  <div className="options-group">
                    {q.options.map((opt, oIndex) => (
                      <label key={oIndex} className="option-item">
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={answers[qIndex] === oIndex}
                          onChange={() => handleSelectOption(qIndex, oIndex)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="btn-start"
                style={{ width: "100%", padding: "14px", fontSize: "16px" }}
              >
                Submit
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
