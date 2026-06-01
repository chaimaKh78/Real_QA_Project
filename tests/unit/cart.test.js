const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  calculateTotal,
  getCartWithProducts
} = require('../../utils/cart');
const { testProducts } = require('../fixtures/testData');

describe('Cart Utilities', () => {
  let mockSession;

  beforeEach(() => {
    mockSession = {};
  });

  describe('getCart', () => {
    test('should initialize empty cart if none exists', () => {
      const cart = getCart(mockSession);
      expect(cart).toEqual([]);
      expect(mockSession.cart).toEqual([]);
    });

    test('should return existing cart', () => {
      mockSession.cart = [{ productId: 1, quantity: 2 }];
      const cart = getCart(mockSession);
      expect(cart).toEqual([{ productId: 1, quantity: 2 }]);
    });
  });

  describe('addToCart', () => {
    test('should add new item to cart', () => {
      const cart = addToCart(mockSession, 1, 1, testProducts);
      expect(cart).toEqual([{ productId: 1, quantity: 1 }]);
    });

    test('should increase quantity of existing item', () => {
      mockSession.cart = [{ productId: 1, quantity: 1 }];
      const cart = addToCart(mockSession, 1, 2, testProducts);
      expect(cart).toEqual([{ productId: 1, quantity: 3 }]);
    });

    test('should throw error for non-existent product', () => {
      expect(() => addToCart(mockSession, 999, 1, testProducts)).toThrow('Product not found');
    });
  });

  describe('updateCartItem', () => {
    beforeEach(() => {
      mockSession.cart = [{ productId: 1, quantity: 2 }];
    });

    test('should update item quantity', () => {
      const cart = updateCartItem(mockSession, 1, 5);
      expect(cart).toEqual([{ productId: 1, quantity: 5 }]);
    });

    test('should remove item when quantity is 0 or negative', () => {
      const cart = updateCartItem(mockSession, 1, 0);
      expect(cart).toEqual([]);
    });

    test('should throw error for non-existent item', () => {
      expect(() => updateCartItem(mockSession, 2, 3)).toThrow('Item not found in cart');
    });
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      mockSession.cart = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ];
    });

    test('should remove existing item', () => {
      const cart = removeFromCart(mockSession, 1);
      expect(cart).toEqual([{ productId: 2, quantity: 1 }]);
    });

    test('should handle removing non-existent item', () => {
      const cart = removeFromCart(mockSession, 3);
      expect(cart).toEqual([
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ]);
    });
  });

  describe('clearCart', () => {
    test('should clear all items from cart', () => {
      mockSession.cart = [{ productId: 1, quantity: 2 }];
      const cart = clearCart(mockSession);
      expect(cart).toEqual([]);
      expect(mockSession.cart).toEqual([]);
    });
  });

  describe('calculateTotal', () => {
    test('should calculate total price correctly', () => {
      const cart = [
        { productId: 1, quantity: 2 }, // 45.99 * 2 = 91.98
        { productId: 2, quantity: 1 }  // 39.99 * 1 = 39.99
      ];
      const total = calculateTotal(cart, testProducts);
      expect(total).toBe(131.97);
    });

    test('should handle empty cart', () => {
      const total = calculateTotal([], testProducts);
      expect(total).toBe(0);
    });

    test('should handle non-existent products', () => {
      const cart = [{ productId: 999, quantity: 1 }];
      const total = calculateTotal(cart, testProducts);
      expect(total).toBe(0);
    });
  });

  describe('getCartWithProducts', () => {
    test('should enrich cart items with product data', () => {
      const cart = [{ productId: 1, quantity: 2 }];
      const enrichedCart = getCartWithProducts(cart, testProducts);

      expect(enrichedCart).toHaveLength(1);
      expect(enrichedCart[0]).toHaveProperty('productId', 1);
      expect(enrichedCart[0]).toHaveProperty('quantity', 2);
      expect(enrichedCart[0]).toHaveProperty('product');
      expect(enrichedCart[0].product).toHaveProperty('name', 'Luxury Face Cream');
    });
  });
});