import welcomePage from '../../pageobjects/melon/welcome.page';
import profilePage from '../../pageobjects/melon/profile.page';
import staticContentPage from '../../pageobjects/melon/staticContent.page';
import { login } from '../../utils/auth';
import { log } from '../../utils/logger';

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
// Nothing here yet — this spec only drives the UI.

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
async function loginAsPrimaryUser() {
  const phoneNumber = process.env.TEST_PHONE_NUMBER;
  const pin = process.env.TEST_PIN;

  if (!phoneNumber || !pin) {
    throw new Error('Set TEST_PHONE_NUMBER and TEST_PIN in .env to run this spec');
  }

  await login(phoneNumber, pin);
}

describe('Melon profile', () => {
  it('@regression shows Help Center content', async () => {
    await loginAsPrimaryUser();
    await profilePage.open();
    await profilePage.scrollToMoreSection();

    await profilePage.helpCenterLink.click();

    await staticContentPage.heading('Help Center').waitForDisplayed();
    log.info('Help Center content is showing');
  });

  it('@regression shows Privacy Policy content', async () => {
    await loginAsPrimaryUser();
    await profilePage.open();
    await profilePage.scrollToMoreSection();

    await profilePage.privacyPolicyLink.click();

    await staticContentPage.heading('Privacy Policy').waitForDisplayed();
    log.info('Privacy Policy content is showing');
  });

  it('@regression shows Terms and Conditions content', async () => {
    await loginAsPrimaryUser();
    await profilePage.open();
    await profilePage.scrollToMoreSection();

    await profilePage.termsAndConditionsLink.click();

    await staticContentPage.heading('Terms and conditions').waitForDisplayed();
    log.info('Terms and Conditions content is showing');
  });

  it('@smoke @regression logs out', async () => {
    await loginAsPrimaryUser();
    await profilePage.open();
    await profilePage.scrollToMoreSection();

    await profilePage.logoutButton.click();

    // Logging out drops us back on the phone-number entry screen.
    await welcomePage.phoneNumberInput.waitForDisplayed();
    log.info('Logged out successfully');
  });
});
