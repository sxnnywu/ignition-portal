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
import ReviewerMainLayout from "../reviewer/layouts/RV-MainLayout";
import ReviewerApplicationPool from "../reviewer/pages/RV-MainPage";

import { Navigate } from "react-router-dom";

const routes = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/landing",
    element: <Landing />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/info",
    element: <Info />,
  },
  {
    path: "/education",
    element: <Education />,
  },
  {
    path: "/experience",
    element: <Experience />,
  },
  {
    path: "/teammates",
    element: <Teammates />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/submission/:id",
    element: <Submission />,
  },
  {
    element: <ReviewerMainLayout />, // make this auth instead when implemented
    children: [
      {
        path: "/reviewer",
        element: <Navigate to="/reviewer/all" replace />,
      },
      {
        path: "/reviewer/all",
        element: <ReviewerApplicationPool />,
      },
    ],
  },
];

export default routes;

{
  /*     <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/info" element={<Info />} />
        <Route path="/education" element={<Education />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/teammates" element={<Teammates />} />
        <Route path="/submission/:id" element={<Submission />} /> */
}
