import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    console.log({
      email,
      password,
    });
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