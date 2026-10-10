import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  IconLeaf,
  IconPackage,
  IconPlus,
  IconClock,
  IconSearch,
  IconSparkles,
  IconShield,
  IconQrCode,
  IconTruck,
  IconLogOut
} from "./Icons.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  const roleLabel = {
    PROVIDER: "Food Provider",
    ORPHANAGE: "Orphanage / Shelter",
    ADMIN: "Platform Administrator"
  }[user.role] || user.role;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <IconLeaf size={22} />
          </div>
          <div>
            <strong>Smart Food Rescue</strong>
            <small>{user.organizationName || "Community Member"}</small>
          </div>
        </div>

        <div className="sidebar-user-pill">
          <span className="sidebar-user-name">{user.name}</span>
          <span className="sidebar-user-role">{roleLabel}</span>
        </div>

        <nav>
          {user.role === "PROVIDER" && (
            <>
              <NavLink to="/app/listings" end>
                <IconPackage size={18} /> My Listings
              </NavLink>
              <NavLink to="/app/listings/new">
                <IconPlus size={18} /> New Surplus Food
              </NavLink>
              <NavLink to="/app/incoming">
                <IconClock size={18} /> Incoming Requests
              </NavLink>
            </>
          )}

          {user.role === "ORPHANAGE" && (
            <>
              <NavLink to="/app/browse">
                <IconSearch size={18} /> Discover Surplus
              </NavLink>
              <NavLink to="/app/ai">
                <IconSparkles size={18} /> AI Smart Search
              </NavLink>
              <NavLink to="/app/requests">
                <IconClock size={18} /> My Requests
              </NavLink>
            </>
          )}

          {user.role === "ADMIN" && (
            <>
              <NavLink to="/app/admin">
                <IconShield size={18} /> Admin Dashboard
              </NavLink>
              <NavLink to="/app/listings">
                <IconPackage size={18} /> Provider Listings
              </NavLink>
              <NavLink to="/app/browse">
                <IconSearch size={18} /> Available Catalog
              </NavLink>
            </>
          )}

          <NavLink to="/app/pickups">
            <IconQrCode size={18} /> Pickups & QR
          </NavLink>
          <NavLink to="/app/history">
            <IconTruck size={18} /> Handoff History
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button type="button" onClick={onLogout} aria-label="Sign out">
            <IconLogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="topbar-breadcrumbs">
            Network Hub · <strong>{roleLabel}</strong> · {user.city || "All regions"}
          </div>
          <div className="topbar-user">
            Signed in as <strong>{user.name}</strong> ({user.email})
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
