import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import Redirect from "../components/Redirect";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/r/:code",
    element: <Redirect />,
  },
  {
    path: "*",
    element: <Redirect />,
  }
]);
