// hacker specific routes
import Dashboard from "../pages/hacker/Dashboard";
import Education from "../pages/hacker/Education";
import Experience from "../pages/hacker/Experience";
import Landing from "../pages/hacker/Landing";
import Info from "../pages/hacker/Info";
import Submission from "../pages/hacker/Submission";
import Teammates from "../pages/hacker/Teammates";

// auth routes
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// reviewer routes
import ReviewerLayout from "../reviewer/layouts/ReviewerLayout";
import ReviewerMainPage from "../reviewer/pages/ReviewerMainPage";

import { Navigate } from "react-router-dom";

const routes = [
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/landing", element: <Landing /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/info", element: <Info /> },
  { path: "/education", element: <Education /> },
  { path: "/experience", element: <Experience /> },
  { path: "/teammates", element: <Teammates /> },
  { path: "/submission/:id", element: <Submission /> },
  {
    element: <ReviewerLayout />,
    children: [
      { path: "/reviewer", element: <Navigate to="/reviewer/all" replace /> },
      { path: "/reviewer/all", element: <ReviewerMainPage /> },
    ],
  },
];

export default routes;
