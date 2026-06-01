const { test, expect } = require('@playwright/test');

test.describe('Comments suite', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.goto('http://localhost:3000');
    // ensure comments for product 1 exist via API
    await page.evaluate(() => fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: 1, rating: 5, comment: 'Automated test', username: 'ci' }) }));
  });

  test('TC020 - Voir commentaires', async ({ page }) => {
    await page.click('[data-cy="view-details-btn"]');
    await page.waitForSelector('[data-cy="comments-list"]');
    expect(await page.isVisible('[data-cy="comments-list"]')).toBeTruthy();
  });

  test('TC021 - Login requis pour commenter', async ({ page }) => {
    await page.click('[data-cy="view-details-btn"]');
    await page.waitForSelector('[data-cy="login-to-comment"]');
    expect(await page.isVisible('[data-cy="login-to-comment"]')).toBeTruthy();
  });

  test('TC022/23 - Ajouter et afficher commentaire', async ({ page }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const username = `pwcomment-${id}`;
    const email = `pwcomment+${id}@example.com`;

    await page.click('[data-link="register"]');
    await page.fill('[data-cy="input-reg-username"]', username);
    await page.fill('[data-cy="input-reg-email"]', email);
    await page.fill('[data-cy="input-reg-password"]', 'password');
    await page.click('[data-cy="register-btn"]');
    await page.waitForSelector('[data-cy="logout-link"]', { state: 'visible', timeout: 10000 });
    await page.click('[data-link="home"]');
    await page.click('[data-cy="view-details-btn"]');
    await page.waitForSelector('[data-cy="comments-list"]');
    const debugState = await page.evaluate(() => {
      return {
        currentUser: typeof window.currentUser !== 'undefined' && window.currentUser !== null,
        addCommentHidden: document.querySelector('#add-comment')?.classList.contains('hidden'),
        loginToCommentHidden: document.querySelector('#login-to-comment')?.classList.contains('hidden'),
        logoutLinkVisible: !!document.querySelector('[data-cy="logout-link"]') && !document.querySelector('[data-cy="logout-link"]').classList.contains('hidden')
      };
    });
    console.log('COMMENT DEBUG', JSON.stringify(debugState));
    await page.waitForSelector('[data-cy="input-comment"]', { state: 'visible', timeout: 10000 });
    await page.fill('[data-cy="input-comment"]', 'Playwright says hi');
    await page.selectOption('[data-cy="input-rating"]', '4');
    await page.click('[data-cy="submit-comment-btn"]');
    await page.waitForSelector('[data-cy="comment-item"]', { timeout: 10000 });
    const comments = await page.locator('[data-cy="comment-item"]').count();
    expect(comments).toBeGreaterThan(0);
  });
});
