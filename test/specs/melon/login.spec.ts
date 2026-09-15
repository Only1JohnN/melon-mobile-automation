import welcomePage from '../../pageobjects/melon/welcome.page';
import loginPage from '../../pageobjects/melon/login.page';
import homePage from '../../pageobjects/melon/home.page';
import { login, logout } from '../../utils/auth';
import { log } from '../../utils/logger';

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
// Nothing here yet — this spec only drives the UI. Once we have a documented
// staging API, this is where request helpers go (e.g. seeding a test account).

// The app doesn't actually reset between spec-file runs — autoLaunch is off
// (see wdio.conf.ts, needed to fix the GPS location before the app's first
// launch) and we bring it to the foreground ourselves, so it just resumes
// wherever it was left: onboarding, already signed in, or already on this
// same screen. Cover all three rather than assuming onboarding is showing.
async function ensureAtPhoneEntryScreen() {
  const alreadyThere = await welcomePage.phoneNumberInput.isDisplayed().catch(() => false);
  if (alreadyThere) {
    return;
  }

  const alreadySignedIn = await homePage.homeTab.isDisplayed().catch(() => false);
  if (alreadySignedIn) {
    await logout();
    return;
  }

  // Neither screen is up, so this is either onboarding or the app is still
  // loading into one of those states — login() already handles the
  // onboarding-or-not check internally.
  const phoneNumber = process.env.TEST_PHONE_NUMBER;
  const pin = process.env.TEST_PIN;
  if (!phoneNumber || !pin) {
    throw new Error('Set TEST_PHONE_NUMBER and TEST_PIN in .env to run this spec');
  }

  await login(phoneNumber, pin);
  await logout();
}

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

    await ensureAtPhoneEntryScreen();
    await login(phoneNumber, pin);
    log.info('Login succeeded');

    // Leave the app signed out again so whichever test runs next — in this
    // file or another — starts from the same known screen.
    await logout();
  });

  it('@regression rejects a phone number that is not 11 digits', async () => {
    await ensureAtPhoneEntryScreen();

    await welcomePage.enterPhoneNumber('123');
    await welcomePage.submit();

    await welcomePage.phoneNumberError.waitForDisplayed();
  });

  it('@regression rejects a wrong PIN', async () => {
    const phoneNumber = process.env.TEST_PHONE_NUMBER;

    if (!phoneNumber) {
      throw new Error('Set TEST_PHONE_NUMBER in .env to run this spec');
    }

    await ensureAtPhoneEntryScreen();

    await welcomePage.enterPhoneNumber(phoneNumber);
    await welcomePage.submit();

    await loginPage.enterPin('9999');
    await loginPage.submit();

    // The error banner auto-hides after a few seconds, so this has to catch
    // it while it's up rather than waiting for some stable end state.
    await loginPage.incorrectCredentialsError.waitForDisplayed({ timeout: 15000 });
  });
});
