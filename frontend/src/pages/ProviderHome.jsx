import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import {
  IconPlus,
  IconClock,
  IconMapPin,
  IconPackage,
  IconCalendar,
  IconAlertCircle,
  IconCheckCircle
} from "../components/Icons";
import { getFoodImage } from "../utils/foodImages";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../components/Toast";

export default function ProviderHome() {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/api/listings/mine")
      .then((res) => {
        setListings(res.data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.delete(`/api/listings/${cancelTarget.id}`);
      addToast(`Listing "${cancelTarget.title}" was cancelled.`, "success");
      setCancelTarget(null);
      load();
    } catch (err) {
      setError(err.message || "Failed to cancel listing");
    } finally {
      setCancelling(false);
    }
  };

  const filteredListings = listings.filter((item) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  // Calculate metrics
  const totalListedPortions = listings.reduce((acc, cur) => acc + (cur.quantity || 0), 0);
  const remainingPortions = listings.reduce((acc, cur) => acc + (cur.remainingQuantity || 0), 0);
  const claimedPortions = totalListedPortions - remainingPortions;
  const activeCount = listings.filter((l) => l.status === "AVAILABLE").length;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Provider Surplus Hub</h1>
          <p>Post and manage surplus batches. Remaining quantities update in real-time as shelters request food.</p>
        </div>
        <div className="row">
          <Link className="btn btn-outline" to="/app/incoming">
            <IconClock size={18} /> View Incoming Requests
          </Link>
          <Link className="btn btn-primary" to="/app/listings/new">
            <IconPlus size={18} /> Post Surplus Food
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Quick Provider Metrics */}
      <div className="stats">
        <div className="stat-widget accent-emerald">
          <b>{activeCount}</b>
          <span>Active Available Batches</span>
        </div>
        <div className="stat-widget">
          <b>{listings.length}</b>
          <span>Total Batches Listed</span>
        </div>
        <div className="stat-widget accent-amber">
          <b>{remainingPortions}</b>
          <span>Units Still Available</span>
        </div>
        <div className="stat-widget accent-blue">
          <b>{claimedPortions}</b>
          <span>Units Claimed / Allocated</span>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="category-pills-bar">
        {["ALL", "AVAILABLE", "DEPLETED", "EXPIRED", "CANCELLED"].map((st) => (
          <button
            key={st}
            type="button"
            className={`cat-filter-pill ${filter === st ? "active" : ""}`}
            onClick={() => setFilter(st)}
          >
            {st === "ALL" ? `All (${listings.length})` : `${st.charAt(0) + st.slice(1).toLowerCase()} (${listings.filter(l => l.status === st).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <CardSkeleton count={3} />
      ) : filteredListings.length === 0 ? (
        <EmptyState
          icon={IconPackage}
          title={filter === "ALL" ? "No surplus batches posted yet" : `No ${filter.toLowerCase()} listings`}
          description={
            filter === "ALL"
              ? "Share excess food from your kitchen or bakery. Orphanages in your city will be notified."
              : `There are currently no listings in "${filter.toLowerCase()}" status.`
          }
          actionText={filter === "ALL" ? "Create First Listing" : "View All Listings"}
          actionTo={filter === "ALL" ? "/app/listings/new" : undefined}
          onAction={filter !== "ALL" ? () => setFilter("ALL") : undefined}
        />
      ) : (
        <div className="grid-cards">
          {filteredListings.map((item) => {
            const isSample = item.title?.includes("[Sample Data]") || item.description?.includes("[Sample Data]");
            const percentRemaining = Math.max(0, Math.min(100, Math.round((item.remainingQuantity / item.quantity) * 100)));

            return (
              <article className="food-card" key={item.id}>
                <div className="food-card-img-wrap">
                  <img
                    src={getFoodImage(item.foodType, item.title)}
                    alt={item.title}
                    className="food-card-img"
                    loading="lazy"
                  />
                  <div className="food-card-badges">
                    <span className="pill badge-category">{item.foodType}</span>
                    <span className={`pill ${item.status.toLowerCase()}`}>{item.status}</span>
                  </div>
                </div>

                <div className="food-card-body">
                  {isSample && <span className="sample-data-badge" style={{ marginBottom: "0.4rem", alignSelf: "flex-start" }}>Sample Listing</span>}
                  <h3 className="food-card-title">{item.title}</h3>
                  <p className="food-card-desc">{item.description}</p>

                  <div className="food-card-meta">
                    <div className="meta-item">
                      <IconMapPin size={15} />
                      <span>{item.pickupAddress}, {item.city}</span>
                    </div>
                    <div className="meta-item">
                      <IconCalendar size={15} />
                      <span>Expiry: {item.expiryDate}</span>
                    </div>
                  </div>

                  <div className="stock-meter">
                    <div className="stock-meter-header">
                      <span>Remaining Stock</span>
                      <span><strong>{item.remainingQuantity}</strong> / {item.quantity} {item.unit} ({percentRemaining}%)</span>
                    </div>
                    <div className="stock-bar-track">
                      <div
                        className="stock-bar-fill"
                        style={{
                          width: `${percentRemaining}%`,
                          background: item.status === "DEPLETED" || item.remainingQuantity === 0 ? "#94a3b8" : undefined
                        }}
                      />
                    </div>
                  </div>

                  <div className="food-card-footer row" style={{ justifyContent: "space-between" }}>
                    <div className="row">
                      {item.status !== "CANCELLED" && (
                        <Link className="btn btn-secondary sm" to={`/app/listings/${item.id}/edit`}>
                          Edit
                        </Link>
                      )}
                      {item.status === "AVAILABLE" && (
                        <button
                          type="button"
                          className="btn btn-secondary sm"
                          onClick={() => setCancelTarget(item)}
                          style={{ color: "#ef4444" }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <Link to="/app/incoming" className="btn btn-outline sm">
                      Requests
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Cancelling Listing */}
      <ConfirmModal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Food Listing?"
        message={`Are you sure you want to cancel "${cancelTarget?.title}"? Orphanages will no longer be able to request this batch.`}
        confirmText="Yes, Cancel Listing"
        isDanger={true}
        loading={cancelling}
      />
    </section>
  );
}
