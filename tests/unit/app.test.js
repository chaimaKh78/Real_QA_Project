/**
 * @jest-environment jsdom
 */

// Mock DOM elements
document.body.innerHTML = `
  <div id="products-grid"></div>
  <div id="cart-items"></div>
  <div id="cart-empty"></div>
  <div id="cart-summary"></div>
  <div id="product-detail-modal" class="hidden"></div>
  <span class="modal-close"></span>
  <img id="detail-image" />
  <div id="detail-category"></div>
  <div id="detail-name"></div>
  <div id="detail-description"></div>
  <div id="detail-details"></div>
  <div id="detail-price"></div>
  <button id="detail-add-cart"></button>
  <div id="comments-list"></div>
  <div id="add-comment" class="hidden"></div>
  <div id="login-to-comment" class="hidden"></div>
  <div id="login-form-container"></div>
  <div id="register-form-container"></div>
  <div id="forgot-form-container"></div>
  <div id="login-section" class="hidden"></div>
  <div id="register-section" class="hidden"></div>
  <div id="auth-section" class="hidden"></div>
  <div id="checkout-section" class="hidden"></div>
  <div id="success-section" class="hidden"></div>
  <a data-cy="login-link"></a>
  <a data-cy="register-link"></a>
  <a data-cy="profile-link"></a>
  <a data-cy="logout-link"></a>
  <div data-cy="auth-separator"></div>
  <div data-link="home"></div>
  <div data-link="cart"></div>
  <div data-link="login"></div>
  <div data-link="register"></div>
  <div data-link="profile"></div>
  <div data-link="logout"></div>
  <button data-cy="switch-to-register"></button>
  <span data-cy="profile-username"></span>
  <span data-cy="profile-email"></span>
  <span data-cy="profile-fullname"></span>
  <span data-cy="profile-created"></span>
  <button data-cy="filter-skincare" class="filter-btn" data-category="Skincare"></button>
  <button data-cy="filter-makeup" class="filter-btn" data-category="Face"></button>
  <button data-cy="filter-lips" class="filter-btn" data-category="Lips"></button>
  <button data-cy="filter-eyes" class="filter-btn" data-category="Eyes"></button>
  <section id="products-section"></section>
  <section id="cart-section" class="hidden"></section>
  <section id="checkout-section" class="hidden"></section>
  <section id="profile-section" class="hidden"></section>
  <button data-cy="switch-to-login"></button>
  <button data-cy="switch-to-forgot"></button>
  <button data-cy="switch-to-login-forgot"></button>
  <button data-cy="checkout-btn"></button>
  <button data-cy="continue-shopping-btn"></button>
  <a data-cy="login-to-comment-link"></a>
  <span data-cy="cart-count">0</span>
  <span data-cy="total-amount">$0.00</span>
  <span data-cy="checkout-total">$0.00</span>
  <span data-cy="order-number"><span></span></span>
  <form id="login-form">
    <input name="username" />
    <input name="password" />
  </form>
  <form id="register-form">
    <input name="username" />
    <input name="email" />
    <input name="password" />
    <input name="fullName" />
  </form>
  <form id="forgot-form">
    <input name="email" />
  </form>
  <form id="comment-form">
    <input name="rating" />
    <textarea name="comment"></textarea>
  </form>
  <form id="checkout-form">
    <input name="name" />
    <input name="email" />
    <input name="phone" />
    <textarea name="address"></textarea>
    <button type="submit"></button>
  </form>
`;

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));

global.alert = jest.fn();

global.window = window;

global.navigator = { userAgent: 'node.js' };

const app = require('../../public/app');

describe('Frontend App Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    fetch.mockClear();

    // Reset global state
    global.currentSection = 'products';
    global.currentCategory = 'all';
    global.currentUser = null;
    global.currentProductId = null;
  });

  describe('fetchProducts', () => {
    test('should fetch all products', async () => {
      const mockProducts = [{
        id: 1,
        name: 'Test Product',
        category: 'Skincare',
        price: 12.5,
        image: 'test.jpg',
        description: 'A test product',
        details: 'Details'
      }];
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockProducts)
      });

      await app.fetchProducts();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/products');
    });

    test('should fetch products by category', async () => {
      const mockProducts = [{
        id: 1,
        name: 'Skincare Product',
        category: 'Skincare',
        price: 19.99,
        image: 'test.jpg',
        description: 'Skincare product',
        details: 'Details'
      }];
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockProducts)
      });

      await app.fetchProducts('Skincare');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/products?category=Skincare');
    });
  });

  describe('addToCart', () => {
    test('should add product to cart', async () => {
      fetch.mockResolvedValueOnce({ ok: true });

      // Mock updateCartCount
      global.updateCartCount = jest.fn();

      // Mock alert
      global.alert = jest.fn();

      await app.addToCart(1);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 1, quantity: 1 })
      });
      expect(global.alert).toHaveBeenCalledWith('Added to bag!');
    });
  });

  describe('login', () => {
    test('should login successfully', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser)
      });

      // Mock updateAuthUI
      global.updateAuthUI = jest.fn();

      const result = await app.login('testuser', 'password');

      expect(result.success).toBe(true);
    });

    test('should handle login failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      });

      const result = await app.login('testuser', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('register', () => {
    test('should register successfully', async () => {
      const mockUser = { id: 1, username: 'newuser' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser)
      });

      global.updateAuthUI = jest.fn();

      const result = await app.register('newuser', 'new@example.com', 'password', 'New User');

      expect(result.success).toBe(true);
    });

    test('should handle registration failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Username already exists' })
      });

      const result = await app.register('existinguser', 'test@example.com', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already exists');
    });
  });

  describe('logout', () => {
    test('should logout user', async () => {
      global.currentUser = { id: 1, username: 'testuser' };
      fetch.mockResolvedValueOnce({ ok: true });

      global.updateAuthUI = jest.fn();
      global.showSection = jest.fn();

      await app.logout();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/logout', { method: 'POST' });
    });
  });

  describe('fetchProducts', () => {
    test('should fetch all products and render', async () => {
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve([{ id: 1, name: 'Product A', category: 'Skincare', price: 15.0, image: 'a.jpg', description: 'A', details: 'Details' }]) });

      await app.fetchProducts();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/products');
      expect(document.querySelectorAll('[data-cy="product-card"]').length).toBe(1);
    });

    test('should fetch products by category', async () => {
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve([{ id: 2, name: 'Product B', category: 'Lips', price: 10.0, image: 'b.jpg', description: 'B', details: 'Details' }]) });

      await app.fetchProducts('Lips');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/products?category=Lips');
      expect(document.querySelectorAll('[data-cy="product-card"]').length).toBe(1);
    });
  });

  describe('renderProducts', () => {
    test('should render product cards', () => {
      const products = [
        { id: 1, name: 'Product A', category: 'Skincare', price: 15.0, image: 'a.jpg', description: 'A', details: 'Details' },
        { id: 2, name: 'Product B', category: 'Lips', price: 10.0, image: 'b.jpg', description: 'B', details: 'Details' }
      ];

      app.renderProducts(products);

      expect(document.querySelectorAll('[data-cy="product-card"]').length).toBe(2);
      expect(document.querySelector('[data-cy="product-name"]').textContent).toBe('Product A');
    });
  });

  describe('renderCart', () => {
    test('should render empty cart state', () => {
      app.renderCart([]);

      expect(document.getElementById('cart-empty').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('cart-summary').classList.contains('hidden')).toBe(true);
    });

    test('should render cart items and summary', () => {
      const cart = [{ productId: 1, quantity: 2, product: { id: 1, name: 'Test Product', price: 20.0, image: 'p.jpg' } }];
      app.renderCart(cart);

      expect(document.querySelectorAll('[data-cy="cart-item"]').length).toBe(1);
      expect(document.querySelector('[data-cy="total-amount"]').textContent).toContain('$40.00');
    });
  });

  describe('updateCartCount', () => {
    test('should update cart count text', async () => {
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve([{ quantity: 2 }, { quantity: 1 }]) });

      await app.updateCartCount();

      expect(document.querySelector('[data-cy="cart-count"]').textContent).toBe('3');
    });
  });

  describe('showSection', () => {
    test('should show products section and hide others', async () => {
      app.showSection('products');

      expect(document.getElementById('products-section').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('cart-section').classList.contains('hidden')).toBe(true);
    });

    test('should show cart section when requested', async () => {
      app.showSection('cart');

      expect(document.getElementById('cart-section').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('products-section').classList.contains('hidden')).toBe(true);
    });

    test('should show profile section and update UI', () => {
      app.setCurrentUser({ username: 'tester', email: 'test@example.com', fullName: 'Test User' });
      document.querySelector('[data-link="profile"]').click();
      expect(document.getElementById('profile-section').classList.contains('hidden')).toBe(false);
      expect(document.querySelector('[data-cy="profile-username"]').textContent).toBe('tester');
    });

    test('should show auth section on login click event', () => {
      document.querySelector('[data-link="login"]').click();
      expect(document.getElementById('login-form-container').classList.contains('hidden')).toBe(false);
    });

    test('should show auth section on register click event', () => {
      document.querySelector('[data-link="register"]').click();
      expect(document.getElementById('register-form-container').classList.contains('hidden')).toBe(false);
    });

    test('should switch between login and register forms', () => {
      document.querySelector('[data-cy="switch-to-register"]').click();
      expect(document.getElementById('register-form-container').classList.contains('hidden')).toBe(false);
      document.querySelector('[data-cy="switch-to-login"]').click();
      expect(document.getElementById('login-form-container').classList.contains('hidden')).toBe(false);
    });

    test('should show forgot password form and back to login', () => {
      document.querySelector('[data-cy="switch-to-forgot"]').click();
      expect(document.getElementById('forgot-form-container').classList.contains('hidden')).toBe(false);
      document.querySelector('[data-cy="switch-to-login-forgot"]').click();
      expect(document.getElementById('login-form-container').classList.contains('hidden')).toBe(false);
    });

    test('should call logout via nav click event', async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      document.querySelector('[data-link="logout"]').click();
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/logout', { method: 'POST' });
    });

    test('should use filter button events to fetch products', () => {
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve([]) });
      document.querySelector('[data-cy="filter-skincare"]').click();
      expect(document.querySelector('[data-cy="filter-skincare"]').classList.contains('active')).toBe(true);
    });

    test('should navigate to checkout and back using click events', () => {
      document.querySelector('[data-cy="checkout-btn"]').click();
      expect(document.getElementById('checkout-section').classList.contains('hidden')).toBe(false);
      document.querySelector('[data-cy="continue-shopping-btn"]').click();
      expect(document.getElementById('products-section').classList.contains('hidden')).toBe(false);
    });

    test('should open auth by login-to-comment link', () => {
      document.querySelector('[data-cy="login-to-comment-link"]').click();
      expect(document.getElementById('login-form-container').classList.contains('hidden')).toBe(false);
    });
  });

  describe('updateAuthUI and updateProfileUI', () => {
    test('should show logout link when logged in', async () => {
      app.setCurrentUser({ username: 'testuser', email: 'test@example.com', fullName: 'Test User' });

      app.updateAuthUI(true);
      app.updateProfileUI();

      expect(document.querySelector('[data-cy="logout-link"]').classList.contains('hidden')).toBe(false);
      expect(document.querySelector('[data-cy="profile-username"]').textContent).toBe('testuser');
    });

    test('should hide logout link when logged out', () => {
      app.updateAuthUI(false);

      expect(document.querySelector('[data-cy="logout-link"]').classList.contains('hidden')).toBe(true);
    });
  });

  describe('checkAuth', () => {
    test('should set auth state when authenticated', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ username: 'testuser' }) });

      await app.checkAuth();
      expect(document.querySelector('[data-cy="logout-link"]').classList.contains('hidden')).toBe(false);
    });

    test('should set auth state when not authenticated', async () => {
      fetch.mockResolvedValueOnce({ ok: false });

      await app.checkAuth();
      expect(document.querySelector('[data-cy="logout-link"]').classList.contains('hidden')).toBe(true);
    });
  });

  describe('fetchCart', () => {
    test('should fetch and render cart items', async () => {
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve([{ productId: 1, quantity: 1, product: { id: 1, name: 'Test', price: 10.0, image: 'test.jpg' } }]) });

      await app.fetchCart();
      expect(document.querySelectorAll('[data-cy="cart-item"]').length).toBe(1);
    });
  });

  describe('updateQuantity and removeFromCart', () => {
    test('should update cart item quantity when quantity remains positive', async () => {
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve([{ productId: 1, quantity: 1 }]) })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

      await app.updateQuantity(1, 1);
      expect(fetch.mock.calls[1][0]).toBe('http://localhost:3000/api/cart/1');
    });

    test('should remove cart item when quantity drops to zero', async () => {
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve([{ productId: 1, quantity: 1 }]) })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

      await app.updateQuantity(1, -1);
      expect(fetch.mock.calls[1][0]).toBe('http://localhost:3000/api/cart/1');
    });

    test('should delete cart item and refresh cart', async () => {
      fetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ json: () => Promise.resolve([]) });

      await app.removeFromCart(1);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/cart/1', { method: 'DELETE' });
    });
  });

  describe('openProductDetail and closeProductDetail', () => {
    test('should open product detail modal and populate data', async () => {
      const product = {
        id: 1,
        name: 'Detail Product',
        category: 'Skincare',
        price: 12.5,
        image: 'detail.jpg',
        description: 'A detail product',
        details: 'More info'
      };
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve(product) })
        .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

      await app.openProductDetail(1);
      expect(document.getElementById('detail-name').textContent).toBe('Detail Product');
      expect(document.getElementById('product-detail-modal').classList.contains('hidden')).toBe(false);
    });

    test('should open product detail modal and display default details when missing', async () => {
      const product = {
        id: 2,
        name: 'No Details',
        category: 'Face',
        price: 20.0,
        image: 'no-detail.jpg',
        description: 'No details',
        details: ''
      };
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve(product) })
        .mockResolvedValueOnce({ json: () => Promise.resolve([]) });

      await app.openProductDetail(2);
      expect(document.getElementById('detail-details').textContent).toBe('No additional details available.');
    });

    test('should close the product detail modal', () => {
      document.getElementById('product-detail-modal').classList.remove('hidden');
      app.closeProductDetail();
      expect(document.getElementById('product-detail-modal').classList.contains('hidden')).toBe(true);
    });
  });

  describe('renderComments', () => {
    test('should show no comments message when list is empty and user not logged in', () => {
      app.setCurrentUser(null);
      app.renderComments([]);
      expect(document.querySelector('[data-cy="no-comments"]').textContent).toContain('No reviews yet');
      expect(document.getElementById('login-to-comment').classList.contains('hidden')).toBe(false);
    });

    test('should show comment form when logged in', () => {
      app.setCurrentUser({ id: 1, username: 'testuser' });
      app.renderComments([{ username: 'tester', rating: 5, comment: 'Nice', createdAt: new Date().toISOString() }]);
      expect(document.querySelector('[data-cy="comment-item"]').textContent).toContain('tester');
      expect(document.getElementById('add-comment').classList.contains('hidden')).toBe(false);
    });
  });

  describe('submitComment failure', () => {
    test('should alert when comment submission fails', async () => {
      fetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ error: 'Failed' }) });
      global.alert = jest.fn();

      await app.submitComment(1, 5, 'Nice');
      expect(global.alert).toHaveBeenCalledWith('Failed');
    });
  });

  describe('renderProducts and form event listeners', () => {
    test('should render product cards and include action buttons', () => {
      const products = [
        { id: 1, name: 'Product A', category: 'Skincare', price: 15.0, image: 'a.jpg', description: 'A', details: 'Details' }
      ];

      app.renderProducts(products);

      expect(document.querySelectorAll('[data-cy="product-card"]').length).toBe(1);
      expect(document.querySelector('[data-cy="view-details-btn"]').getAttribute('data-id')).toBe('1');
      expect(document.querySelector('[data-cy="add-to-cart-btn"]').getAttribute('data-id')).toBe('1');
    });

    test('should render comments when fetching comments', async () => {
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve([{ username: 'tester', rating: 5, comment: 'Nice', createdAt: new Date().toISOString() }]) });

      await app.fetchComments(1);
      expect(document.querySelector('[data-cy="comment-item"]').textContent).toContain('tester');
    });

    test('should refresh comments after successful submit', async () => {
      fetch.mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ json: () => Promise.resolve([{ username: 'tester', rating: 4, comment: 'Nice', createdAt: new Date().toISOString() }]) });

      await app.submitComment(1, 4, 'Nice');
      expect(document.querySelector('[data-cy="comment-item"]').textContent).toContain('tester');
    });

    test('should hide cart items with missing product details', () => {
      app.renderCart([{ productId: 1, quantity: 1, product: null }]);
      expect(document.querySelectorAll('[data-cy="cart-item"]').length).toBe(0);
    });

    test('should handle checkAuth network failures gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      await app.checkAuth();
      expect(document.querySelector('[data-cy="logout-link"]').classList.contains('hidden')).toBe(true);
    });

    test('should submit login form and show error on failure', async () => {
      fetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ error: 'Invalid credentials' }) });
      global.alert = jest.fn();

      const loginForm = document.getElementById('login-form');
      loginForm.querySelector('[name="username"]').value = 'user';
      loginForm.querySelector('[name="password"]').value = 'wrong';

      loginForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(global.alert).toHaveBeenCalledWith('Invalid credentials');
    });
    test('should show products section and fetch products', async () => {
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve([]) });

      app.showSection('products');
      expect(document.getElementById('products-section').classList.contains('hidden')).toBe(false);
      expect(fetch.mock.calls[0][0]).toContain('/api/products');
    });
  });
});