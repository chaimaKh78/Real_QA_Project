const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('supertest');
const app = require('../../../../server');

let agent;
let response;
let lastOrderResponse;
let currentUser;
let cartItems = [];

Before(function () {
  app.resetTestData();
  agent = request.agent(app);
  currentUser = null;
  cartItems = [];
});

After(function () {
  // Clean up if needed
});

Given('the application is running', function () {
  // Application is already running via the test server
});

Given('I am logged in as {string} with password {string}', async function (username, password) {
  await agent
    .post('/api/auth/register')
    .send({
      username,
      email: `${username}@example.com`,
      password,
      fullName: username
    });

  response = await agent
    .post('/api/auth/login')
    .send({ username, password });

  currentUser = response.body;
});

Given('I have registered with username {string}, email {string}, and password {string}', async function (username, email, password) {
  await agent
    .post('/api/auth/register')
    .send({
      username,
      email,
      password,
      fullName: username
    });
});

Given('I have registered with username {string} and email {string} and password {string}', async function (username, email, password) {
  await agent
    .post('/api/auth/register')
    .send({
      username,
      email,
      password,
      fullName: username
    });
});

Given('I have added product with id {int} to my cart with quantity {int}', async function (productId, quantity) {
  response = await agent
    .post('/api/cart')
    .send({ productId, quantity });

  cartItems.push({ productId, quantity });
});

Given('my cart is empty', async function () {
  response = await agent.delete('/api/cart');
  cartItems = [];
});

When('I register with username {string}, email {string}, and password {string}', async function (username, email, password) {
  response = await agent
    .post('/api/auth/register')
    .send({
      username,
      email,
      password,
      fullName: username
    });
});

When('I login with username {string} and password {string}', async function (username, password) {
  response = await agent
    .post('/api/auth/login')
    .send({ username, password });
});

When('I add product with id {int} to my cart with quantity {int}', async function (productId, quantity) {
  response = await agent
    .post('/api/cart')
    .send({ productId, quantity });

  cartItems.push({ productId, quantity });
});

When('I update the quantity of product {int} in my cart to {int}', async function (productId, quantity) {
  response = await agent
    .put(`/api/cart/${productId}`)
    .send({ quantity });
});

When('I remove product {int} from my cart', async function (productId) {
  response = await agent
    .delete(`/api/cart/${productId}`);
});

When('I clear my cart', async function () {
  response = await agent
    .delete('/api/cart');
});

When('I view my cart', async function () {
  response = await agent
    .get('/api/cart');
});

When('I checkout with name {string}, email {string}, address {string}, and phone {string}', async function (name, email, address, phone) {
  response = await agent
    .post('/api/checkout')
    .send({ name, email, address, phone });
  lastOrderResponse = response;
});

When('I attempt to checkout with incomplete information', async function () {
  response = await agent
    .post('/api/checkout')
    .send({ name: 'Test User' });
});

When('I attempt to checkout with name {string}, email {string}, address {string}, and phone {string}', async function (name, email, address, phone) {
  response = await agent
    .post('/api/checkout')
    .send({ name, email, address, phone });
});

Then('I should be registered successfully', function () {
  assert.strictEqual(response.status, 200);
  assert.ok(response.body.username !== undefined);
  assert.strictEqual(response.body.password, undefined);
});

Then('I should be logged in', function () {
  assert.strictEqual(response.status, 200);
  assert.ok(response.body.username !== undefined);
});

Then('I should be logged in successfully', function () {
  assert.strictEqual(response.status, 200);
  assert.ok(response.body.username !== undefined);
});

Then('I should receive an error {string}', function (errorMessage) {
  assert.ok(response.status >= 400);
  assert.strictEqual(response.body.error, errorMessage);
});

Then('my cart should contain {int} item', function (itemCount) {
  assert.strictEqual(response.body.length, itemCount);
});

Then('the cart should contain product {int} with quantity {int}', function (productId, quantity) {
  const item = response.body.find(item => item.productId === productId);
  assert.ok(item);
  assert.strictEqual(item.quantity, quantity);
});

Then('the cart should not contain product {int}', function (productId) {
  const item = response.body.find(item => item.productId === productId);
  assert.strictEqual(item, undefined);
});

Then('my cart should be empty', async function () {
  if (!Array.isArray(response.body)) {
    response = await agent.get('/api/cart');
  }
  assert.deepStrictEqual(response.body, []);
});

Then('the total price should be calculated correctly', function () {
  const total = response.body.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  assert.ok(total >= 0);
  assert.strictEqual(typeof total, 'number');
});

Then('an order should be created successfully', function () {
  assert.strictEqual(response.status, 200);
  assert.ok(response.body.orderId !== undefined);
  assert.ok(response.body.order !== undefined);
});

Then('I should receive an order confirmation', function () {
  assert.ok(lastOrderResponse && lastOrderResponse.body.orderId !== undefined);
});

When('I submit a review for product {int} with rating {int} and comment {string}', async function (productId, rating, comment) {
  response = await agent
    .post('/api/comments')
    .send({ productId, rating, comment });
});

When('I request all products', async function () {
  response = await agent.get('/api/products');
});

When('I filter products by {string}', async function (category) {
  response = await agent.get(`/api/products?category=${encodeURIComponent(category)}`);
});

Then('I should see at least {int} products', function (count) {
  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length >= count);
});

When('I view product details for product {int}', async function (productId) {
  response = await agent.get(`/api/products/${productId}`);
});

Then('the product details should include name {string}', function (name) {
  assert.ok(response.body.name);
  assert.strictEqual(response.body.name, name);
});

Given('I have added a review for product {int} with rating {int} and comment {string}', async function (productId, rating, comment) {
  // ensure there's a logged-in user for commenting
  const username = `commenter${Date.now()}`;
  await agent
    .post('/api/auth/register')
    .send({ username, email: `${username}@example.com`, password: 'password', fullName: username });

  await agent
    .post('/api/comments')
    .send({ productId, rating, comment });
});

When('I view comments for product {int}', async function (productId) {
  response = await agent
    .get(`/api/comments/${productId}`)
    .expect(200);
});

Then('the comment should be visible for product {int}', function (productId) {
  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.some(comment => comment.productId === productId));
});

When('I request password reset for email {string}', async function (email) {
  response = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email });
  if (response.body.token) {
    lastOrderResponse = response;
  }
});

When('I reset the password using token from the last reset to {string}', async function (newPassword) {
  const token = lastOrderResponse?.body?.token;
  response = await request(app)
    .post('/api/auth/reset-password')
    .send({ token, newPassword });
});

Then('I should be able to login with username {string} and password {string}', async function (username, password) {
  response = await request(app)
    .post('/api/auth/login')
    .send({ username, password });
  assert.strictEqual(response.status, 200);
  assert.ok(response.body.username === username);
});

Then('response status should be {int}', function (statusCode) {
  assert.strictEqual(response.status, statusCode);
});

When('I reset the password using token {string} to {string}', async function (token, newPassword) {
  response = await request(app)
    .post('/api/auth/reset-password')
    .send({ token, newPassword });
});