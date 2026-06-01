const { test, expect } = require('@playwright/test');

test.describe('Checkout suite', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.goto('http://localhost:3000');
    await page.evaluate(() => fetch('/api/cart', { method: 'DELETE' }));
  });

  test('TC060 - Valider formulaire vide', async ({ page }) => {
    await page.click('[data-cy="add-to-cart-btn"]');
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-cy="cart-count"]');
      return el && parseInt(el.textContent || '0') >= 1;
    }, null, { timeout: 10000 });
    await page.click('[data-link="cart"]');
    await page.click('[data-cy="checkout-btn"]');
    await page.click('[data-cy="place-order-btn"]');
    expect(await page.isVisible('[data-cy="success-message"]')).toBeFalsy();
  });

  test('TC062/63/64 - Soumettre commande and confirmation and cart emptied', async ({ page }) => {
    await page.click('[data-cy="add-to-cart-btn"]');
    await page.waitForTimeout(200);
    await page.click('[data-link="cart"]');
    await page.click('[data-cy="checkout-btn"]');
    await page.fill('[data-cy="input-name"]', 'Checkout Tester');
    await page.fill('[data-cy="input-email"]', 'checkout@example.com');
    await page.fill('[data-cy="input-address"]', '100 Test Blvd');
    await page.fill('[data-cy="input-phone"]', '000111222');
    await page.click('[data-cy="place-order-btn"]');
    await page.waitForSelector('[data-cy="success-message"]');
    expect(await page.isVisible('[data-cy="success-message"]')).toBeTruthy();
    // verify cart emptied
    await page.click('[data-link="cart"]');
    await page.waitForTimeout(200);
    expect(await page.isVisible('[data-cy="cart-empty"]')).toBeTruthy();
  });
});
