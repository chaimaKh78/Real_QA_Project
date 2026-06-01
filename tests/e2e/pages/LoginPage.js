import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.loginUsernameInput = '[data-cy="input-username"]';
    this.loginPasswordInput = '[data-cy="input-password"]';
    this.loginButton = '[data-cy="login-btn"]';

    this.registerUsernameInput = '[data-cy="input-reg-username"]';
    this.registerEmailInput = '[data-cy="input-reg-email"]';
    this.registerPasswordInput = '[data-cy="input-reg-password"]';
    this.registerFullNameInput = '[data-cy="input-reg-fullname"]';
    this.registerButton = '[data-cy="register-btn"]';
  }

  async login(username, password) {
    await this.page.fill(this.loginUsernameInput, username);
    await this.page.fill(this.loginPasswordInput, password);
    await this.page.click(this.loginButton);
  }

  async register(username, email, password, fullName) {
    await this.page.fill(this.registerUsernameInput, username);
    await this.page.fill(this.registerEmailInput, email);
    await this.page.fill(this.registerPasswordInput, password);
    await this.page.fill(this.registerFullNameInput, fullName);
    await this.page.click(this.registerButton);
    await this.page.waitForSelector('[data-cy="logout-link"]', { state: 'visible', timeout: 10000 });
  }
}