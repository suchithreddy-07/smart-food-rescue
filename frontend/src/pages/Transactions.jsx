import React, { useEffect, useState } from "react";
import api from "../api/client";
import {
  IconTruck,
  IconSearch,
  IconCheckCircle,
  IconPackage,
  IconCalendar
} from "../components/Icons";
import EmptyState from "../components/EmptyState";
import { TableSkeleton } from "../components/LoadingSkeleton";

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/api/transactions")
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter((t) => {
    if (!q.trim()) return true;
    const search = q.toLowerCase();
    return (
      (t.listingTitle && t.listingTitle.toLowerCase().includes(search)) ||
      (t.providerName && t.providerName.toLowerCase().includes(search)) ||
      (t.orphanageName && t.orphanageName.toLowerCase().includes(search))
    );
  });

  const totalMealsRescued = items.reduce((acc, cur) => acc + (cur.quantity || 0), 0);

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Verified Handoff History</h1>
          <p>
            Immutable transaction record of all completed food handoffs and verified collections.
          </p>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="stats">
        <div className="stat-widget accent-emerald">
          <b>{totalMealsRescued}</b>
          <span>Total Food Units Rescued</span>
        </div>
        <div className="stat-widget">
          <b>{items.length}</b>
          <span>Completed Handoffs</span>
        </div>
      </div>

      {/* Search box */}
      <div className="search-input-wrap" style={{ maxWidth: "360px", marginBottom: "1.25rem" }}>
        <IconSearch size={18} />
        <input
          placeholder="Filter by food, provider, or shelter..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={IconTruck}
          title="No completed transactions yet"
          description="When scheduled pickups are verified with their QR code, completed collection records will be preserved here."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Food Batch</th>
                <th>Provider (Donated By)</th>
                <th>Orphanage (Rescued By)</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="row" style={{ gap: "0.4rem", fontSize: "0.85rem" }}>
                      <IconCalendar size={14} />
                      {t.createdAt?.replace("T", " ").slice(0, 16)}
                    </span>
                  </td>
                  <td><strong>{t.listingTitle}</strong></td>
                  <td>{t.providerName}</td>
                  <td>{t.orphanageName}</td>
                  <td>
                    <span className="pill badge-category">
                      {t.quantity} {t.unit}
                    </span>
                  </td>
                  <td>
                    <span className="pill completed">
                      <IconCheckCircle size={13} /> Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
