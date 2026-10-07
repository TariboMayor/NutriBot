import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import FindHospitalPage from "./pages/FindHospitalPage";
import RemindersPage from "./pages/RemindersPage";
import NutritionPage from "./pages/NutritionPage";
import WellnessPage from "./pages/WellnessPage";
import HydrationPage from "./pages/HydrationPage";
import ProfilePage from "./pages/ProfilePage";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import FoodDashboard from "./pages/FoodDashboard";


import HospitalDashboard
  from "./pages/hospital/HospitalDashboard";

import HospitalDoctorsPage
  from "./pages/hospital/HospitalDoctorsPage";


import AdminDashboard
  from "./pages/admin/AdminDashboard";


import ProtectedRoute
  from "./components/auth/ProtectedRoute";


import HospitalDetailsPage
  from "./pages/HospitalDetailsPage";

import FindDoctorPage
  from "./pages/FindDoctorPage";

import SelectServicePage
  from "./pages/SelectServicePage";

import AvailabilityPage
  from "./pages/AvailabilityPage";

import ConfirmationPage
  from "./pages/ConfirmationPage";

  import ServicesManagementPage from "./pages/hospital/ServicesManagementPage";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            PROTECTED PATIENT ROUTES
        ================================================= */}

        <Route
          element={
            <ProtectedRoute />
          }
        >

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
            path="/hospitals"
            element={<FindHospitalPage />}
          />

          <Route
            path="/hospitals/:id"
            element={
              <HospitalDetailsPage />
            }
          />

          <Route
            path="/hospitals/:hospitalId/doctors"
            element={
              <FindDoctorPage />
            }
          />

          <Route
            path="/appointments/service/:doctorId"
            element={
              <SelectServicePage />
            }
          />

          <Route
            path="/appointments/availability"
            element={
              <AvailabilityPage />
            }
          />

          <Route
            path="/appointments/confirm"
            element={
              <ConfirmationPage />
            }
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

        <Route
            path="/hospital/services"
            element={<ServicesManagementPage />}
          />


        {/* =================================================
            HOSPITAL
        ================================================= */}

        <Route
          path="/hospital/dashboard"
          element={
            <HospitalDashboard />
          }
        />

        <Route
          path="/hospital/doctors"
          element={
            <HospitalDoctorsPage />
          }
        />


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin/dashboard"
          element={
            <AdminDashboard />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;
