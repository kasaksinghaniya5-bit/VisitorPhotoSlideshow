
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import Register from "./pages/Register.jsx";
import SharedSlideshow from "./pages/SharedSlideshow.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

const currentPath = window.location.pathname;

let page;

if (currentPath === "/shared") {
  page = <SharedSlideshow />;
} else if (currentPath === "/admin/dashboard") {
  page = <AdminDashboard />;
} else if (currentPath === "/admin") {
  page = <AdminLogin />;
} else if (currentPath === "/register") {
  page = <Register />;
} else {
  page = <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>{page}</StrictMode>
);
