export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    await this.page.goto(`/${path}`);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('load');
  }

  async getText(selector) {
    return await this.page.textContent(selector);
  }

  async click(selector) {
    await this.page.click(selector);
  }

  async type(selector, text) {
    await this.page.fill(selector, text);
  }

  async isVisible(selector) {
    return await this.page.isVisible(selector);
  }

  async waitForSelector(selector) {
    await this.page.waitForSelector(selector);
  }
}