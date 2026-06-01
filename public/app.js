const API_URL = 'http://localhost:3000/api';

let currentSection = 'products';
let currentCategory = 'all';
let currentUser = null;
let currentProductId = null;

async function fetchProducts(category = 'all') {
  const url = category === 'all' 
    ? `${API_URL}/products` 
    : `${API_URL}/products?category=${category}`;
  const response = await fetch(url);
  const products = await response.json();
  renderProducts(products);
}

async function fetchCart() {
  const response = await fetch(`${API_URL}/cart`);
  const cart = await response.json();
  renderCart(cart);
  updateCartCount();
}

function renderProducts(products) {
  if (!Array.isArray(products)) products = [];
  const grid = document.getElementById('products-grid');
  grid.innerHTML = products.map(product => `
    <div class="product-card" data-cy="product-card">
      <img src="${product.image}" alt="${product.name}" class="product-image" data-cy="product-image">
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name" data-cy="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price" data-cy="product-price">$${product.price.toFixed(2)}</div>
        <button class="view-details-btn" data-cy="view-details-btn" data-id="${product.id}">View Details</button>
        <button class="add-to-cart-btn" data-cy="add-to-cart-btn" data-id="${product.id}">Add to Bag</button>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', () => openProductDetail(parseInt(btn.dataset.id)));
  });
  
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
  });
}

function renderCart(cart) {
  const cartItems = document.getElementById('cart-items');
  const cartEmpty = document.getElementById('cart-empty');
  const cartSummary = document.getElementById('cart-summary');
  
  if (cart.length === 0) {
    cartItems.innerHTML = '';
    cartEmpty.classList.remove('hidden');
    cartSummary.classList.add('hidden');
    return;
  }
  
  cartEmpty.classList.add('hidden');
  cartSummary.classList.remove('hidden');
  
  let total = 0;
  cartItems.innerHTML = cart.map(item => {
    if (!item.product) return '';
    const itemTotal = item.product.price * item.quantity;
    total += itemTotal;
    return `
      <div class="cart-item" data-cy="cart-item">
        <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.product.name}</h3>
          <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
          <div class="quantity-controls">
            <button class="quantity-btn" data-cy="decrease-btn" data-id="${item.productId}">-</button>
            <span class="cart-item-quantity" data-cy="cart-item-quantity">${item.quantity}</span>
            <button class="quantity-btn" data-cy="increase-btn" data-id="${item.productId}">+</button>
          </div>
        </div>
        <button class="remove-btn" data-cy="remove-btn" data-id="${item.productId}">Remove</button>
      </div>
    `;
  }).join('');
  
  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id), btn.textContent === '+' ? 1 : -1));
  });
  
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
  });
  
  document.querySelector('[data-cy="total-amount"]').textContent = `$${total.toFixed(2)}`;
  document.querySelector('[data-cy="checkout-total"]').textContent = `$${total.toFixed(2)}`;
}

function updateCartCount() {
  return fetch(`${API_URL}/cart`)
    .then(res => res.json())
    .then(cart => {
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      document.querySelector('[data-cy="cart-count"]').textContent = count;
    });
}

function setCurrentUser(user) {
  currentUser = user;
}

async function addToCart(productId) {
  await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity: 1 })
  });
  updateCartCount();
  alert('Added to bag!');
}

async function updateQuantity(productId, change) {
  const response = await fetch(`${API_URL}/cart`);
  const cart = await response.json();
  const item = cart.find(i => i.productId === productId);
  if (item) {
    const newQty = item.quantity + change;
    if (newQty <= 0) {
      await removeFromCart(productId);
    } else {
      await fetch(`${API_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      fetchCart();
    }
  }
}

async function removeFromCart(productId) {
  await fetch(`${API_URL}/cart/${productId}`, { method: 'DELETE' });
  fetchCart();
}

async function openProductDetail(productId) {
  currentProductId = productId;
  const response = await fetch(`${API_URL}/products/${productId}`);
  const product = await response.json();
  
  document.getElementById('detail-image').src = product.image;
  document.getElementById('detail-category').textContent = product.category;
  document.getElementById('detail-name').textContent = product.name;
  document.getElementById('detail-description').textContent = product.description;
  document.getElementById('detail-details').textContent = product.details || 'No additional details available.';
  document.getElementById('detail-price').textContent = `$${product.price.toFixed(2)}`;
  
  document.getElementById('detail-add-cart').onclick = () => {
    addToCart(productId);
  };
  
  await fetchComments(productId);
  
  const modal = document.getElementById('product-detail-modal');
  modal.classList.remove('hidden');
  
  document.querySelector('.modal-close').onclick = closeProductDetail;
  modal.onclick = (e) => {
    if (e.target === modal) closeProductDetail();
  };
}

function closeProductDetail() {
  document.getElementById('product-detail-modal').classList.add('hidden');
}

async function fetchComments(productId) {
  const response = await fetch(`${API_URL}/comments/${productId}`);
  const comments = await response.json();
  renderComments(comments);
}

function renderComments(comments) {
  const list = document.getElementById('comments-list');
  const addComment = document.getElementById('add-comment');
  const loginToComment = document.getElementById('login-to-comment');
  
  if (comments.length === 0) {
    list.innerHTML = '<p data-cy="no-comments">No reviews yet. Be the first to write a review!</p>';
  } else {
    list.innerHTML = comments.map(c => `
      <div class="comment-item" data-cy="comment-item">
        <div class="comment-header">
          <span class="comment-user">${c.username}</span>
          <span class="comment-rating">${'★'.repeat(c.rating)}${'☆'.repeat(5-c.rating)}</span>
        </div>
        <p class="comment-text">${c.comment}</p>
        <p class="comment-date">${new Date(c.createdAt).toLocaleDateString()}</p>
      </div>
    `).join('');
  }
  
  if (currentUser) {
    addComment.classList.remove('hidden');
    loginToComment.classList.add('hidden');
  } else {
    addComment.classList.add('hidden');
    loginToComment.classList.remove('hidden');
  }
}

async function submitComment(productId, rating, comment) {
  const response = await fetch(`${API_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, rating, comment })
  });
  
  if (response.ok) {
    await fetchComments(productId);
  } else {
    const error = await response.json();
    alert(error.error);
  }
}

async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/auth/me`);
    if (response.ok) {
      currentUser = await response.json();
      updateAuthUI(true);
    } else {
      updateAuthUI(false);
    }
  } catch {
    updateAuthUI(false);
  }
}

function updateAuthUI(isLoggedIn) {
  const loginLink = document.querySelector('[data-cy="login-link"]');
  const registerLink = document.querySelector('[data-cy="register-link"]');
  const profileLink = document.querySelector('[data-cy="profile-link"]');
  const logoutLink = document.querySelector('[data-cy="logout-link"]');
  const separator = document.querySelector('[data-cy="auth-separator"]');
  
  if (isLoggedIn) {
    loginLink.classList.add('hidden');
    registerLink.classList.add('hidden');
    separator.classList.add('hidden');
    profileLink.classList.remove('hidden');
    logoutLink.classList.remove('hidden');
  } else {
    loginLink.classList.remove('hidden');
    registerLink.classList.remove('hidden');
    separator.classList.remove('hidden');
    profileLink.classList.add('hidden');
    logoutLink.classList.add('hidden');
  }
}

async function login(username, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (response.ok) {
    currentUser = await response.json();
    updateAuthUI(true);
    return { success: true };
  } else {
    const error = await response.json();
    return { success: false, error: error.error };
  }
}

async function register(username, email, password, fullName) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, fullName })
  });
  
  if (response.ok) {
    currentUser = await response.json();
    updateAuthUI(true);
    return { success: true };
  } else {
    const error = await response.json();
    return { success: false, error: error.error };
  }
}

async function logout() {
  await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
  currentUser = null;
  updateAuthUI(false);
  showSection('products');
}

function updateProfileUI() {
  if (currentUser) {
    document.querySelector('[data-cy="profile-username"]').textContent = currentUser.username;
    document.querySelector('[data-cy="profile-email"]').textContent = currentUser.email;
    document.querySelector('[data-cy="profile-fullname"]').textContent = currentUser.fullName || currentUser.username;
    document.querySelector('[data-cy="profile-created"]').textContent = new Date().toLocaleDateString();
  }
}

function showSection(sectionId) {
  document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('section[id$="-section"]').forEach(s => s.classList.add('hidden'));
  document.getElementById(`${sectionId}-section`)?.classList.remove('hidden');
  
  document.querySelectorAll('[data-link]').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.link === sectionId) link.classList.add('active');
  });
  
  currentSection = sectionId;
  
  if (sectionId === 'products') fetchProducts(currentCategory);
  if (sectionId === 'cart') fetchCart();
  if (sectionId === 'profile') updateProfileUI();
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    fetchProducts(currentCategory);
  });
});

document.querySelector('[data-link="home"]').addEventListener('click', e => {
  e.preventDefault();
  showSection('products');
});

document.querySelector('[data-link="cart"]').addEventListener('click', e => {
  e.preventDefault();
  showSection('cart');
});

document.querySelector('[data-link="login"]').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('login-form-container').classList.remove('hidden');
  document.getElementById('register-form-container').classList.add('hidden');
  showSection('auth');
});

document.querySelector('[data-link="register"]').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('login-form-container').classList.add('hidden');
  document.getElementById('register-form-container').classList.remove('hidden');
  showSection('auth');
});

document.querySelector('[data-link="profile"]').addEventListener('click', e => {
  e.preventDefault();
  showSection('profile');
});

document.querySelector('[data-link="logout"]').addEventListener('click', e => {
  e.preventDefault();
  logout();
});

document.querySelector('[data-cy="switch-to-register"]').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('login-form-container').classList.add('hidden');
  document.getElementById('register-form-container').classList.remove('hidden');
});

document.querySelector('[data-cy="switch-to-login"]').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('login-form-container').classList.remove('hidden');
  document.getElementById('register-form-container').classList.add('hidden');
});

document.querySelector('[data-cy="switch-to-forgot"]').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('login-form-container').classList.add('hidden');
  document.getElementById('forgot-form-container').classList.remove('hidden');
});

document.querySelector('[data-cy="switch-to-login-forgot"]').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('forgot-form-container').classList.add('hidden');
  document.getElementById('login-form-container').classList.remove('hidden');
});

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const username = form.querySelector('[name="username"]').value;
  const password = form.querySelector('[name="password"]').value;
  const result = await login(username, password);
  if (!result.success) {
    alert(result.error);
  }
});

document.getElementById('register-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const username = form.querySelector('[name="username"]').value;
  const email = form.querySelector('[name="email"]').value;
  const password = form.querySelector('[name="password"]').value;
  const fullName = form.querySelector('[name="fullName"]').value;
  const result = await register(username, email, password, fullName);
  if (!result.success) {
    alert(result.error);
  }
});

document.getElementById('forgot-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('[name="email"]').value;
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const result = await response.json();
  if (response.ok) {
    alert(result.message + ' Check console for reset link (development mode)');
    document.getElementById('forgot-form-container').classList.add('hidden');
    document.getElementById('login-form-container').classList.remove('hidden');
  } else {
    alert(result.error);
  }
});

document.getElementById('comment-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  await submitComment(currentProductId, parseInt(form.querySelector('[name="rating"]').value), form.querySelector('[name="comment"]').value);
  form.reset();
});

document.addEventListener('click', e => {
  if (e.target.dataset.cy === 'checkout-btn') {
    showSection('checkout');
  }
  
  if (e.target.dataset.cy === 'continue-shopping-btn') {
    showSection('products');
  }
  
  if (e.target.dataset.cy === 'login-to-comment-link') {
    e.preventDefault();
    closeProductDetail();
    document.getElementById('login-form-container').classList.remove('hidden');
    document.getElementById('register-form-container').classList.add('hidden');
    showSection('auth');
  }
});

document.getElementById('checkout-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.querySelector('[name="name"]').value,
    email: form.querySelector('[name="email"]').value,
    phone: form.querySelector('[name="phone"]').value,
    address: form.querySelector('[name="address"]').value
  };
  
  const response = await fetch(`${API_URL}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (result.orderId) {
    document.querySelector('[data-cy="order-number"] span').textContent = result.orderId;
    showSection('success');
    updateCartCount();
  } else {
    alert(result.error || 'Error placing order');
  }
});

if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  fetchProducts();
  updateCartCount();
  checkAuth();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchProducts,
    fetchCart,
    renderProducts,
    renderCart,
    updateCartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    openProductDetail,
    closeProductDetail,
    fetchComments,
    renderComments,
    submitComment,
    checkAuth,
    updateAuthUI,
    login,
    register,
    logout,
    updateProfileUI,
    showSection,
    setCurrentUser
  };
}