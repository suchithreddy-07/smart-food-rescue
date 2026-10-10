import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import {
  IconQrCode,
  IconClock,
  IconMapPin,
  IconCalendar,
  IconCheckCircle,
  IconCheck,
  IconTruck
} from "../components/Icons";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../components/Toast";

export default function Pickups() {
  const [items, setItems] = useState([]);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/api/pickups")
      .then((res) => {
        setItems(res.data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    if (!token.trim()) return;

    setConfirming(true);
    try {
      const { data } = await api.post("/api/pickups/confirm", { qrToken: token.trim() });
      addToast(`Collection confirmed for "${data.listingTitle}"! Recorded in transaction ledger.`, "success");
      setToken("");
      load();
    } catch (err) {
      setError(err.message || "Failed to confirm pickup. Please verify token.");
    } finally {
      setConfirming(false);
    }
  };

  const filteredItems = items.filter((p) => {
    if (filter === "ALL") return true;
    return p.status === filter;
  });

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Pickups & QR Verification</h1>
          <p>
            Verify and complete food handoffs. The provider enters or scans the token shown on the orphanage's QR code.
          </p>
        </div>
      </div>

      {/* QR Token Confirmation Form */}
      <div className="card" style={{ marginBottom: "2rem", borderLeft: "4px solid var(--primary)" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 0.5rem 0" }}>
          <IconQrCode size={20} /> Verify Collection With QR Token
        </h3>
        <p className="muted" style={{ margin: "0 0 1.25rem 0", fontSize: "0.9rem" }}>
          Enter the verification token displayed on the recipient's mobile screen upon pickup.
          This marks the handoff as completed and permanently registers the food rescue transaction.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleConfirm} className="row" style={{ alignItems: "flex-end", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: "260px" }}>
            <label htmlFor="qr-token-input" style={{ marginBottom: "0.4rem" }}>
              Collection QR Token
            </label>
            <input
              id="qr-token-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={confirming || !token.trim()}>
            <IconCheck size={18} />
            {confirming ? "Verifying Token..." : "Confirm Handoff"}
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="category-pills-bar">
        {["ALL", "SCHEDULED", "COMPLETED"].map((st) => (
          <button
            key={st}
            type="button"
            className={`cat-filter-pill ${filter === st ? "active" : ""}`}
            onClick={() => setFilter(st)}
          >
            {st === "ALL" ? `All Pickups (${items.length})` : `${st.charAt(0) + st.slice(1).toLowerCase()} (${items.filter(p => p.status === st).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={3} cols={4} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={IconTruck}
          title={filter === "ALL" ? "No scheduled pickups yet" : `No ${filter.toLowerCase()} pickups`}
          description={
            filter === "ALL"
              ? "Pickups will appear here as soon as accepted requests are scheduled with a date, time, and location."
              : `You have no pickup records with status "${filter.toLowerCase()}".`
          }
          actionText={filter !== "ALL" ? "View All Pickups" : undefined}
          onAction={filter !== "ALL" ? () => setFilter("ALL") : undefined}
        />
      ) : (
        <div className="card-list">
          {filteredItems.map((p) => (
            <article className="card" key={p.id}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="row" style={{ marginBottom: "0.4rem" }}>
                    <span className="pill badge-category">Pickup #{p.id}</span>
                    <span className={`pill ${p.status.toLowerCase()}`}>{p.status}</span>
                  </div>
                  <h3 style={{ margin: "0.2rem 0 0.5rem" }}>{p.listingTitle}</h3>
                  <div className="row muted" style={{ fontSize: "0.9rem", gap: "1.25rem", margin: "0.4rem 0" }}>
                    <span className="row" style={{ gap: "0.4rem" }}>
                      <IconCalendar size={16} /> {p.scheduledAt?.replace("T", " ").slice(0, 16)}
                    </span>
                    <span className="row" style={{ gap: "0.4rem" }}>
                      <IconMapPin size={16} /> {p.pickupLocation}
                    </span>
                  </div>
                  {p.collectedAt && (
                    <small className="muted" style={{ display: "block", marginTop: "0.4rem" }}>
                      Collected: {p.collectedAt.replace("T", " ").slice(0, 16)}
                    </small>
                  )}
                </div>

                <div className="stat-col">
                  <div className="row">
                    <Link className="btn btn-secondary" to={`/app/pickups/${p.id}`}>
                      <IconQrCode size={16} /> View QR Code
                    </Link>
                    {p.status === "SCHEDULED" && p.qrToken && (
                      <button
                        type="button"
                        className="btn btn-outline sm"
                        onClick={() => setToken(p.qrToken)}
                        title="Auto-fill token into verification box"
                      >
                        Use Token
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
