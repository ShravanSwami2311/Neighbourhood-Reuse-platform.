CREATE DATABASE IF NOT EXISTS neighbourhood_reuse
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE neighbourhood_reuse;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  area VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Clothing','Books','Electronics','Furniture','Household','Toys','Other') NOT NULL,
  item_condition ENUM('New','Like New','Good','Fair') NOT NULL DEFAULT 'Good',
  image_url VARCHAR(500),
  location VARCHAR(200) NOT NULL,
  status ENUM('available','reserved','donated') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_items_category (category),
  INDEX idx_items_status (status),
  INDEX idx_items_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  requester_id INT NOT NULL,
  message VARCHAR(500),
  status ENUM('pending','accepted','rejected','cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_requests_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_requests_user FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_item_request (item_id, requester_id),
  INDEX idx_requests_requester (requester_id),
  INDEX idx_requests_item (item_id)
) ENGINE=InnoDB;
