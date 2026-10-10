import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/client";
import { IconPackage, IconMapPin, IconCalendar, IconCheckCircle, IconArrowRight } from "../components/Icons";
import { categoryImages, getFoodImage } from "../utils/foodImages";
import { useToast } from "../components/Toast";

const empty = {
  title: "",
  description: "",
  foodType: "Cooked meals",
  quantity: 20,
  unit: "portions",
  expiryDate: "",
  pickupAddress: "",
  city: ""
};

export default function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(Boolean(id));

  // Compute minimum expiry date (today)
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!id) {
      // Set default expiry date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      setForm((prev) => ({
        ...prev,
        expiryDate: tomorrow.toISOString().split("T")[0]
      }));
      return;
    }
    setFetching(true);
    api.get(`/api/listings/${id}`)
      .then((res) => {
        const l = res.data;
        setForm({
          title: l.title,
          description: l.description || "",
          foodType: l.foodType,
          quantity: l.quantity,
          unit: l.unit,
          expiryDate: l.expiryDate,
          pickupAddress: l.pickupAddress,
          city: l.city || ""
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setFetching(false));
  }, [id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.expiryDate) {
      setError("Please specify a valid expiration date.");
      return;
    }

    if (Number(form.quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    setLoading(true);
    const payload = { ...form, quantity: Number(form.quantity) };
    try {
      if (id) {
        await api.put(`/api/listings/${id}`, payload);
        addToast("Listing updated successfully!", "success");
      } else {
        await api.post("/api/listings", payload);
        addToast("Surplus batch published and visible to orphanages!", "success");
      }
      navigate("/app/listings");
    } catch (err) {
      setError(err.message || "Failed to save listing");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="card" style={{ padding: "3rem", textAlign: "center" }}>Loading listing details...</div>;
  }

  return (
    <section style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="page-head">
        <div>
          <Link to="/app/listings" className="muted" style={{ fontSize: "0.88rem", display: "inline-block", marginBottom: "0.5rem" }}>
            ← Back to My Listings
          </Link>
          <h1>{id ? "Edit Surplus Food Batch" : "Post Surplus Food"}</h1>
          <p>
            {id 
              ? "Update batch quantities or schedule changes." 
              : "List excess fresh meals or ingredients for rapid redistribution."}
          </p>
        </div>
      </div>

      <form className="card" onSubmit={submit}>
        {error && <div className="alert alert-error">{error}</div>}

        {/* Visual Category Banner Preview */}
        <div className="modal-item-preview" style={{ marginBottom: "1.5rem" }}>
          <img
            src={getFoodImage(form.foodType, form.title)}
            alt="Category preview"
            className="modal-item-thumb"
            style={{ width: "100px", height: "100px" }}
          />
          <div className="modal-item-info">
            <span className="pill badge-category">{form.foodType}</span>
            <h4 style={{ margin: "0.25rem 0" }}>{form.title || "Untitled Batch"}</h4>
            <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
              High-resolution category photo preview that orphanages will see during discovery.
            </p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="list-title">Food Batch Title / Item Name</label>
          <input
            id="list-title"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g., Fresh Vegetable Biryani & Raita (Lunch Surplus)"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="list-desc">Detailed Description & Dietary Notes</label>
          <textarea
            id="list-desc"
            value={form.description}
            onChange={set("description")}
            placeholder="Describe preparation time, packaging conditions (e.g. sealed containers), allergen info, heating instructions..."
            rows={3}
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="list-category">Food Category</label>
            <select id="list-category" value={form.foodType} onChange={set("foodType")}>
              <option value="Cooked meals">Cooked meals</option>
              <option value="Bakery">Bakery & Breads</option>
              <option value="Produce">Produce (Fruits & Vegetables)</option>
              <option value="Dairy">Dairy & Cold Chain</option>
              <option value="Packaged">Packaged Goods</option>
              <option value="Vegetarian">Vegetarian Specials</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="list-city">City / Area</label>
            <input
              id="list-city"
              value={form.city}
              onChange={set("city")}
              placeholder="e.g., Hyderabad"
              required
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label htmlFor="list-qty">Quantity Available</label>
            <input
              id="list-qty"
              type="number"
              min="1"
              value={form.quantity}
              onChange={set("quantity")}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="list-unit">Unit of Measure</label>
            <select id="list-unit" value={form.unit} onChange={set("unit")}>
              <option value="portions">portions</option>
              <option value="kg">kg (kilograms)</option>
              <option value="loaves">loaves / units</option>
              <option value="liters">liters</option>
              <option value="packs">sealed packs</option>
              <option value="boxes">boxes / cartons</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="list-expiry">Safe Expiry Date</label>
            <input
              id="list-expiry"
              type="date"
              min={todayStr}
              value={form.expiryDate}
              onChange={set("expiryDate")}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="list-addr">Pickup Address / Kitchen Location</label>
          <input
            id="list-addr"
            value={form.pickupAddress}
            onChange={set("pickupAddress")}
            placeholder="Street address, gate, or kitchen collection point"
            required
          />
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <Link to="/app/listings" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving Batch..." : id ? "Save Changes" : "Publish Surplus Batch"}
          </button>
        </div>
      </form>
    </section>
  );
}
