import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { IconLeaf, IconShield, IconUsers, IconHeartHandshake } from "../components/Icons.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    try {
      const loggedUser = await login(email, password);
      addToast(`Welcome back, ${loggedUser.name}!`, "success");
      navigate("/app");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon" style={{ margin: "0 auto 1rem", width: "48px", height: "48px" }}>
            <IconLeaf size={28} />
          </div>
          <h2>Welcome back</h2>
          <p>Sign in to manage surplus food inventory or request meals</p>
        </div>

        {/* 1-Click Quick Demo Switcher */}
        <div className="quick-demo-login">
          <div className="quick-demo-label">
            <IconShield size={16} /> Quick-Fill Demo Accounts
          </div>
          <div className="quick-demo-buttons">
            <button
              type="button"
              className="quick-demo-btn"
              onClick={() => handleQuickDemo("provider@smartfoodrescue.local", "Provider@12345")}
            >
              🥗 Provider
            </button>
            <button
              type="button"
              className="quick-demo-btn"
              onClick={() => handleQuickDemo("orphanage@smartfoodrescue.local", "Orphanage@12345")}
            >
              🏠 Orphanage
            </button>
            <button
              type="button"
              className="quick-demo-btn"
              onClick={() => handleQuickDemo("admin@smartfoodrescue.local", "Admin@12345")}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g., name@organization.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary full large"
            disabled={loading}
            style={{ marginTop: "1rem" }}
          >
            {loading ? "Signing in..." : "Sign in to Dashboard"}
          </button>
        </form>

        <p className="muted" style={{ textAlign: "center", marginTop: "1.5rem" }}>
          Don't have an account yet? <Link to="/register" style={{ fontWeight: 700 }}>Register now</Link>
        </p>
        <p style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <Link to="/" className="muted" style={{ fontSize: "0.85rem" }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
