import React, { useState } from "react";
import Modal from "./Modal";
import { IconCheck, IconX, IconAlertCircle } from "./Icons";

export default function DecisionModal({ isOpen, onClose, request, action, onSubmit, loading }) {
  const [providerNote, setProviderNote] = useState("");

  if (!request) return null;

  const isAccept = action === "accept";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ providerNote });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAccept ? "Accept Food Request" : "Decline Food Request"}
      subtitle={`${isAccept ? "Approve" : "Decline"} request from ${request.organizationName || request.orphanageName}`}
    >
      <form onSubmit={handleSubmit} className="decision-modal-form">
        <div className={`modal-notice ${isAccept ? "notice-success" : "notice-warning"}`}>
          <div className="notice-icon">
            {isAccept ? <IconCheck size={20} /> : <IconAlertCircle size={20} />}
          </div>
          <div>
            <strong>{isAccept ? "Accepting this request:" : "Declining this request:"}</strong>
            <p>
              {isAccept 
                ? `Will reserve ${request.requestedQuantity} ${request.unit} from your active listing "${request.listingTitle}". Remaining quantity will be updated immediately in the database.`
                : `Will mark this request as declined. The ${request.requestedQuantity} ${request.unit} will remain available for other shelters.`
              }
            </p>
          </div>
        </div>

        {request.message && (
          <div className="orphanage-message-card">
            <span className="quote-label">Orphanage note:</span>
            <p className="quote-text">"{request.message}"</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="decision-note">
            Note for Orphanage <span className="optional-tag">(Optional)</span>
          </label>
          <textarea
            id="decision-note"
            rows="3"
            value={providerNote}
            onChange={(e) => setProviderNote(e.target.value)}
            placeholder={
              isAccept 
                ? "e.g., Prepared and packaged. Please bring clean thermal carriers."
                : "e.g., Unfortunately already reserved for an earlier batch."
            }
            className="form-textarea"
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            type="submit" 
            className={`btn ${isAccept ? "btn-primary" : "btn-danger"}`}
            disabled={loading}
          >
            {loading ? "Processing..." : isAccept ? "Confirm & Accept" : "Confirm Decline"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
