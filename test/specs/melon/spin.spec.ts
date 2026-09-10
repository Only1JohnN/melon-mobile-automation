import spinPage from '../../pageobjects/melon/spin.page';
import homePage from '../../pageobjects/melon/home.page';
import { login, logout } from '../../utils/auth';
import { log } from '../../utils/logger';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
// The wheel itself renders in an external Chrome Custom Tab (confirmed live:
// tapping "Spin Now" here hands off to a real browser tab pointed at
// customer.getmelon.co, not an in-app screen). Appium's session is attached
// to the Melon app, not that tab, so verifying the actual spin — win amount,
// balance increase, and the free-spin gate clearing for the day — needs
// either a second automation target for Chrome or the page's own DOM
// structure, neither of which could be confirmed this session. What's
// covered here is the native side: the gate showing up and handing off
// correctly.
describe('Melon spin the wheel', () => {
  it('@regression opens the Daily Melon Wheel from the Home free-spin gate', async function () {
    this.timeout(120000);

    const phone = process.env.TEST_PHONE_NUMBER!;
    const pin = process.env.TEST_PIN!;

    await login(phone, pin);
    await homePage.dismissStrayModalIfPresent();

    // The gate only shows once per day per account — if today's free spin
    // is already used, there's nothing to navigate from, so skip rather
    // than fail on state this test doesn't control.
    const gateShown = await spinPage.freeSpinGateHeading.isDisplayed().catch(() => false);
    if (!gateShown) {
      log.info('Free spin already used today — skipping');
      this.skip();
    }

    await spinPage.openFromHomeGate();
    log.info('Reached the Daily Melon Wheel screen');

    // This info screen has no bottom nav, so back out to Home before
    // logging out through the Profile tab.
    await driver.back();
    await homePage.homeTab.waitForDisplayed({ timeout: 15000 });
    await logout();
  });
});
