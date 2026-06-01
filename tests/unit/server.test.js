const request = require('supertest');
const app = require('../../server');

describe('Server Unit Tests', () => {
  beforeEach(() => {
    app.resetTestData();
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    test('should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Skincare')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(product => {
        expect(product.category).toBe('Skincare');
      });
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return product by id', async () => {
      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
    });

    test('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });
});