import React from "react";
import Modal from "./Modal";
import { IconAlertCircle } from "./Icons";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDanger = false, loading = false }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-modal-content">
        <div className={`modal-notice ${isDanger ? "notice-danger" : "notice-warning"}`}>
          <div className="notice-icon">
            <IconAlertCircle size={22} />
          </div>
          <div>
            <p>{message}</p>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            type="button" 
            className={`btn ${isDanger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
