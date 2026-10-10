import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/client";
import {
  IconCalendar,
  IconMapPin,
  IconCopy,
  IconCheckCircle,
  IconCheck,
  IconQrCode
} from "../components/Icons";
import { useToast } from "../components/Toast";

export default function PickupDetail() {
  const { id } = useParams();
  const [pickup, setPickup] = useState(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const { addToast } = useToast();

  const load = () => {
    api.get(`/api/pickups/${id}`)
      .then((res) => setPickup(res.data))
      .catch((err) => setError(err.message));
  };

  useEffect(load, [id]);

  const copyToken = () => {
    if (!pickup?.qrToken) return;
    navigator.clipboard.writeText(pickup.qrToken);
    addToast("QR Token copied to clipboard!", "success");
  };

  const confirmDirectly = async () => {
    if (!pickup?.qrToken) return;
    setConfirming(true);
    try {
      await api.post("/api/pickups/confirm", { qrToken: pickup.qrToken });
      addToast("Collection confirmed! Hand-off verified and logged.", "success");
      load();
    } catch (err) {
      setError(err.message || "Failed to confirm pickup.");
    } finally {
      setConfirming(false);
    }
  };

  if (error) {
    return (
      <div className="qr-page-container">
        <div className="alert alert-error">{error}</div>
        <Link to="/app/pickups" className="btn btn-secondary">← Back to Pickups</Link>
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="qr-page-container">
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>Loading pickup details...</div>
      </div>
    );
  }

  const isCompleted = pickup.status === "COMPLETED";

  return (
    <div className="qr-page-container">
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/app/pickups" className="muted" style={{ fontSize: "0.88rem" }}>
          ← Back to Pickups & QR
        </Link>
      </div>

      <div className="card qr-card">
        <div className="row" style={{ justifyContent: "center", marginBottom: "0.5rem" }}>
          <span className={`pill ${pickup.status.toLowerCase()}`}>
            {isCompleted ? "Collection Completed" : "Ready for Pickup"}
          </span>
        </div>

        <h2 style={{ margin: "0.4rem 0 0.5rem" }}>{pickup.listingTitle}</h2>

        <div className="row muted" style={{ justifyContent: "center", gap: "1.25rem", margin: "0.5rem 0 1rem" }}>
          <span className="row" style={{ gap: "0.4rem" }}>
            <IconCalendar size={16} /> {pickup.scheduledAt?.replace("T", " ").slice(0, 16)}
          </span>
          <span className="row" style={{ gap: "0.4rem" }}>
            <IconMapPin size={16} /> {pickup.pickupLocation}
          </span>
        </div>

        {pickup.qrToken && (
          <>
            <div className="qr-box-wrap">
              <QRCodeSVG
                value={pickup.qrToken}
                size={230}
                level="H"
                fgColor="#0a2e1f"
                bgColor="#ffffff"
              />
            </div>

            <div className="token-copy-box">
              <div>
                <small className="muted" style={{ display: "block", textAlign: "left" }}>
                  Verification Token:
                </small>
                <code>{pickup.qrToken}</code>
              </div>
              <button
                type="button"
                className="btn btn-secondary sm"
                onClick={copyToken}
                title="Copy token to clipboard"
              >
                <IconCopy size={16} /> Copy
              </button>
            </div>
          </>
        )}

        {isCompleted ? (
          <div className="alert alert-success" style={{ justifyContent: "center" }}>
            <IconCheckCircle size={20} />
            <span>This food pickup has been verified and completed successfully!</span>
          </div>
        ) : (
          <div style={{ marginTop: "1rem" }}>
            <p className="muted" style={{ fontSize: "0.9rem", margin: "0 0 1.25rem 0" }}>
              Present this QR code to the food provider at pickup. They scan or confirm the token to complete the transfer.
            </p>
            <button
              type="button"
              className="btn btn-primary large full"
              onClick={confirmDirectly}
              disabled={confirming}
            >
              <IconCheck size={18} />
              {confirming ? "Confirming..." : "Confirm Collection (One-Click Verify)"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
