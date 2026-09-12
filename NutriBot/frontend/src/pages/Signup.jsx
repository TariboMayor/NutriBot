 import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
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

      // Show success message
      setMessage(data.message);
      setMessageType("success");

      // Wait 1.5 seconds, then go to chat
      setTimeout(() => {
        navigate("/chat");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);

      setMessage("Could not connect to the server.");
      setMessageType("error");
    }
  }
  return (
    <div className="signup-page">
      <div className="signup-box">
        <div className="signup-logo">N</div>

        <h1>Create your NutriBot account</h1>
        <p>Join NutriBot and start your nutrition journey.</p>

        <form onSubmit={handleSignup}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {message && (
            <p className={`form-message ${messageType}`}>{message}</p>
          )}
          <button type="submit">Create Account</button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
