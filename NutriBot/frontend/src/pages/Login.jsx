import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        setMessageType("error");
        return;
      }

      setMessage(data.message);
      setMessageType("success");

      // Go directly to the chatbot
      setTimeout(() => {
        navigate("/chat");
      }, 800);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Could not connect to the server.");
      setMessageType("error");
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">N</div>

        <h1>Welcome back</h1>
        <p>Login to continue using NutriBot.</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {message && (
            <p className={`form-message ${messageType}`}>{message}</p>
          )}

          <button type="submit">Login</button>
        </form>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
