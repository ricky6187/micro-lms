import React, { useState } from "react";
import RoleSelector from "./components/RoleSelector";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import "./App.css";

function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return (
      <div className="app-container">
        <RoleSelector onSelectRole={setRole} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h2>Micro-LMS ({role === "teacher" ? "Teacher" : "Student"})</h2>
        <button className="btn-switch" onClick={() => setRole(null)}>
          🔄 Switch
        </button>
      </header>

      <main className="app-main">
        {role === "teacher" ? <TeacherDashboard /> : <StudentDashboard />}
      </main>
    </div>
  );
}

export default App;
