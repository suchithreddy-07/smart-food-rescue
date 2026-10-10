import React from "react";
import { Link } from "react-router-dom";
import { IconPackage } from "./Icons";

export default function EmptyState({ 
  icon: Icon = IconPackage, 
  title = "No items found", 
  description = "There are no records to display at this moment.", 
  actionText, 
  actionTo, 
  onAction 
}) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon">
        <Icon size={44} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionText && (
        actionTo ? (
          <Link to={actionTo} className="btn btn-primary empty-state-btn">
            {actionText}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className="btn btn-primary empty-state-btn">
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
