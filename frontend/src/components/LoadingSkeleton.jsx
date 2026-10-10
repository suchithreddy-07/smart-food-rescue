import React from "react";

export function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="spinner-wrapper">
      <div className="loading-spinner"></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-shimmer skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-shimmer skeleton-badge"></div>
            <div className="skeleton-shimmer skeleton-title"></div>
            <div className="skeleton-shimmer skeleton-line"></div>
            <div className="skeleton-shimmer skeleton-line short"></div>
            <div className="skeleton-shimmer skeleton-btn"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 4, cols = 4 }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="skeleton-row">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton-shimmer skeleton-cell"></div>
          ))}
        </div>
      ))}
    </div>
  );
}
