const request = require('supertest');
const app = require('../../server');

describe('API Integration Tests', () => {
  beforeEach(() => {
    app.resetTestData();
  });

  describe('Products API', () => {
    test('GET /api/products - should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('price');
    });

    test('GET /api/products?category=Skincare - should filter by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Skincare')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(product => {
        expect(product.category).toBe('Skincare');
      });
    });

    test('GET /api/products/:id - should return specific product', async () => {
      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
    });

    test('GET /api/products/:id - should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  describe('Authentication API', () => {
    test('POST /api/auth/register - should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    test('POST /api/auth/login - should login with correct credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'logintest',
          email: 'login@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'logintest',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('username', 'logintest');
      expect(response.body).not.toHaveProperty('password');
    });

    test('POST /api/auth/login - should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('GET /api/auth/me - should return current user when authenticated', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'authtest',
          email: 'auth@example.com',
          password: 'password123'
        });

      const agent = request.agent(app);
      await agent
        .post('/api/auth/login')
        .send({
          username: 'authtest',
          password: 'password123'
        });

      const response = await agent
        .get('/api/auth/me')
        .expect(200);

      expect(response.body).toHaveProperty('username', 'authtest');
    });

    test('GET /api/auth/me - should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Not authenticated');
    });
  });

  describe('Cart API', () => {
    let agent;

    beforeEach(() => {
      agent = request.agent(app);
    });

    test('POST /api/cart - should add item to cart', async () => {
      const response = await agent
        .post('/api/cart')
        .send({ productId: 1, quantity: 2 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toContainEqual({ productId: 1, quantity: 2 });
    });

    test('GET /api/cart - should return cart with product details', async () => {
      await agent
        .post('/api/cart')
        .send({ productId: 1, quantity: 1 });

      const response = await agent
        .get('/api/cart')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('productId', 1);
      expect(response.body[0]).toHaveProperty('quantity', 1);
      expect(response.body[0]).toHaveProperty('product');
      expect(response.body[0].product).toHaveProperty('name');
    });

    test('PUT /api/cart/:productId - should update cart item quantity', async () => {
      await agent
        .post('/api/cart')
        .send({ productId: 1, quantity: 1 });

      const response = await agent
        .put('/api/cart/1')
        .send({ quantity: 3 })
        .expect(200);

      expect(response.body).toContainEqual({ productId: 1, quantity: 3 });
    });

    test('DELETE /api/cart/:productId - should remove item from cart', async () => {
      await agent
        .post('/api/cart')
        .send({ productId: 1, quantity: 1 });

      await agent
        .delete('/api/cart/1')
        .expect(200);

      const cartResponse = await agent
        .get('/api/cart');

      expect(cartResponse.body).toEqual([]);
    });

    test('DELETE /api/cart - should clear the cart', async () => {
      await agent
        .post('/api/cart')
        .send({ productId: 1, quantity: 1 });

      const response = await agent
        .delete('/api/cart')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('PUT /api/cart/:productId - should return 404 when item not found', async () => {
      const response = await agent
        .put('/api/cart/999')
        .send({ quantity: 2 })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    test('DELETE /api/cart/:productId - should return empty array when item does not exist', async () => {
      const response = await agent
        .delete('/api/cart/999')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('Checkout API', () => {
    let agent;

    beforeEach(() => {
      agent = request.agent(app);
    });

    test('POST /api/checkout - should return 400 when cart is empty', async () => {
      const response = await agent
        .post('/api/checkout')
        .send({ name: 'Test', email: 'test@example.com', address: '123 Street', phone: '1234567890' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Cart is empty');
    });

    test('POST /api/checkout - should create an order and clear the cart', async () => {
      await agent
        .post('/api/cart')
        .send({ productId: 1, quantity: 2 });

      const checkoutResponse = await agent
        .post('/api/checkout')
        .send({ name: 'Test User', email: 'checkout@example.com', address: '123 Street', phone: '1234567890' })
        .expect(200);

      expect(checkoutResponse.body).toHaveProperty('orderId');
      expect(checkoutResponse.body.order).toHaveProperty('total');
      expect(checkoutResponse.body.order.customerEmail).toBe('checkout@example.com');

      const cartResponse = await agent
        .get('/api/cart')
        .expect(200);

      expect(cartResponse.body).toEqual([]);
    });

    test('GET /api/orders - should return orders list', async () => {
      await agent
        .post('/api/cart')
        .send({ productId: 1, quantity: 1 });

      await agent
        .post('/api/checkout')
        .send({ name: 'Order User', email: 'order@example.com', address: '123 Street', phone: '1234567890' });

      const response = await agent
        .get('/api/orders')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Auth additional cases', () => {
    test('POST /api/auth/register - should reject duplicate username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'duplicate', email: 'dup1@example.com', password: 'password123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'duplicate', email: 'dup2@example.com', password: 'password123' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Username already exists');
    });

    test('POST /api/auth/register - should reject duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'emaildup', email: 'dupemail@example.com', password: 'password123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'emaildup2', email: 'dupemail@example.com', password: 'password123' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email already exists');
    });

    test('POST /api/auth/logout - should logout user successfully', async () => {
      const agent = request.agent(app);
      await agent
        .post('/api/auth/register')
        .send({ username: 'logoutuser', email: 'logout@example.com', password: 'password123' });

      const response = await agent
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    test('POST /api/auth/forgot-password - should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email is required');
    });

    test('POST /api/auth/forgot-password - should return 404 when email is not found', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'missing@example.com' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Email not found');
    });

    test('POST /api/auth/forgot-password and reset-password - should reset password successfully', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'resetuser', email: 'reset@example.com', password: 'password123' });

      const forgotResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@example.com' })
        .expect(200);

      expect(forgotResponse.body).toHaveProperty('token');
      const token = forgotResponse.body.token;

      const resetResponse = await request(app)
        .post('/api/auth/reset-password')
        .send({ token, newPassword: 'newpassword123' })
        .expect(200);

      expect(resetResponse.body).toHaveProperty('message', 'Password reset successfully');
    });

    test('POST /api/auth/reset-password - should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid', newPassword: 'password123' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });

  describe('Comments API', () => {
    let agent;

    beforeEach(async () => {
      agent = request.agent(app);
      await agent
        .post('/api/auth/register')
        .send({
          username: 'commentuser',
          email: 'comment@example.com',
          password: 'password123'
        });
    });

    test('POST /api/comments - should add comment when authenticated', async () => {
      const commentData = {
        productId: 1,
        rating: 5,
        comment: 'Great product!'
      };

      const response = await agent
        .post('/api/comments')
        .send(commentData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('productId', 1);
      expect(response.body).toHaveProperty('comment', 'Great product!');
      expect(response.body).toHaveProperty('rating', 5);
    });

    test('POST /api/comments - should reject comment when not authenticated', async () => {
      const response = await request(app)
        .post('/api/comments')
        .send({
          productId: 1,
          comment: 'Test comment'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Must be logged in to comment');
    });

    test('GET /api/comments/:productId - should return comments for product', async () => {
      await agent
        .post('/api/comments')
        .send({
          productId: 1,
          rating: 4,
          comment: 'Good product'
        });

      const response = await request(app)
        .get('/api/comments/1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('productId', 1);
    });
  });

});
