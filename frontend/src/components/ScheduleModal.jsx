import React, { useState } from "react";
import Modal from "./Modal";
import { IconClock, IconMapPin, IconCalendar } from "./Icons";

export default function ScheduleModal({ isOpen, onClose, request, onSubmit, loading }) {
  // Pre-fill tomorrow 10:00 AM or near future
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    // Format YYYY-MM-DDTHH:MM in local time
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [scheduledAt, setScheduledAt] = useState(getDefaultDateTime());
  const [pickupLocation, setPickupLocation] = useState(
    request?.pickupAddress || "Provider Kitchen / Main Entrance"
  );
  const [error, setError] = useState("");

  if (!request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!scheduledAt) {
      setError("Please select a valid scheduled date and time.");
      return;
    }
    if (!pickupLocation || pickupLocation.trim().length === 0) {
      setError("Please specify the pickup location.");
      return;
    }
    const formatted = scheduledAt.length === 16 ? `${scheduledAt}:00` : scheduledAt;
    onSubmit({ scheduledAt: formatted, pickupLocation: pickupLocation.trim() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Food Pickup"
      subtitle={`Accepted: ${request.requestedQuantity} ${request.unit} of "${request.listingTitle}"`}
    >
      <form onSubmit={handleSubmit} className="schedule-modal-form">
        <div className="modal-banner-highlight">
          <p>
            <strong>Status: Accepted by Provider</strong>
            <br />
            Once scheduled, a unique collection QR code will be generated to verify the handoff.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="sched-time">
            Pickup Date & Time
          </label>
          <div className="input-with-icon">
            <input
              id="sched-time"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <small className="field-help">Coordinate this time with the provider's operating hours.</small>
        </div>

        <div className="form-group">
          <label htmlFor="sched-loc">
            Pickup Location & Access Point
          </label>
          <input
            id="sched-loc"
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            placeholder="e.g., Gate 2, Pantry Loading Dock"
            required
            className="form-input"
          />
          <small className="field-help">Specify exact gate, door, or counter where the recipient volunteer will arrive.</small>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Scheduling..." : "Confirm & Generate QR"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
