import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import {
  IconClock,
  IconCalendar,
  IconMapPin,
  IconQrCode,
  IconCheckCircle,
  IconAlertCircle,
  IconBuilding
} from "../components/Icons";
import ScheduleModal from "../components/ScheduleModal";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../components/Toast";

export default function MyRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/api/requests/mine")
      .then((res) => {
        setItems(res.data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleScheduleSubmit = async ({ scheduledAt, pickupLocation }) => {
    if (!scheduleTarget) return;
    setScheduling(true);
    try {
      const { data } = await api.post(`/api/pickups/requests/${scheduleTarget.id}`, {
        scheduledAt,
        pickupLocation
      });
      addToast("Pickup scheduled! Opening collection QR code...", "success");
      setScheduleTarget(null);
      navigate(`/app/pickups/${data.id}`);
    } catch (err) {
      setError(err.message || "Failed to schedule pickup.");
    } finally {
      setScheduling(false);
    }
  };

  const filteredItems = items.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>My Food Requests</h1>
          <p>
            Track your requested food portions. When a provider accepts, schedule your collection window
            to generate your verified pickup QR code.
          </p>
        </div>
        <Link to="/app/browse" className="btn btn-outline">
          Discover More Surplus
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter Tabs */}
      <div className="category-pills-bar">
        {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((st) => (
          <button
            key={st}
            type="button"
            className={`cat-filter-pill ${filter === st ? "active" : ""}`}
            onClick={() => setFilter(st)}
          >
            {st === "ALL" ? `All Requests (${items.length})` : `${st.charAt(0) + st.slice(1).toLowerCase()} (${items.filter(r => r.status === st).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={3} cols={4} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={IconClock}
          title={filter === "ALL" ? "No food requests yet" : `No ${filter.toLowerCase()} requests`}
          description={
            filter === "ALL"
              ? "Browse available surplus food listings and submit portion requests for your orphanage."
              : `You have no requests with status "${filter.toLowerCase()}".`
          }
          actionText={filter === "ALL" ? "Browse Surplus Food" : "View All Requests"}
          actionTo={filter === "ALL" ? "/app/browse" : undefined}
          onAction={filter !== "ALL" ? () => setFilter("ALL") : undefined}
        />
      ) : (
        <div className="card-list">
          {filteredItems.map((r) => (
            <article className="card" key={r.id}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="row" style={{ marginBottom: "0.4rem" }}>
                    <span className="pill badge-category">
                      {r.organizationName || "Provider"}
                    </span>
                    <span className={`pill ${r.status.toLowerCase()}`}>{r.status}</span>
                  </div>
                  <h3 style={{ margin: "0.2rem 0 0.4rem" }}>{r.listingTitle}</h3>
                  <p style={{ margin: "0 0 0.4rem", fontSize: "0.95rem" }}>
                    Requested Quantity: <strong>{r.requestedQuantity} {r.unit}</strong>
                  </p>
                  {r.message && (
                    <p className="muted" style={{ fontSize: "0.85rem", margin: "0.25rem 0" }}>
                      <strong>Your note:</strong> "{r.message}"
                    </p>
                  )}
                  {r.providerNote && (
                    <div className="modal-notice notice-success" style={{ margin: "0.6rem 0 0.4rem" }}>
                      <div>
                        <strong>Provider note:</strong> {r.providerNote}
                      </div>
                    </div>
                  )}
                  <small className="muted" style={{ display: "block", marginTop: "0.5rem" }}>
                    Requested on: {r.createdAt?.replace("T", " ").slice(0, 16)}
                  </small>
                </div>

                <div className="stat-col" style={{ minWidth: "180px" }}>
                  {r.status === "ACCEPTED" && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setScheduleTarget(r)}
                    >
                      <IconCalendar size={16} /> Schedule Pickup
                    </button>
                  )}
                  {r.status === "PENDING" && (
                    <span className="pill pending">Awaiting Provider Response</span>
                  )}
                  {r.status === "REJECTED" && (
                    <span className="pill rejected">Declined</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={Boolean(scheduleTarget)}
        onClose={() => setScheduleTarget(null)}
        request={scheduleTarget}
        onSubmit={handleScheduleSubmit}
        loading={scheduling}
      />
    </section>
  );
}
