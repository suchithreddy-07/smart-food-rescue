import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { IconLeaf, IconPackage, IconHeartHandshake, IconShield } from "../components/Icons.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PROVIDER",
    organizationName: "",
    phone: "",
    address: "",
    city: ""
  });
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters in length.");
      return;
    }

    try {
      const newUser = await register(form);
      addToast(`Account created! Welcome, ${newUser.name}.`, "success");
      navigate("/app");
    } catch (err) {
      setError(err.message || "Registration failed. Please check your information.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <div className="auth-header">
          <div className="brand-icon" style={{ margin: "0 auto 1rem", width: "48px", height: "48px" }}>
            <IconLeaf size={28} />
          </div>
          <h2>Join the Food Rescue Network</h2>
          <p>Register your community kitchen, food business, or care shelter</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <label style={{ marginBottom: "0.5rem" }}>Select Account Type</label>
          <div className="role-select-cards">
            <div
              className={`role-card-opt ${form.role === "PROVIDER" ? "active" : ""}`}
              onClick={() => setForm({ ...form, role: "PROVIDER" })}
              role="button"
              tabIndex="0"
            >
              <div className="row" style={{ marginBottom: "0.3rem" }}>
                <IconPackage size={18} />
                <strong>Food Provider</strong>
              </div>
              <small>Restaurants, caterers, bakeries, hostels, and supermarkets donating excess food.</small>
            </div>

            <div
              className={`role-card-opt ${form.role === "ORPHANAGE" ? "active" : ""}`}
              onClick={() => setForm({ ...form, role: "ORPHANAGE" })}
              role="button"
              tabIndex="0"
            >
              <div className="row" style={{ marginBottom: "0.3rem" }}>
                <IconHeartHandshake size={18} />
                <strong>Orphanage / Shelter</strong>
              </div>
              <small>NGOs, children's homes, daycares, and shelters requesting meals for residents.</small>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="reg-name">Contact Person Full Name</label>
              <input
                id="reg-name"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g., Sarah Jenkins"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-org">Organization Name</label>
              <input
                id="reg-org"
                value={form.organizationName}
                onChange={set("organizationName")}
                placeholder={form.role === "PROVIDER" ? "e.g., Green Valley Bakery" : "e.g., Hope Children's Home"}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="reg-email">Official Email</label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="contact@org.org"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-pass">
                Password <span className="label-hint">(min 8 characters)</span>
              </label>
              <input
                id="reg-pass"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-city">City / Municipality</label>
              <input
                id="reg-city"
                value={form.city}
                onChange={set("city")}
                placeholder="e.g., Hyderabad"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-addr">Street Address / Landmark</label>
            <input
              id="reg-addr"
              value={form.address}
              onChange={set("address")}
              placeholder="Building, street, and area details for pickup logistics"
            />
          </div>

          <div className="demo-credentials-banner" style={{ margin: "1rem 0 1.5rem", padding: "0.85rem 1rem" }}>
            <div className="row" style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <IconShield size={16} />
              <span>Looking for Admin? Platform admins are pre-seeded with <code>admin@smartfoodrescue.local</code> / <code>Admin@12345</code>.</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary full large"
            disabled={loading}
          >
            {loading ? "Creating Account..." : `Register as ${form.role === "PROVIDER" ? "Food Provider" : "Orphanage"}`}
          </button>
        </form>

        <p className="muted" style={{ textAlign: "center", marginTop: "1.5rem" }}>
          Already registered? <Link to="/login" style={{ fontWeight: 700 }}>Sign in</Link>
        </p>
        <p style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <Link to="/" className="muted" style={{ fontSize: "0.85rem" }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
