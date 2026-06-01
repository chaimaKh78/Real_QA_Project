const { test, expect } = require('@playwright/test');

test.describe('Cart suite', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.goto('http://localhost:3000');
    // ensure cart is empty at start
    await page.evaluate(() => fetch('/api/cart', { method: 'DELETE' }));
  });

  test('TC010 - View cart vide', async ({ page }) => {
    await page.click('[data-link="cart"]');
    await page.waitForSelector('[data-cy="cart-empty"]');
    expect(await page.isVisible('[data-cy="cart-empty"]')).toBeTruthy();
  });

  test('TC011 - Ajouter produit au cart', async ({ page }) => {
    await page.click('[data-cy="add-to-cart-btn"]');
    await page.waitForTimeout(200);
    await page.click('[data-link="cart"]');
    await page.waitForSelector('[data-cy="cart-item"]');
    expect(await page.isVisible('[data-cy="cart-item"]')).toBeTruthy();
  });

  test('TC012/13 - Augmenter puis diminuer quantité', async ({ page }) => {
    await page.click('[data-cy="add-to-cart-btn"]');
    await page.waitForTimeout(200);
    await page.click('[data-link="cart"]');
    await page.waitForSelector('[data-cy="cart-item"]');
    const inc = page.locator('[data-cy="increase-btn"]');
    const dec = page.locator('[data-cy="decrease-btn"]');
    await inc.click();
    await page.waitForTimeout(200);
    let qty = await page.textContent('[data-cy="cart-item-quantity"]');
    expect(parseInt(qty)).toBeGreaterThanOrEqual(2);
    await dec.click();
    await page.waitForTimeout(200);
    qty = await page.textContent('[data-cy="cart-item-quantity"]');
    expect(parseInt(qty)).toBeGreaterThanOrEqual(1);
  });

  test('TC014 - Supprimer article', async ({ page }) => {
    await page.click('[data-cy="add-to-cart-btn"]');
    await page.waitForTimeout(200);
    await page.click('[data-link="cart"]');
    await page.waitForSelector('[data-cy="cart-item"]');
    await page.click('[data-cy="remove-btn"]');
    await page.waitForTimeout(200);
    expect(await page.isVisible('[data-cy="cart-empty"]') || (await page.locator('[data-cy="cart-item"]').count()) === 0).toBeTruthy();
  });

  test('TC015 - Total correct', async ({ page }) => {
    // add product then check total
    await page.click('[data-cy="add-to-cart-btn"]');
    await page.waitForTimeout(200);
    await page.click('[data-link="cart"]');
    await page.waitForSelector('[data-cy="cart-item"]');
    const priceText = await page.textContent('[data-cy="cart-item"] .cart-item-price');
    const price = parseFloat(priceText.replace('$', ''));
    const qty = parseInt(await page.textContent('[data-cy="cart-item-quantity"]'));
    const totalText = await page.textContent('[data-cy="total-amount"]');
    const total = parseFloat(totalText.replace('$', ''));
    expect(total).toBeCloseTo(price * qty, 2);
  });

  test('TC016 - Checkout', async ({ page }) => {
    await page.click('[data-cy="add-to-cart-btn"]');
    await page.waitForTimeout(200);
    await page.click('[data-link="cart"]');
    await page.click('[data-cy="checkout-btn"]');
    await page.fill('[data-cy="input-name"]', 'Playwright Tester');
    await page.fill('[data-cy="input-email"]', 'pw@example.com');
    await page.fill('[data-cy="input-address"]', '1 Test Ave');
    await page.fill('[data-cy="input-phone"]', '123456789');
    await page.click('[data-cy="place-order-btn"]');
    await page.waitForSelector('[data-cy="success-message"]');
    expect(await page.isVisible('[data-cy="success-message"]')).toBeTruthy();
  });
});
