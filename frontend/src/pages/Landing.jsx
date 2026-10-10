import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import {
  IconLeaf,
  IconTruck,
  IconShield,
  IconHeartHandshake,
  IconPackage,
  IconQrCode,
  IconClock,
  IconCheckCircle,
  IconArrowRight,
  IconSparkles
} from "../components/Icons";
import { categoryImages } from "../utils/foodImages";

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api.get("/api/stats/summary")
      .then((res) => setStats(res.data))
      .catch(() => {
        // Fallback default state
        setStats({
          providers: 0,
          orphanages: 0,
          listings: 0,
          pendingRequests: 0,
          completedPickups: 0,
          mealsRescued: 0
        });
      })
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <div className="landing">
      {/* Sticky Top Navigation */}
      <header className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="brand">
            <div className="brand-icon">
              <IconLeaf size={22} />
            </div>
            <span>Smart Food Rescue</span>
          </Link>
          <div className="row">
            <Link to="/login" className="ghost">Log in</Link>
            <Link to="/register" className="btn btn-primary">Join the network</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-pill">
            <IconSparkles size={16} /> Live Surplus Food Redistribution MVP
          </div>
          <h1 className="hero-heading">
            Rescue surplus food. <span>Feed children & shelters.</span>
          </h1>
          <p className="hero-lede">
            A real-time bridge connecting community kitchens, caterers, bakeries, and restaurants
            directly with nearby orphanages and shelters. Prevent edible waste, automate portion requests,
            and guarantee trusted handoffs through digital QR verification.
          </p>
          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary large">
              Get started as Provider or Orphanage <IconArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary large">
              Sign in to platform
            </Link>
          </div>

          {/* Quick Demo Credentials Callout */}
          <div className="demo-credentials-banner">
            <div className="demo-credentials-header">
              <IconShield size={18} />
              <span>Instant Evaluation Demo Credentials (Pre-seeded in Database)</span>
            </div>
            <p className="muted" style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem" }}>
              Test any role immediately without manual signup, or create new accounts:
            </p>
            <div className="demo-cred-grid">
              <div className="demo-cred-card">
                <strong>Food Provider</strong>
                Email: <code>provider@smartfoodrescue.local</code><br />
                Pass: <code>Provider@12345</code>
              </div>
              <div className="demo-cred-card">
                <strong>Orphanage Shelter</strong>
                Email: <code>orphanage@smartfoodrescue.local</code><br />
                Pass: <code>Orphanage@12345</code>
              </div>
              <div className="demo-cred-card">
                <strong>Network Admin</strong>
                Email: <code>admin@smartfoodrescue.local</code><br />
                Pass: <code>Admin@12345</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Statistics Strip */}
      <section className="stats-strip">
        <div className="stats-container">
          <div className="stats-heading-wrap">
            <h2>Real-Time Redistribution Impact</h2>
            <p>Live metrics stored and aggregated directly in MySQL</p>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">
                {loadingStats ? "..." : (stats?.mealsRescued || 0)}
              </span>
              <span className="stat-label">Units / Meals Rescued</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {loadingStats ? "..." : (stats?.listings || 0)}
              </span>
              <span className="stat-label">Active Surplus Batches</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {loadingStats ? "..." : (stats?.orphanages || 0)}
              </span>
              <span className="stat-label">Orphanages Supported</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {loadingStats ? "..." : (stats?.providers || 0)}
              </span>
              <span className="stat-label">Verified Food Providers</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works 4-Step Process */}
      <section className="workflow-section">
        <div className="section-head">
          <h2>How The Rescue Network Works</h2>
          <p>A closed-loop system ensuring transparent food safety, immediate allocation, and verified receipt.</p>
        </div>
        <div className="workflow-steps">
          <div className="workflow-card">
            <div className="step-badge">1</div>
            <h3>Post Surplus Food</h3>
            <p>
              Restaurants, caterers, and food businesses post excess portions with expiry date,
              food type, and pickup location before food spoils.
            </p>
          </div>
          <div className="workflow-card">
            <div className="step-badge">2</div>
            <h3>Discover & Request</h3>
            <p>
              Orphanages search by dietary requirements or use AI semantic search to find meals,
              requesting exact portions needed for their children.
            </p>
          </div>
          <div className="workflow-card">
            <div className="step-badge">3</div>
            <h3>Provider Approval</h3>
            <p>
              Provider reviews and accepts requests with a pessimistic lock in MySQL, deducting
              remaining quantity to avoid double-allocation.
            </p>
          </div>
          <div className="workflow-card">
            <div className="step-badge">4</div>
            <h3>Schedule & QR Verify</h3>
            <p>
              The orphanage schedules pickup and displays a cryptographic QR code. Provider scans or
              confirms token to permanently record the handoff.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Surplus Categories Showcase */}
      <section className="categories-section">
        <div className="section-head">
          <h2>Surplus Food Categories</h2>
          <p>All items undergo freshness checks and packaging hygiene standards prior to redistribution.</p>
        </div>
        <div className="cat-grid">
          <div className="cat-card">
            <img src={categoryImages["Cooked meals"]} alt="Cooked Meals" className="cat-thumb" />
            <div className="cat-info">
              <h4>Cooked Meals</h4>
              <small>Biryani, rice, gravies, curries</small>
            </div>
          </div>
          <div className="cat-card">
            <img src={categoryImages["Bakery"]} alt="Bakery" className="cat-thumb" />
            <div className="cat-info">
              <h4>Artisan Bakery</h4>
              <small>Fresh loaves, buns, sandwich bread</small>
            </div>
          </div>
          <div className="cat-card">
            <img src={categoryImages["Produce"]} alt="Produce" className="cat-thumb" />
            <div className="cat-info">
              <h4>Fresh Produce</h4>
              <small>Wholesale crates of fruits & veg</small>
            </div>
          </div>
          <div className="cat-card">
            <img src={categoryImages["Dairy"]} alt="Dairy" className="cat-thumb" />
            <div className="cat-info">
              <h4>Dairy & Cold Chain</h4>
              <small>Pasteurized milk, paneer, curd</small>
            </div>
          </div>
          <div className="cat-card">
            <img src={categoryImages["Packaged"]} alt="Packaged" className="cat-thumb" />
            <div className="cat-info">
              <h4>Packaged Kits</h4>
              <small>Grain meal kits, lentils, cereals</small>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--primary-dark)", color: "#a7f3d0", padding: "2.5rem 1.5rem", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "0.95rem" }}>
          © 2026 Smart Food Rescue & Redistribution Network · Dedicated to Zero Hunger (UN SDG 2) & Responsible Consumption (SDG 12)
        </p>
      </footer>
    </div>
  );
}
