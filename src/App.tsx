import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route,  useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Error from "./pages/Error/Error";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedDashboard />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// Component to handle conditional rendering of Dashboard based on token existence
const ProtectedDashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Check if token exists in localStorage
    const isAuthenticated = localStorage.getItem("token") !== null;

    // If not authenticated, navigate to "/"
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  // Render Dashboard if authenticated, otherwise null
  return localStorage.getItem("token") ? <Dashboard /> : null;
};

export default App;
