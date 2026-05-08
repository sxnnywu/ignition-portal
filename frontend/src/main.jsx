import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Landing from "./pages/hacker/Landing";
import Dashboard from "./pages/hacker/Dashboard";
import Info from "./pages/hacker/Info";
import Education from "./pages/hacker/Education";
import Experience from "./pages/hacker/Experience";
import Teammates from "./pages/hacker/Teammates";
import Submission from "./pages/hacker/Submission";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Hacker */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/info" element={<Info />} />
        <Route path="/education" element={<Education />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/teammates" element={<Teammates />} />
        <Route path="/submission/:id" element={<Submission />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
