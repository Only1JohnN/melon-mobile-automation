import { step } from '../../utils/logger';

class ProfilePage {
  get profileTab() {
    return $('~Profile');
  }

  get shareCoinsButton() {
    return $('~Share Coins');
  }

  get helpCenterLink() {
    return $('~Help Center');
  }

  get privacyPolicyLink() {
    return $('~Privacy Policy');
  }

  get termsAndConditionsLink() {
    return $('~Terms and conditions');
  }

  get logoutButton() {
    return $('~Logout');
  }

  // Shown as "1,396,550 coins" — no resource-id, so we match on the "coins"
  // suffix and parse the number back out in getCoinsBalance().
  get coinsBalanceText() {
    return $('//android.widget.TextView[contains(@text, "coins")]');
  }

  // The display name has no resource-id or label either, but it's always
  // the text right above "Melon ID: ", so we find it relative to that
  // instead of guessing at the name itself — this has to work for whatever
  // name the account actually has, not a value we hardcode in the test.
  get nameText() {
    return $('//android.widget.TextView[@text="Melon ID: "]/preceding-sibling::android.widget.TextView[1]');
  }

  async open() {
    step('Opening Profile');
    await this.profileTab.click();
  }

  async getCoinsBalance(): Promise<number> {
    const text = await this.coinsBalanceText.getText();
    return Number(text.replace(/[^0-9]/g, ''));
  }

  async getName(): Promise<string> {
    return this.nameText.getText();
  }

  // Help Center, Privacy Policy, Terms, and Logout all live further down
  // the page than the initial view — scroll the content area down once to
  // bring them into view before interacting with any of them.
  async scrollToMoreSection() {
    step('Scrolling to the More section');
    await driver.execute('mobile: scrollGesture', {
      left: 50,
      top: 500,
      width: 980,
      height: 1600,
      direction: 'down',
      percent: 0.8,
    });
  }
}

export default new ProfilePage();
