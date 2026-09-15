import onboardingPage from '../pageobjects/melon/onboarding.page';
import welcomePage from '../pageobjects/melon/welcome.page';
import loginPage from '../pageobjects/melon/login.page';
import homePage from '../pageobjects/melon/home.page';
import profilePage from '../pageobjects/melon/profile.page';

// The very first login of a session goes through onboarding ("Get started").
// Logging in again afterwards (e.g. after logging out) skips straight to the
// phone-number screen instead, so only tap "Get started" if it's actually
// there. This has to *wait* for it rather than checking instantly — right
// after the app launches, onboarding hasn't rendered yet, so an instant
// check would wrongly conclude "not onboarding" and get stuck with nothing
// to tap.
export async function login(phoneNumber: string, pin: string) {
  // The app never actually gets a fresh install between spec-file runs —
  // autoLaunch is off (see wdio.conf.ts, needed to fix the GPS location
  // before the app's first launch) and each run just brings the existing
  // app to the foreground, so it can resume already signed in from
  // whatever a previous run last did. Sign out first so login() always
  // starts from the same known screen instead of assuming one.
  const alreadySignedIn = await homePage.homeTab.isDisplayed().catch(() => false);
  if (alreadySignedIn) {
    await logout();
  }

  // 30s to match how long the app can genuinely take to render onboarding
  // after launch under load — a shorter wait here was timing out before the
  // screen had even appeared, not because it was actually absent.
  const isFreshInstall = await $('~Get started')
    .waitForDisplayed({ timeout: 30000 })
    .catch(() => false);
  if (isFreshInstall) {
    await onboardingPage.getStarted();
  }

  await welcomePage.enterPhoneNumber(phoneNumber);
  await welcomePage.submit();
  await loginPage.enterPin(pin);
  await loginPage.submit();
  await homePage.waitUntilLoaded();
}

export async function logout() {
  await profilePage.open();
  await profilePage.scrollToMoreSection();
  await profilePage.logoutButton.click();
  await welcomePage.phoneNumberInput.waitForDisplayed();
}
