CREATE DATABASE IF NOT EXISTS smartfoodrescue
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartfoodrescue;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL,
  organization_name VARCHAR(255),
  phone VARCHAR(64),
  address VARCHAR(500),
  city VARCHAR(128),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_listings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  provider_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(2000),
  food_type VARCHAR(128),
  quantity INT NOT NULL,
  remaining_quantity INT NOT NULL,
  unit VARCHAR(64) NOT NULL,
  expiry_date DATE,
  pickup_address VARCHAR(500) NOT NULL,
  city VARCHAR(128),
  status VARCHAR(32) NOT NULL,
  version BIGINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_listing_provider FOREIGN KEY (provider_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS food_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  listing_id BIGINT NOT NULL,
  orphanage_id BIGINT NOT NULL,
  requested_quantity INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  message VARCHAR(1000),
  provider_note VARCHAR(1000),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_request_listing FOREIGN KEY (listing_id) REFERENCES food_listings(id),
  CONSTRAINT fk_request_orphanage FOREIGN KEY (orphanage_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS pickups (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  request_id BIGINT NOT NULL UNIQUE,
  scheduled_at DATETIME NOT NULL,
  pickup_location VARCHAR(500) NOT NULL,
  status VARCHAR(32) NOT NULL,
  qr_token VARCHAR(64) NOT NULL UNIQUE,
  collected_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pickup_request FOREIGN KEY (request_id) REFERENCES food_requests(id)
);

CREATE TABLE IF NOT EXISTS food_transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  pickup_id BIGINT NOT NULL,
  listing_id BIGINT NOT NULL,
  provider_id BIGINT NOT NULL,
  orphanage_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  unit VARCHAR(64) NOT NULL,
  type VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tx_pickup FOREIGN KEY (pickup_id) REFERENCES pickups(id),
  CONSTRAINT fk_tx_listing FOREIGN KEY (listing_id) REFERENCES food_listings(id),
  CONSTRAINT fk_tx_provider FOREIGN KEY (provider_id) REFERENCES users(id),
  CONSTRAINT fk_tx_orphanage FOREIGN KEY (orphanage_id) REFERENCES users(id)
);

-- Optional: seed an admin later through the app on first boot.
-- Default local admin (created by the backend): admin@smartfoodrescue.local / Admin@12345
