import onboardingPage from '../../pageobjects/melon/onboarding.page';
import welcomePage from '../../pageobjects/melon/welcome.page';
import loginPage from '../../pageobjects/melon/login.page';
import homePage from '../../pageobjects/melon/home.page';
import { log } from '../../utils/logger';

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
// No direct API calls yet — this spec drives the flow entirely through the
// UI. Once staging has stable, documented endpoints, request helpers (e.g.
// to seed a test account or verify the session server-side) belong here
// instead of being done through the app's UI.

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Melon login', () => {
  it('@smoke @regression logs in with a valid phone number and PIN', async () => {
    const phoneNumber = process.env.TEST_PHONE_NUMBER;
    const pin = process.env.TEST_PIN;

    if (!phoneNumber || !pin) {
      throw new Error('Set TEST_PHONE_NUMBER and TEST_PIN in .env to run this spec');
    }

    await onboardingPage.getStarted();

    await welcomePage.enterPhoneNumber(phoneNumber);
    await welcomePage.submit();

    await loginPage.enterPin(pin);
    await loginPage.submit();

    // Assert arrival on Home rather than the PIN field disappearing — the
    // latter raced the real navigation and reported false failures even
    // when login had actually succeeded.
    await homePage.waitUntilLoaded();
    log.info('Login succeeded');
  });
});
