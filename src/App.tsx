import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Error from "./pages/Error/Error";
import "./App.css";
import Reset from "./pages/Login/Reset";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/reset-password" element={<Reset />} />
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
    const isAuthenticated = localStorage.getItem("token") !== null;
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  return localStorage.getItem("token") ? <Dashboard /> : null;
};

export default App;
