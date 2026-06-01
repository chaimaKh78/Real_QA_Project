const { test, expect } = require('@playwright/test');

test.describe('Auth suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('TC030 - Inscription avec succès', async ({ page }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const username = `e2euser-${id}`;
    const email = `e2euser+${id}@example.com`;

    await page.click('[data-link="register"]');
    await page.fill('[data-cy="input-reg-username"]', username);
    await page.fill('[data-cy="input-reg-email"]', email);
    await page.fill('[data-cy="input-reg-password"]', 'password');
    await page.click('[data-cy="register-btn"]');
    await page.waitForSelector('[data-cy="logout-link"]', { state: 'visible', timeout: 10000 });
    expect(await page.isVisible('[data-cy="profile-link"]') || await page.isVisible('[data-cy="logout-link"]')).toBeTruthy();
  });

  test('TC040 - Login avec succès', async ({ page }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const username = `loginuser-${id}`;
    const email = `loginuser+${id}@example.com`;

    await page.evaluate(({ username, email }) => {
      return fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: 'password', fullName: 'Login User' })
      });
    }, { username, email });

    await page.click('[data-link="login"]');
    await page.fill('[data-cy="input-username"]', username);
    await page.fill('[data-cy="input-password"]', 'password');
    await page.click('[data-cy="login-btn"]');
    await page.waitForSelector('[data-cy="profile-link"]', { timeout: 10000 });
    expect(await page.isVisible('[data-cy="profile-link"]')).toBeTruthy();
  });
});
