// Cart utilities
function getCart(session) {
  if (!session.cart) session.cart = [];
  return session.cart;
}

function addToCart(session, productId, quantity = 1, products) {
  const cart = getCart(session);
  const product = products.find(p => p.id === productId);

  if (!product) {
    throw new Error('Product not found');
  }

  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  return cart;
}

function updateCartItem(session, productId, quantity) {
  const cart = getCart(session);
  const item = cart.find(i => i.productId === productId);

  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    removeFromCart(session, productId);
    return cart;
  }

  item.quantity = quantity;
  return cart;
}

function removeFromCart(session, productId) {
  const cart = getCart(session);
  const index = cart.findIndex(i => i.productId === productId);

  if (index > -1) {
    cart.splice(index, 1);
  }

  return cart;
}

function clearCart(session) {
  session.cart = [];
  return [];
}

function calculateTotal(cart, products) {
  return cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function getCartWithProducts(cart, products) {
  return cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)
  }));
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  calculateTotal,
  getCartWithProducts
};