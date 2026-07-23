import React from "react";
import "./RoleSelector.css";

function RoleSelector({ onSelectRole }) {
  return (
    <div className="role-card">
      <h1 className="role-title">🎓 Welcome to Micro-LMS</h1>
      <p className="role-subtitle">Choose your role:</p>
      <div className="button-group">
        <button
          className="btn btn-student"
          onClick={() => onSelectRole("student")}
        >
          Student
        </button>
        <button
          className="btn btn-teacher"
          onClick={() => onSelectRole("teacher")}
        >
          Teacher
        </button>
      </div>
    </div>
  );
}

export default RoleSelector;
