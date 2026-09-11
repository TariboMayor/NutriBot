import { useState } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";

function Signup() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

  function handleSignup(event) {
    event.preventDefault();

    console.log({
      name,
      phone,
      email,
      password,
    });
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