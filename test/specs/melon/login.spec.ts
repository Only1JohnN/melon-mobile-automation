import onboardingPage from '../../pageobjects/melon/onboarding.page';
import welcomePage from '../../pageobjects/melon/welcome.page';
import loginPage from '../../pageobjects/melon/login.page';
import homePage from '../../pageobjects/melon/home.page';
import { log } from '../../utils/logger';

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
// Nothing here yet — this spec only drives the UI. Once we have a documented
// staging API, this is where request helpers go (e.g. seeding a test account).

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

    // We check for Home rather than "the PIN field is gone" — that check
    // used to race the app's navigation and report failures on logins that
    // actually succeeded.
    await homePage.waitUntilLoaded();
    log.info('Login succeeded');
  });
});
