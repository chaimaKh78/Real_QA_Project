const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  secret: 'cosmetic-store-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'cosmetic_db'
});

let useMemoryStore = false;
db.connect(err => {
  if (err) {
    console.log('MySQL not connected, using in-memory store');
    useMemoryStore = true;
    return;
  }
  console.log('Connected to MySQL');
  useMemoryStore = false;
  initDatabase();
});

function initDatabase() {
  db.query(`
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
    )
  `);
  
  db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      price DECIMAL(10,2) NOT NULL,
      image VARCHAR(500),
      description TEXT,
      details TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.query(`
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
    )
  `);
  
  db.query(`
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
    )
  `);
}

let users = [];
let products = [
  { id: 1, name: 'Luxury Face Cream', category: 'Skincare', price: 45.99, image: 'https://via.placeholder.com/400x400/ffb6c1/333?text=Cream', description: 'Premium moisturizing cream with hyaluronic acid', details: 'Size: 50ml\n\nThis luxurious face cream deeply hydrates and nourishes your skin. Enriched with hyaluronic acid and vitamin E, it helps reduce fine lines and leaves your skin feeling soft and supple.\n\nDirections: Apply daily morning and evening to clean face and neck.\n\nIngredients: Water, Hyaluronic Acid, Vitamin E, Shea Butter, Jojoba Oil' },
  { id: 2, name: 'Vitamin C Serum', category: 'Skincare', price: 39.99, image: 'https://via.placeholder.com/400x400/ffd700/333?text=Serum', description: 'Brightening serum with vitamin C', details: 'Size: 30ml\n\nA potent vitamin C serum that brightens and evens skin tone. Reduces dark spots and hyperpigmentation for a radiant glow.\n\nDirections: Apply 2-3 drops morning and evening before moisturizer.\n\nIngredients: 20% Vitamin C, Ferulic Acid, Vitamin E, Hyaluronic Acid' },
  { id: 3, name: 'Hydrating Lipstick', category: 'Lips', price: 24.99, image: 'https://via.placeholder.com/400x400/ff69b4/333?text=Lipstick', description: 'Long-lasting hydrating lipstick', details: 'Size: 3.5g\n\nUltra-hydrating lipstick with shea butter and vitamin E. Provides intense color payoff with moisture that lasts all day.\n\nAvailable in 12 shades.\n\nDirections: Apply directly to lips.' },
  { id: 4, name: 'Volumizing Mascara', category: 'Eyes', price: 18.99, image: 'https://via.placeholder.com/400x400/8b4513/fff?text=Mascara', description: 'Ultra volume mascara', details: 'Size: 10ml\n\nIntense volume mascara that builds dramatic lashes in one stroke. Smudge-proof and water-resistant formula.\n\nDirections: Apply from root to tip, building layers for more volume.' },
  { id: 5, name: 'Foundation SPF 30', category: 'Face', price: 35.99, image: 'https://via.placeholder.com/400x400/deb887/333?text=Foundation', description: 'Lightweight foundation with sun protection', details: 'Size: 30ml\n\nLightweight, buildable coverage with broad-spectrum SPF 30. Protects while providing a natural, flawless finish.\n\nDirections: Apply with fingers or brush. Blend well.\n\nShades: Fair, Medium, Deep' },
  { id: 6, name: 'Rose Gold Palette', category: 'Eyes', price: 52.99, image: 'https://via.placeholder.com/400x400/b76e79/fff?text=Palette', description: '12-shade eyeshadow palette', details: '12 x 1.2g\n\nA stunning collection of 12 rose gold shimmer and matte shades. Highly pigmented and blendable for endless looks.\n\nShades include: Champagne, Rose Quartz, Bronze, Copper, Wine, and more.' }
];
let orders = [];
let comments = [];
let nextProductId = 7;
let nextOrderId = 1;
let nextCommentId = 1;

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

function getCart(session) {
  if (!session.cart) session.cart = [];
  return session.cart;
}

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let filtered = products;
  if (category && category !== 'all') {
    filtered = products.filter(p => p.category === category);
  }
  res.json(filtered);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) res.json(product);
  else res.status(404).json({ error: 'Product not found' });
});

app.get('/api/comments/:productId', (req, res) => {
  const productComments = comments.filter(c => c.productId === parseInt(req.params.productId));
  res.json(productComments);
});

app.post('/api/comments', (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.session.user?.id;
  const username = req.session.user?.username;
  
  if (!userId) return res.status(401).json({ error: 'Must be logged in to comment' });
  if (!productId || !comment) return res.status(400).json({ error: 'Product ID and comment are required' });
  
  const newComment = {
    id: nextCommentId++,
    productId: parseInt(productId),
    userId,
    username,
    rating: rating || 5,
    comment,
    createdAt: new Date().toISOString()
  };
  
  comments.push(newComment);
  res.json(newComment);
});

app.get('/api/cart', (req, res) => {
  const cart = getCart(req.session);
  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)
  }));
  res.json(cartItems);
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  const cart = getCart(req.session);
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  res.json(cart);
});

app.put('/api/cart/:productId', (req, res) => {
  const { quantity } = req.body;
  const cart = getCart(req.session);
  const item = cart.find(i => i.productId === parseInt(req.params.productId));
  if (item) {
    item.quantity = quantity;
    res.json(cart);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.delete('/api/cart/:productId', (req, res) => {
  const cart = getCart(req.session);
  const index = cart.findIndex(i => i.productId === parseInt(req.params.productId));
  if (index > -1) {
    cart.splice(index, 1);
  }
  res.json(cart);
});

app.delete('/api/cart', (req, res) => {
  req.session.cart = [];
  res.json([]);
});

app.post('/api/checkout', (req, res) => {
  const { name, email, address, phone } = req.body;
  const cart = getCart(req.session);
  const userId = req.session.user?.id;
  
  if (!name || !email || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  
  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  
  const order = {
    id: nextOrderId++,
    userId,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    customerAddress: address,
    items: JSON.stringify(cart),
    total,
    status: 'pending',
    date: new Date().toISOString()
  };
  
  orders.push(order);
  req.session.cart = [];
  res.json({ orderId: order.id, order });
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    const { password, ...user } = req.session.user;
    res.json(user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, email, fullName } = req.body;
  
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password and email are required' });
  }
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    password,
    email,
    fullName: fullName || username,
    role: 'customer',
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  req.session.user = newUser;
  const { password: p, ...user } = newUser;
  res.json(user);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  req.session.user = user;
  const { password: p, ...userData } = user;
  res.json(userData);
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: 'Email not found' });
  }
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + 3600000).toISOString();
  
  console.log(`Password reset link for ${email}: http://localhost:3000/reset-password.html?token=${resetToken}`);
  console.log(`Reset token: ${resetToken}`);
  
  res.json({ message: 'Password reset link sent to your email', token: resetToken });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }
  
  const user = users.find(u => u.resetToken === token);
  if (!user) {
    return res.status(400).json({ error: 'Invalid token' });
  }
  
  if (new Date(user.resetTokenExpiry) < new Date()) {
    return res.status(400).json({ error: 'Token expired' });
  }
  
  user.password = newPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  
  res.json({ message: 'Password reset successfully' });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

app.resetTestData = () => {
  users = [];
  comments = [];
  orders = [];
  nextOrderId = 1;
  nextCommentId = 1;
};

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Cosmetic store running at http://localhost:${PORT}`);
  });
}

module.exports = app;