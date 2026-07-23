import React, { useState, useEffect } from "react";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [view, setView] = useState("list"); // 'list' | 'create' | 'stats'
  const [selectedQuizStats, setSelectedQuizStats] = useState(null);

  const [courseCode, setCourseCode] = useState("");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", ""], correctOption: 0 },
  ]);

  const API_BASE = "http://localhost:5000/api/quizzes";

  // get all quizzes
  const fetchQuizzes = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (res.ok) setQuizzes(data);
    } catch (err) {
      console.error("fetch quiz fail:", err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // toggle the activation
  const handleToggleActive = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/toggle-active`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchQuizzes();
      }
    } catch (err) {
      console.error("toggle failed:", err);
    }
  };

  // check stat of quiz
  const handleViewStats = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/stats`);
      const data = await res.json();
      if (res.ok) {
        setSelectedQuizStats(data);
        setView("stats");
      }
    } catch (err) {
      console.error("fetch stat failed:", err);
    }
  };

  // add/delete/modify question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", ""], correctOption: 0 },
    ]);
  };

  const handleDeleteQuestion = (qIndex) => {
    if (questions.length <= 1) {
      alert("At least one question!");
      return;
    }
    const updated = questions.filter((_, index) => index !== qIndex);
    setQuestions(updated);
  };

  const handleQuestionTextChange = (index, value) => {
    const updated = [...questions];
    updated[index].questionText = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  // delete
  const handleDeleteOption = (qIndex, oIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length <= 2) {
      alert("At least 2 options!");
      return;
    }

    updated[qIndex].options = updated[qIndex].options.filter(
      (_, index) => index !== oIndex,
    );

    // adject the correct answer index
    if (
      updated[qIndex].correctOption === oIndex ||
      updated[qIndex].correctOption >= updated[qIndex].options.length
    ) {
      updated[qIndex].correctOption = 0;
    } else if (updated[qIndex].correctOption > oIndex) {
      // -1 idx for correct answer if deleted item is before correct item
      updated[qIndex].correctOption -= 1;
    }

    setQuestions(updated);
  };

  const handleSelectCorrect = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].correctOption = oIndex;
    setQuestions(updated);
  };

  // submit quiz to db
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode, title, questions }),
      });
      if (res.ok) {
        alert("🎉 created!");
        setCourseCode("");
        setTitle("");
        setQuestions([
          { questionText: "", options: ["", ""], correctOption: 0 },
        ]);
        setView("list");
        fetchQuizzes();
      }
    } catch (err) {
      console.error("creation failed!:", err);
    }
  };

  return (
    <div className="teacher-container">
      {/* topbar */}
      <div className="dashboard-header">
        <h2>👩‍🏫 Control Panel</h2>
        {view === "list" ? (
          <button className="action-btn" onClick={() => setView("create")}>
            New Quiz
          </button>
        ) : (
          <button
            className="action-btn secondary"
            onClick={() => setView("list")}
          >
            Back to Quiz List
          </button>
        )}
      </div>

      {view === "list" && (
        <div className="quiz-grid">
          {quizzes.length === 0 ? (
            <p>No quizzes available. Click "Create New Quiz" to get started!</p>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-card">
                <div className="quiz-info">
                  <h4>
                    <span className="course-badge">{quiz.courseCode}</span>
                    {quiz.title}
                  </h4>
                  <span
                    className={`status-badge ${quiz.isActive ? "active" : "inactive"}`}
                  >
                    {quiz.isActive ? "🟢 In Progress" : "🔴 Closed"}
                  </span>
                </div>
                <div className="quiz-actions">
                  <button
                    className={`btn-toggle ${quiz.isActive ? "on" : "off"}`}
                    onClick={() => handleToggleActive(quiz._id)}
                  >
                    {quiz.isActive ? "Close" : "Open"}
                  </button>
                  <button
                    className="btn-stats"
                    onClick={() => handleViewStats(quiz._id)}
                  >
                    📊 Stat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === "create" && (
        <form className="create-form" onSubmit={handleCreateQuiz}>
          <div className="form-group">
            <label>Course Code:</label>
            <input
              className="form-input"
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Quiz Title:</label>
            <input
              className="form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <h3>Question Setting</h3>
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-box">
              <div className="question-box-header">
                <label>
                  <strong>Question {qIndex + 1}：</strong>
                </label>
                <button
                  type="button"
                  className="btn-danger-text"
                  onClick={() => handleDeleteQuestion(qIndex)}
                >
                  Delete
                </button>
              </div>

              <input
                className="form-input"
                type="text"
                placeholder="Enter description..."
                value={q.questionText}
                onChange={(e) =>
                  handleQuestionTextChange(qIndex, e.target.value)
                }
                required
              />

              <label>Option:</label>
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="option-row">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={q.correctOption === oIndex}
                    onChange={() => handleSelectCorrect(qIndex, oIndex)}
                  />
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    type="text"
                    placeholder={`Opt ${oIndex + 1}`}
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="btn-icon-delete"
                    title="Delete"
                    onClick={() => handleDeleteOption(qIndex, oIndex)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="action-btn secondary"
                style={{ fontSize: "12px", width: "fit-content" }}
                onClick={() => handleAddOption(qIndex)}
              >
                Add
              </button>
            </div>
          ))}

          <button
            type="button"
            className="action-btn secondary"
            onClick={handleAddQuestion}
          >
            Add New Question
          </button>

          <button
            type="submit"
            className="action-btn"
            style={{ marginTop: "12px" }}
          >
            Create
          </button>
        </form>
      )}

      {/* Stat part */}
      {view === "stats" && selectedQuizStats && (
        <div className="stats-panel">
          <h3>
            <span className="course-badge">{selectedQuizStats.courseCode}</span>
            {selectedQuizStats.quizTitle}
          </h3>
          <p>
            Total submittion:
            <strong>{selectedQuizStats.totalSubmissions}</strong>
          </p>

          {selectedQuizStats.stats.map((item, index) => (
            <div key={index} className="stat-item">
              <div className="stat-header">
                <span>
                  Question {index + 1}: {item.questionText}
                </span>
                <span className="correct-rate">
                  Correct rate: {item.correctRate}
                </span>
              </div>
              <div>
                <small>
                  Correct Ánswer: {item.correctCount} /{" "}
                  {selectedQuizStats.totalSubmissions}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
