import onboardingPage from '../../pageobjects/melon/onboarding.page';
import welcomePage from '../../pageobjects/melon/welcome.page';
import signUpPage from '../../pageobjects/melon/signUp.page';
import otpPage from '../../pageobjects/melon/otp.page';
import { log } from '../../utils/logger';

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
// Nothing here yet — this spec only drives the UI.

// Staging sends a real SMS for OTP verification, with no bypass — confirmed
// with the team, not guessed. That means the true happy path (finishing
// sign-up with the real code) can't be automated here: nothing in this test
// run can read that SMS. What's covered instead is everything that doesn't
// need the real code: reaching the OTP screen at all, and a wrong code being
// rejected there.
//
// A fresh, never-seen-before phone number is required every run — the same
// number would already have an account on a second run and route to login
// instead of sign-up.
function newUnregisteredPhoneNumber(): string {
  return `0809${Date.now().toString().slice(-7)}`;
}

describe('Melon sign up', () => {
  it('@regression creates an account and rejects the wrong OTP', async function () {
    this.timeout(180000);

    const phoneNumber = newUnregisteredPhoneNumber();
    const pin = '1234';

    const isFreshInstall = await $('~Get started')
      .waitForDisplayed({ timeout: 30000 })
      .catch(() => false);
    if (isFreshInstall) {
      await onboardingPage.getStarted();
    }

    await welcomePage.enterPhoneNumber(phoneNumber);
    await welcomePage.submit();

    // An unregistered number routes to account creation instead of the
    // login PIN screen — this confirms we actually landed there.
    await signUpPage.validNumberIndicator.waitForDisplayed({ timeout: 15000 });
    log.info('New number correctly routed to account creation');

    await signUpPage.createAccount(pin);

    // Creating the account triggers a real SMS send, which can take a
    // moment — give it more than the default 15s.
    await otpPage.resendCodeButton.waitForDisplayed({ timeout: 30000 });
    log.info('Reached OTP verification');

    await otpPage.enterCode('0000');
    await otpPage.submit();
    await otpPage.expiredOrInvalidError.waitForDisplayed({ timeout: 15000 });
    log.info('Wrong OTP correctly rejected');
  });
});
