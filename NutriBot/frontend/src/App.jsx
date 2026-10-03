import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import RemindersPage from "./pages/RemindersPage";
import NutritionPage from "./pages/NutritionPage";
import WellnessPage from "./pages/WellnessPage";
import HydrationPage from "./pages/HydrationPage";
import ProfilePage from "./pages/ProfilePage";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import FoodDashboard from "./pages/FoodDashboard";

import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected patient routes */}
        <Route element={<ProtectedRoute />}>
          <Route
  path="/dashboard"
  element={<Dashboard />}
/>

          <Route
            path="/chat"
            element={<ChatPage />}
          />

          <Route
            path="/foods"
            element={<FoodDashboard />}
          />

          <Route
            path="/appointments"
            element={<AppointmentsPage />}
          />

          <Route
            path="/reminders"
            element={<RemindersPage />}
          />

          <Route
            path="/nutrition"
            element={<NutritionPage />}
          />

          <Route
            path="/wellness"
            element={<WellnessPage />}
          />

          <Route
            path="/hydration"
            element={<HydrationPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />
        </Route>

        {/* Hospital */}
        <Route
          path="/hospital/dashboard"
          element={<HospitalDashboard />}
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;