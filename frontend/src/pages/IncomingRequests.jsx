import React, { useEffect, useState } from "react";
import api from "../api/client";
import {
  IconClock,
  IconCheck,
  IconX,
  IconBuilding,
  IconPackage,
  IconAlertCircle,
  IconCheckCircle
} from "../components/Icons";
import DecisionModal from "../components/DecisionModal";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../components/Toast";

export default function IncomingRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [decisionState, setDecisionState] = useState({ isOpen: false, request: null, action: null });
  const [deciding, setDeciding] = useState(false);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/api/requests/incoming")
      .then((res) => {
        setItems(res.data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openDecision = (request, action) => {
    setDecisionState({ isOpen: true, request, action });
  };

  const closeDecision = () => {
    setDecisionState({ isOpen: false, request: null, action: null });
  };

  const handleDecisionSubmit = async ({ providerNote }) => {
    const { request, action } = decisionState;
    if (!request || !action) return;
    setDeciding(true);
    try {
      await api.post(`/api/requests/${request.id}/${action}`, { providerNote });
      addToast(
        action === "accept"
          ? `Request accepted! ${request.requestedQuantity} ${request.unit} reserved for ${request.organizationName || request.orphanageName}.`
          : `Request from ${request.organizationName || request.orphanageName} declined.`,
        "success"
      );
      closeDecision();
      load();
    } catch (err) {
      setError(err.message || "Failed to process decision");
    } finally {
      setDeciding(false);
    }
  };

  const filteredItems = items.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  const pendingCount = items.filter((r) => r.status === "PENDING").length;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Incoming Portion Requests</h1>
          <p>
            Review requests from registered orphanages and shelters. Accepting immediately reserves portions
            in MySQL with a pessimistic lock.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Metrics strip */}
      <div className="stats">
        <div className="stat-widget accent-amber">
          <b>{pendingCount}</b>
          <span>Awaiting Your Approval</span>
        </div>
        <div className="stat-widget accent-emerald">
          <b>{items.filter((r) => r.status === "ACCEPTED").length}</b>
          <span>Approved Requests</span>
        </div>
        <div className="stat-widget">
          <b>{items.length}</b>
          <span>Total Requests Received</span>
        </div>
      </div>

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
        <TableSkeleton rows={4} cols={4} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={IconClock}
          title={filter === "ALL" ? "No incoming requests yet" : `No ${filter.toLowerCase()} requests`}
          description={
            filter === "ALL"
              ? "When orphanages in your area discover your surplus listings, their portion requests will appear here."
              : `There are currently no portion requests marked as "${filter.toLowerCase()}".`
          }
          actionText={filter !== "ALL" ? "View All Requests" : undefined}
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
                      <IconBuilding size={14} /> {r.organizationName || r.orphanageName}
                    </span>
                    <span className={`pill ${r.status.toLowerCase()}`}>{r.status}</span>
                  </div>
                  <h3 style={{ margin: "0.2rem 0 0.4rem" }}>{r.listingTitle}</h3>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>
                    Requested: <strong>{r.requestedQuantity} {r.unit}</strong>
                  </p>
                  {r.message && (
                    <div className="orphanage-message-card" style={{ margin: "0.5rem 0" }}>
                      <span className="quote-label">Note from Shelter:</span>
                      <p className="quote-text">"{r.message}"</p>
                    </div>
                  )}
                  {r.providerNote && (
                    <p className="muted" style={{ fontSize: "0.85rem", margin: "0.4rem 0" }}>
                      <strong>Your Note:</strong> {r.providerNote}
                    </p>
                  )}
                  <small className="muted">Submitted: {r.createdAt?.replace("T", " ").slice(0, 16)}</small>
                </div>

                <div className="stat-col" style={{ minWidth: "160px" }}>
                  {r.status === "PENDING" ? (
                    <div className="row">
                      <button
                        type="button"
                        className="btn btn-primary sm"
                        onClick={() => openDecision(r, "accept")}
                      >
                        <IconCheck size={16} /> Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary sm"
                        onClick={() => openDecision(r, "reject")}
                        style={{ color: "#ef4444" }}
                      >
                        <IconX size={16} /> Decline
                      </button>
                    </div>
                  ) : (
                    <span className={`pill ${r.status.toLowerCase()}`}>
                      {r.status === "ACCEPTED" ? "Approved" : "Declined"}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      <DecisionModal
        isOpen={decisionState.isOpen}
        onClose={closeDecision}
        request={decisionState.request}
        action={decisionState.action}
        onSubmit={handleDecisionSubmit}
        loading={deciding}
      />
    </section>
  );
}
