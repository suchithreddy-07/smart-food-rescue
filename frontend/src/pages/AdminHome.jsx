import React, { useEffect, useState } from "react";
import api from "../api/client";
import {
  IconShield,
  IconUsers,
  IconPackage,
  IconClock,
  IconTruck,
  IconCheckCircle,
  IconXCircle,
  IconSearch,
  IconBuilding
} from "../components/Icons";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../components/Toast";

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("USERS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelListingTarget, setCancelListingTarget] = useState(null);
  const [cancellingListing, setCancellingListing] = useState(false);
  const { addToast } = useToast();

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get("/api/admin/stats"),
      api.get("/api/admin/users"),
      api.get("/api/admin/listings"),
      api.get("/api/admin/requests")
    ])
      .then(([statsRes, usersRes, listingsRes, requestsRes]) => {
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setListings(listingsRes.data);
        setRequests(requestsRes.data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  // Toggle user status
  const handleToggleUser = async (user) => {
    try {
      const { data } = await api.patch(`/api/admin/users/${user.id}/toggle-status`);
      addToast(`User ${data.name} is now ${data.enabled ? "Active" : "Suspended"}.`, "success");
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data : u)));
    } catch (err) {
      setError(err.message || "Failed to update user status.");
    }
  };

  // Cancel listing as admin
  const handleConfirmCancelListing = async () => {
    if (!cancelListingTarget) return;
    setCancellingListing(true);
    try {
      await api.delete(`/api/listings/${cancelListingTarget.id}`);
      addToast(`Listing "${cancelListingTarget.title}" was cancelled by Admin.`, "success");
      setCancelListingTarget(null);
      loadAll();
    } catch (err) {
      setError(err.message || "Failed to cancel listing.");
    } finally {
      setCancellingListing(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.organizationName && u.organizationName.toLowerCase().includes(s)) ||
      (u.city && u.city.toLowerCase().includes(s))
    );
  });

  const filteredListings = listings.filter((l) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      l.title.toLowerCase().includes(s) ||
      (l.city && l.city.toLowerCase().includes(s)) ||
      (l.organizationName && l.organizationName.toLowerCase().includes(s))
    );
  });

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      (r.listingTitle && r.listingTitle.toLowerCase().includes(s)) ||
      (r.organizationName && r.organizationName.toLowerCase().includes(s)) ||
      (r.orphanageName && r.orphanageName.toLowerCase().includes(s))
    );
  });

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Network Administration & Oversight</h1>
          <p>
            Real-time control center to manage verified participants, moderate food listings, and monitor request allocations.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Network Stats Grid */}
      <div className="stats">
        <div className="stat-widget accent-emerald">
          <b>{stats?.providers ?? "..."}</b>
          <span>Food Providers</span>
        </div>
        <div className="stat-widget accent-blue">
          <b>{stats?.orphanages ?? "..."}</b>
          <span>Registered Orphanages</span>
        </div>
        <div className="stat-widget">
          <b>{stats?.listings ?? "..."}</b>
          <span>Total Surplus Batches</span>
        </div>
        <div className="stat-widget accent-amber">
          <b>{stats?.pendingRequests ?? "..."}</b>
          <span>Pending Portion Requests</span>
        </div>
        <div className="stat-widget">
          <b>{stats?.completedPickups ?? "..."}</b>
          <span>Completed Pickups</span>
        </div>
        <div className="stat-widget accent-emerald">
          <b>{stats?.mealsRescued ?? "..."}</b>
          <span>Total Units Rescued</span>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="category-pills-bar" style={{ marginTop: "1rem" }}>
        <button
          type="button"
          className={`cat-filter-pill ${activeTab === "USERS" ? "active" : ""}`}
          onClick={() => { setActiveTab("USERS"); setSearchQuery(""); }}
        >
          <IconUsers size={16} /> Manage Users ({users.length})
        </button>
        <button
          type="button"
          className={`cat-filter-pill ${activeTab === "LISTINGS" ? "active" : ""}`}
          onClick={() => { setActiveTab("LISTINGS"); setSearchQuery(""); }}
        >
          <IconPackage size={16} /> Moderate Listings ({listings.length})
        </button>
        <button
          type="button"
          className={`cat-filter-pill ${activeTab === "REQUESTS" ? "active" : ""}`}
          onClick={() => { setActiveTab("REQUESTS"); setSearchQuery(""); }}
        >
          <IconClock size={16} /> Monitor Requests ({requests.length})
        </button>
      </div>

      {/* Search Bar for Table */}
      <div className="search-input-wrap" style={{ maxWidth: "380px", marginBottom: "1rem" }}>
        <IconSearch size={18} />
        <input
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : activeTab === "USERS" ? (
        /* Users Tab */
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Organization</th>
                <th>Email & Phone</th>
                <th>Role</th>
                <th>City</th>
                <th>Account Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.organizationName || "—"}</td>
                  <td>
                    {u.email}
                    {u.phone && <small className="muted" style={{ display: "block" }}>{u.phone}</small>}
                  </td>
                  <td>
                    <span className="pill badge-category">
                      {u.role}
                    </span>
                  </td>
                  <td>{u.city || "—"}</td>
                  <td>
                    <span className={`pill ${u.enabled !== false ? "available" : "rejected"}`}>
                      {u.enabled !== false ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td>
                    {u.role !== "ADMIN" && (
                      <button
                        type="button"
                        className={`btn ${u.enabled !== false ? "btn-secondary" : "btn-primary"} sm`}
                        onClick={() => handleToggleUser(u)}
                      >
                        {u.enabled !== false ? "Suspend" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }} className="muted">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === "LISTINGS" ? (
        /* Listings Tab */
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Batch Title</th>
                <th>Provider Organization</th>
                <th>Category</th>
                <th>Stock (Remaining / Total)</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((l) => {
                const isSample = l.title?.includes("[Sample Data]") || l.description?.includes("[Sample Data]");
                return (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.title}</strong>
                      {isSample && <span className="sample-data-badge" style={{ marginLeft: "0.5rem" }}>Sample</span>}
                    </td>
                    <td>{l.organizationName || "Provider"}</td>
                    <td><span className="pill badge-category">{l.foodType}</span></td>
                    <td>
                      <strong>{l.remainingQuantity}</strong> / {l.quantity} {l.unit}
                    </td>
                    <td>{l.expiryDate}</td>
                    <td><span className={`pill ${l.status.toLowerCase()}`}>{l.status}</span></td>
                    <td>
                      {l.status === "AVAILABLE" && (
                        <button
                          type="button"
                          className="btn btn-secondary sm"
                          onClick={() => setCancelListingTarget(l)}
                          style={{ color: "#ef4444" }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredListings.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }} className="muted">
                    No listings match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Requests Tab */
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Food Batch</th>
                <th>Orphanage Shelter</th>
                <th>Requested Qty</th>
                <th>Shelter Note</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.listingTitle}</strong></td>
                  <td>{r.organizationName || r.orphanageName}</td>
                  <td>
                    <span className="pill badge-category">
                      {r.requestedQuantity} {r.unit}
                    </span>
                  </td>
                  <td>{r.message ? `"${r.message}"` : "—"}</td>
                  <td><span className={`pill ${r.status.toLowerCase()}`}>{r.status}</span></td>
                  <td><small className="muted">{r.createdAt?.replace("T", " ").slice(0, 16)}</small></td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }} className="muted">
                    No portion requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal to Cancel Listing */}
      <ConfirmModal
        isOpen={Boolean(cancelListingTarget)}
        onClose={() => setCancelListingTarget(null)}
        onConfirm={handleConfirmCancelListing}
        title="Admin: Cancel Surplus Listing?"
        message={`Are you sure you want to administratively cancel "${cancelListingTarget?.title}"? This will immediately remove it from discovery.`}
        confirmText="Confirm Administrative Cancellation"
        isDanger={true}
        loading={cancellingListing}
      />
    </section>
  );
}
