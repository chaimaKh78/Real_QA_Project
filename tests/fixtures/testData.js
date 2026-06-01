// Test fixtures for cosmetic store

const testUsers = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    role: 'customer',
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'Admin User',
    role: 'admin',
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

const testProducts = [
  {
    id: 1,
    name: 'Luxury Face Cream',
    category: 'Skincare',
    price: 45.99,
    image: 'https://via.placeholder.com/400x400/ffb6c1/333?text=Cream',
    description: 'Premium moisturizing cream with hyaluronic acid',
    details: 'Size: 50ml\n\nThis luxurious face cream deeply hydrates and nourishes your skin.',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Vitamin C Serum',
    category: 'Skincare',
    price: 39.99,
    image: 'https://via.placeholder.com/400x400/ffd700/333?text=Serum',
    description: 'Brightening serum with vitamin C',
    details: 'Size: 30ml\n\nA potent vitamin C serum that brightens and evens skin tone.',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

const testComments = [
  {
    id: 1,
    productId: 1,
    userId: 1,
    username: 'testuser',
    rating: 5,
    comment: 'Great product! Highly recommend.',
    createdAt: '2024-01-02T00:00:00.000Z'
  },
  {
    id: 2,
    productId: 1,
    userId: 2,
    username: 'admin',
    rating: 4,
    comment: 'Good quality, but a bit pricey.',
    createdAt: '2024-01-03T00:00:00.000Z'
  }
];

const testOrders = [
  {
    id: 1,
    userId: 1,
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    customerPhone: '123-456-7890',
    customerAddress: '123 Test St, Test City, TC 12345',
    items: JSON.stringify([{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }]),
    total: 131.97,
    status: 'pending',
    createdAt: '2024-01-04T00:00:00.000Z'
  }
];

const testCart = [
  { productId: 1, quantity: 2 },
  { productId: 2, quantity: 1 }
];

module.exports = {
  testUsers,
  testProducts,
  testComments,
  testOrders,
  testCart
};