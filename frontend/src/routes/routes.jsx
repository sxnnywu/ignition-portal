// auth routes
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// hacker routes
import Dashboard from "../pages/hacker/Dashboard";
import Education from "../pages/hacker/Education";
import Experience from "../pages/hacker/Experience";
import Landing from "../pages/hacker/Landing";
import Info from "../pages/hacker/Info";
import Submission from "../pages/hacker/Submission";
import Teammates from "../pages/hacker/Teammates";

// reviewer routes
import ReviewerLayout from "../reviewer/layouts/ReviewerLayout";
import ReviewerMainPage from "../reviewer/pages/ReviewerMainPage";

// shared
import RequireRole from "../components/auth/RequireRole";
import NotFound from "../pages/NotFound";

const routes = [
  // --- public / auth ---
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // --- applicant-only routes ---
  { path: "/landing", element: <RequireRole allowed={['applicant']}><Landing /></RequireRole> },
  { path: "/dashboard", element: <RequireRole allowed={['applicant']}><Dashboard /></RequireRole> },
  { path: "/info", element: <RequireRole allowed={['applicant']}><Info /></RequireRole> },
  { path: "/education", element: <RequireRole allowed={['applicant']}><Education /></RequireRole> },
  { path: "/experience", element: <RequireRole allowed={['applicant']}><Experience /></RequireRole> },
  { path: "/teammates", element: <RequireRole allowed={['applicant']}><Teammates /></RequireRole> },
  { path: "/submission/:id", element: <RequireRole allowed={['applicant']}><Submission /></RequireRole> },

  // --- reviewer / admin routes ---
  {
    element: (
      <RequireRole allowed={['reviewer', 'admin']}>
        <ReviewerLayout />
      </RequireRole>
    ),
    children: [
      { path: "/reviewer", element: <ReviewerMainPage /> },
    ],
  },

  // --- 404 catch-all ---
  { path: "/not-found", element: <NotFound /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
