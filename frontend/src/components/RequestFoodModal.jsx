import React, { useState } from "react";
import Modal from "./Modal";
import { IconPackage, IconMapPin, IconCalendar, IconCheckCircle } from "./Icons";
import { getFoodImage } from "../utils/foodImages";

export default function RequestFoodModal({ isOpen, onClose, listing, onSubmit, loading }) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!listing) return null;

  const maxQty = listing.remainingQuantity;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const qtyNum = Number(quantity);
    if (!qtyNum || qtyNum <= 0) {
      setError("Please enter a valid quantity greater than zero.");
      return;
    }
    if (qtyNum > maxQty) {
      setError(`Cannot request more than the remaining quantity (${maxQty} ${listing.unit}).`);
      return;
    }
    onSubmit({ requestedQuantity: qtyNum, message });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Surplus Food"
      subtitle={`Submit a portion request to ${listing.organizationName || "the provider"}`}
    >
      <form onSubmit={handleSubmit} className="request-modal-form">
        <div className="modal-item-preview">
          <img 
            src={getFoodImage(listing.foodType, listing.title)} 
            alt={listing.title} 
            className="modal-item-thumb" 
          />
          <div className="modal-item-info">
            <span className="pill badge-category">{listing.foodType}</span>
            <h4 className="modal-item-title">{listing.title}</h4>
            <p className="modal-item-meta">
              <IconMapPin size={14} /> {listing.city || "Local area"} · <IconCalendar size={14} /> Expires {listing.expiryDate}
            </p>
            <div className="modal-stock-highlight">
              Available: <strong>{listing.remainingQuantity} {listing.unit}</strong> (out of {listing.quantity} {listing.unit})
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="req-qty">
            Quantity Needed ({listing.unit})
            <span className="label-hint">Max available: {maxQty}</span>
          </label>
          <div className="quantity-stepper">
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}
              disabled={Number(quantity) <= 1}
            >
              -
            </button>
            <input 
              id="req-qty"
              type="number" 
              min="1" 
              max={maxQty} 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              required 
              className="stepper-input"
            />
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setQuantity(Math.min(maxQty, Number(quantity) + 1))}
              disabled={Number(quantity) >= maxQty}
            >
              +
            </button>
          </div>
          <small className="field-help">
            Request only the portions your shelter can safely distribute before the expiration date.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="req-msg">
            Message for Provider <span className="optional-tag">(Optional)</span>
          </label>
          <textarea
            id="req-msg"
            rows="3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., We serve dinner for 35 children and can collect by 6:00 PM."
            className="form-textarea"
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting..." : `Request ${quantity || 0} ${listing.unit}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
