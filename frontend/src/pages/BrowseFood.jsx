import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import {
  IconSearch,
  IconMapPin,
  IconCalendar,
  IconBuilding,
  IconFilter,
  IconSparkles,
  IconPackage,
  IconCheckCircle
} from "../components/Icons";
import { getFoodImage } from "../utils/foodImages";
import RequestFoodModal from "../components/RequestFoodModal";
import EmptyState from "../components/EmptyState";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../components/Toast";

const CATEGORIES = ["ALL", "Cooked meals", "Bakery", "Produce", "Dairy", "Packaged", "Vegetarian"];

export default function BrowseFood() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    const params = {};
    if (q.trim()) params.q = q.trim();
    if (city.trim()) params.city = city.trim();
    if (activeCategory !== "ALL") params.foodType = activeCategory;

    api.get("/api/listings/available", { params })
      .then((res) => {
        setItems(res.data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeCategory]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const handleRequestSubmit = async ({ requestedQuantity, message }) => {
    if (!selectedListing) return;
    setRequesting(true);
    try {
      await api.post(`/api/listings/${selectedListing.id}/requests`, {
        requestedQuantity,
        message
      });
      addToast(
        `Request for ${requestedQuantity} ${selectedListing.unit} of "${selectedListing.title}" sent to ${selectedListing.organizationName || "provider"}!`,
        "success"
      );
      setSelectedListing(null);
      load(); // Refresh listings to reflect updated remaining availability if modified
    } catch (err) {
      setError(err.message || "Failed to submit portion request.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Discover Surplus Food</h1>
          <p>
            Browse available food donations from verified community partners. Request only what you can safely consume.
          </p>
        </div>
        <Link to="/app/ai" className="btn btn-outline">
          <IconSparkles size={18} /> Try AI Smart Search
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <form className="filters-bar" onSubmit={handleFilterSubmit}>
        <div className="search-input-wrap">
          <IconSearch size={18} />
          <input
            placeholder="Search by meal, dish, or dietary type..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div style={{ minWidth: "180px" }}>
          <input
            placeholder="City (e.g. Hyderabad)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
        {(q || city || activeCategory !== "ALL") && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setQ("");
              setCity("");
              setActiveCategory("ALL");
            }}
          >
            Reset
          </button>
        )}
      </form>

      {/* Category Pills Bar */}
      <div className="category-pills-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`cat-filter-pill ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "ALL" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Listings Grid */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={IconPackage}
          title="No surplus food available right now"
          description="Try broadening your city or category filter, or check back soon as providers post fresh surplus batches throughout the day."
          actionText="Clear Filters"
          onAction={() => {
            setQ("");
            setCity("");
            setActiveCategory("ALL");
          }}
        />
      ) : (
        <div className="grid-cards">
          {items.map((item) => {
            const isSample = item.title?.includes("[Sample Data]") || item.description?.includes("[Sample Data]");
            const percent = Math.max(0, Math.min(100, Math.round((item.remainingQuantity / item.quantity) * 100)));

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
                    <span className="pill available">Available</span>
                  </div>
                </div>

                <div className="food-card-body">
                  {isSample && <span className="sample-data-badge" style={{ marginBottom: "0.4rem", alignSelf: "flex-start" }}>Sample Listing</span>}
                  <h3 className="food-card-title">{item.title}</h3>
                  <p className="food-card-desc">{item.description}</p>

                  <div className="food-card-meta">
                    <div className="meta-item">
                      <IconBuilding size={15} />
                      <strong>{item.organizationName || "Verified Provider"}</strong>
                    </div>
                    <div className="meta-item">
                      <IconMapPin size={15} />
                      <span>{item.pickupAddress}, {item.city}</span>
                    </div>
                    <div className="meta-item">
                      <IconCalendar size={15} />
                      <span>Expires {item.expiryDate}</span>
                    </div>
                  </div>

                  <div className="stock-meter">
                    <div className="stock-meter-header">
                      <span>Available Portions</span>
                      <span><strong>{item.remainingQuantity}</strong> {item.unit} left</span>
                    </div>
                    <div className="stock-bar-track">
                      <div className="stock-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  <div className="food-card-footer">
                    <button
                      type="button"
                      className="btn btn-primary full"
                      onClick={() => setSelectedListing(item)}
                      disabled={item.remainingQuantity <= 0}
                    >
                      Request Food Portions
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal for Requesting Food */}
      <RequestFoodModal
        isOpen={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        listing={selectedListing}
        onSubmit={handleRequestSubmit}
        loading={requesting}
      />
    </section>
  );
}
