import React, { useState } from "react";
import api from "../api/client";
import {
  IconSparkles,
  IconSearch,
  IconMapPin,
  IconCalendar,
  IconBuilding,
  IconPackage,
  IconCheckCircle
} from "../components/Icons";
import { getFoodImage } from "../utils/foodImages";
import RequestFoodModal from "../components/RequestFoodModal";
import EmptyState from "../components/EmptyState";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../components/Toast";

const SUGGESTED_QUERIES = [
  "Vegetarian meals near Hyderabad for 30 children",
  "Fresh bakery loaves, bread and breakfast buns",
  "Organic fruits, apples and produce for kids",
  "Pasteurized milk and chilled dairy items",
  "Ready-to-eat packaged lunch kits"
];

export default function AiSearch() {
  const [query, setQuery] = useState("Vegetarian meals near Hyderabad for 30 children");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const { data } = await api.post("/api/ai/search", { query });
      setResults(data.results || []);
    } catch (err) {
      setError(err.message || "AI search request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggested = (sq) => {
    setQuery(sq);
  };

  const handleRequestSubmit = async ({ requestedQuantity, message }) => {
    if (!selectedListing) return;
    setRequesting(true);
    try {
      await api.post(`/api/listings/${selectedListing.id}/requests`, {
        requestedQuantity,
        message: message || query
      });
      addToast(
        `Request sent for ${requestedQuantity} ${selectedListing.unit} of "${selectedListing.title}"!`,
        "success"
      );
      setSelectedListing(null);
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
          <h1>AI-Powered Semantic Food Matcher</h1>
          <p>
            Describe dietary preferences, headcounts, or specific food requirements in natural conversational language.
            Gemini parses your intent securely on the backend.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <form onSubmit={handleSearch}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="ai-query">
              What do your shelter children or residents need today?
            </label>
            <textarea
              id="ai-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              placeholder="e.g., We have 40 kids needing a warm vegetarian dinner, preferably rice with lentils or mild vegetable curry..."
              required
              className="form-textarea"
            />
          </div>

          {/* Quick Query Suggestions */}
          <div style={{ marginBottom: "1.25rem" }}>
            <span className="label-hint" style={{ display: "block", marginBottom: "0.4rem" }}>
              Try sample requests:
            </span>
            <div className="row">
              {SUGGESTED_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  className="cat-filter-pill sm"
                  onClick={() => handleSelectSuggested(sq)}
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary large"
            disabled={loading}
          >
            <IconSparkles size={18} />
            {loading ? "Matching with Gemini AI..." : "Search Available Surplus"}
          </button>
        </form>
      </div>

      {loading ? (
        <CardSkeleton count={2} />
      ) : searched && results.length === 0 ? (
        <EmptyState
          icon={IconSparkles}
          title="No exact matches found for your criteria"
          description="Try rephrasing your prompt or check the full catalog on the Discover Surplus tab."
          actionText="Browse All Available Food"
          actionTo="/app/browse"
        />
      ) : (
        results.length > 0 && (
          <div>
            <h3 style={{ marginBottom: "1rem" }}>
              AI Ranked Matches ({results.length} found)
            </h3>
            <div className="grid-cards">
              {results.map((item) => {
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
                          <span>{item.city}</span>
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
                        >
                          Request Matching Food
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Request Modal */}
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
