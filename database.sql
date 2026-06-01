-- SQL Script for Luxe Beauty Cosmetic Store
-- Run this in your MySQL database

CREATE DATABASE IF NOT EXISTS cosmetic_db;
USE cosmetic_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer',
  resetToken VARCHAR(255),
  resetTokenExpiry DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(500),
  description TEXT,
  details TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Comments/Reviews Table
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  userId INT NOT NULL,
  username VARCHAR(255),
  rating INT DEFAULT 5,
  comment TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  customerName VARCHAR(255),
  customerEmail VARCHAR(255),
  customerPhone VARCHAR(50),
  customerAddress TEXT,
  items TEXT,
  total DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Sample Products
INSERT INTO products (name, category, price, image, description, details) VALUES
('Luxury Face Cream', 'Skincare', 45.99, 'https://via.placeholder.com/400x400/ffb6c1/333?text=Cream', 'Premium moisturizing cream with hyaluronic acid', 'Size: 50ml\n\nThis luxurious face cream deeply hydrates and nourishes your skin. Enriched with hyaluronic acid and vitamin E, it helps reduce fine lines and leaves your skin feeling soft and supple.\n\nDirections: Apply daily morning and evening to clean face and neck.\n\nIngredients: Water, Hyaluronic Acid, Vitamin E, Shea Butter, Jojoba Oil'),
('Vitamin C Serum', 'Skincare', 39.99, 'https://via.placeholder.com/400x400/ffd700/333?text=Serum', 'Brightening serum with vitamin C', 'Size: 30ml\n\nA potent vitamin C serum that brightens and evens skin tone. Reduces dark spots and hyperpigmentation for a radiant glow.\n\nDirections: Apply 2-3 drops morning and evening before moisturizer.\n\nIngredients: 20% Vitamin C, Ferulic Acid, Vitamin E, Hyaluronic Acid'),
('Hydrating Lipstick', 'Lips', 24.99, 'https://via.placeholder.com/400x400/ff69b4/333?text=Lipstick', 'Long-lasting hydrating lipstick', 'Size: 3.5g\n\nUltra-hydrating lipstick with shea butter and vitamin E. Provides intense color payoff with moisture that lasts all day.\n\nAvailable in 12 shades.\n\nDirections: Apply directly to lips.'),
('Volumizing Mascara', 'Eyes', 18.99, 'https://via.placeholder.com/400x400/8b4513/fff?text=Mascara', 'Ultra volume mascara', 'Size: 10ml\n\nIntense volume mascara that builds dramatic lashes in one stroke. Smudge-proof and water-resistant formula.\n\nDirections: Apply from root to tip, building layers for more volume.'),
('Foundation SPF 30', 'Face', 35.99, 'https://via.placeholder.com/400x400/deb887/333?text=Foundation', 'Lightweight foundation with sun protection', 'Size: 30ml\n\nLightweight, buildable coverage with broad-spectrum SPF 30. Protects while providing a natural, flawless finish.\n\nDirections: Apply with fingers or brush. Blend well.\n\nShades: Fair, Medium, Deep'),
('Rose Gold Palette', 'Eyes', 52.99, 'https://via.placeholder.com/400x400/b76e79/fff?text=Palette', '12-shade eyeshadow palette', '12 x 1.2g\n\nA stunning collection of 12 rose gold shimmer and matte shades. Highly pigmented and blendable for endless looks.\n\nShades include: Champagne, Rose Quartz, Bronze, Copper, Wine, and more.');