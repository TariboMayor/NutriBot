import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "./Login.css";
function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Login failed. Please check your details."
        );
      }

      if (!data.token) {
        throw new Error(
          "Login succeeded but no authentication token was returned."
        );
      }

      /*
       * Save authentication token.
       */
      localStorage.setItem(
        "nutribot_token",
        data.token
      );

      /*
       * Save logged-in user information.
       */
      if (data.user) {
        localStorage.setItem(
          "nutribot_user",
          JSON.stringify(data.user)
        );
      }

      /*
       * Send the user to the correct dashboard
       * based on their account role.
       */
      const userRole = data.user?.role;

      if (userRole === "HOSPITAL_STAFF") {
        navigate(
          "/hospital/dashboard",
          {
            replace: true,
          }
        );
      } else if (userRole === "ADMIN") {
        navigate(
          "/admin/dashboard",
          {
            replace: true,
          }
        );
      } else {
        /*
         * Default user/patient destination.
         */
        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-brand">

          <div className="login-brand-icon">
            N
          </div>

          <div>
            <h1>NutriBot</h1>
            <p>Your Health Companion</p>
          </div>

        </div>


        <div className="login-heading">

          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to continue to your
            NutriBot account.
          </p>

        </div>


        {error && (
          <div
            className="login-error"
            role="alert"
          >
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
          className="login-form"
        >

          <div className="login-field">

            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
              required
            />

          </div>


          <div className="login-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={loading}
              required
            />

          </div>


          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        <div className="login-footer">

          <p>
            Don't have an account?{" "}

            <Link to="/signup">
              Create an account
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;
