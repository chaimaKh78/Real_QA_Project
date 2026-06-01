const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create a test app that mimics the server
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// In-memory data stores for testing
let users = [];
let products = [
  { id: 1, name: 'Luxury Face Cream', category: 'Skincare', price: 45.99, image: 'test.jpg', description: 'Test cream', details: 'Test details', createdAt: new Date().toISOString() },
  { id: 2, name: 'Vitamin C Serum', category: 'Skincare', price: 39.99, image: 'test2.jpg', description: 'Test serum', details: 'Test details', createdAt: new Date().toISOString() }
];
let comments = [];
let orders = [];
let nextCommentId = 1;
let nextOrderId = 1;

// Routes
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
  const cart = req.session.cart || [];
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

  if (!req.session.cart) req.session.cart = [];
  const cart = req.session.cart;
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
  const cart = req.session.cart || [];
  const item = cart.find(i => i.productId === parseInt(req.params.productId));
  if (item) {
    item.quantity = quantity;
    res.json(cart);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.delete('/api/cart/:productId', (req, res) => {
  const cart = req.session.cart || [];
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
  const cart = req.session.cart || [];
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
    createdAt: new Date().toISOString()
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

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

module.exports = app;