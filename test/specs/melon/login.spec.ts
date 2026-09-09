import onboardingPage from '../../pageobjects/melon/onboarding.page';
import welcomePage from '../../pageobjects/melon/welcome.page';
import loginPage from '../../pageobjects/melon/login.page';

describe('Melon login', () => {
  it('logs in with a valid phone number and PIN', async () => {
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

    // Without location permission granted (appium:autoGrantPermissions in
    // wdio.conf.ts), the backend rejects login with "Validation Check Failed"
    // regardless of correct credentials.
    await loginPage.pinInput.waitForDisplayed({ reverse: true, timeout: 15000 });
  });
});
