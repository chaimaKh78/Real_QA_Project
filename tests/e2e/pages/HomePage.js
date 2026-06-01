import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.productCard = '[data-cy="product-card"]';
    this.viewDetailsBtn = '[data-cy="view-details-btn"]';
    this.addToCartBtn = '[data-cy="add-to-cart-btn"]';
    this.cartCount = '[data-cy="cart-count"]';
    this.loginLink = '[data-link="login"]';
    this.registerLink = '[data-link="register"]';
  }

  async open() {
    await this.navigate();
    await this.waitForLoad();
    await this.page.waitForSelector('[data-cy="products-grid"]', { state: 'visible' });
  }

  async addFirstProductToCart() {
    await this.page.click(this.addToCartBtn);
  }

  async goToLogin() {
    await this.click(this.loginLink);
    await this.page.waitForSelector('[data-cy="login-form"]', { state: 'visible' });
  }

  async goToRegister() {
    await this.click(this.registerLink);
    await this.page.waitForSelector('[data-cy="register-form"]', { state: 'visible' });
  }
}