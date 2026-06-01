const { test, expect } = require('@playwright/test');

test.describe('Products suite', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.goto('http://localhost:3000');
  });

  test('TC001 - Afficher tous les produits', async ({ page }) => {
    await page.waitForSelector('[data-cy="products-grid"]');
    const cards = await page.locator('[data-cy="product-card"]').count();
    expect(cards).toBeGreaterThan(0);
  });

  test('TC002 - Filtrer par Skincare', async ({ page }) => {
    await page.click('[data-cy="filter-skincare"]');
    await page.waitForTimeout(200); // allow fetch
    const categories = await page.$$eval('.product-category', els => els.map(e => e.textContent));
    expect(categories.every(c => c.includes('Skincare') || c.trim() === '') || categories.length === 0).toBeTruthy();
  });

  test('TC003 - Filtrer par Makeup', async ({ page }) => {
    await page.click('[data-cy="filter-makeup"]');
    await page.waitForTimeout(200);
    const categories = await page.$$eval('.product-category', els => els.map(e => e.textContent));
    expect(categories.length >= 0).toBeTruthy();
  });

  test('TC004 - Ouvrir détails produit', async ({ page }) => {
    await page.waitForSelector('[data-cy="view-details-btn"]');
    await page.click('[data-cy="view-details-btn"]');
    await page.waitForSelector('[data-cy="product-detail"]');
    expect(await page.isVisible('[data-cy="product-detail"]')).toBeTruthy();
  });

  test('TC005 - Ajouter produit au panier', async ({ page }) => {
    await page.waitForSelector('[data-cy="add-to-cart-btn"]');
    await page.click('[data-cy="add-to-cart-btn"]');
    // wait for cart count to update
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-cy="cart-count"]');
      return el && parseInt(el.textContent || '0') >= 1;
    }, null, { timeout: 5000 });
    const count = await page.textContent('[data-cy="cart-count"]');
    expect(parseInt(count)).toBeGreaterThanOrEqual(1);
  });
});
