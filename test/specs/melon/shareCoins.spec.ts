import profilePage from '../../pageobjects/melon/profile.page';
import shareCoinPage from '../../pageobjects/melon/shareCoin.page';
import homePage from '../../pageobjects/melon/home.page';
import staticContentPage from '../../pageobjects/melon/staticContent.page';
import { login, logout } from '../../utils/auth';
import { log } from '../../utils/logger';

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
// Nothing here yet — this spec only drives the UI.

// After a rejected share (bad Melon ID, amount too high, wrong PIN) we need
// to get back to the bottom nav to log out cleanly. The number of screens in
// between varies by which case failed, so just back out until Profile shows
// up again instead of hardcoding a screen count.
async function returnToProfileTab() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    if (await profilePage.profileTab.isDisplayed().catch(() => false)) {
      return;
    }
    await driver.back();
    await driver.pause(1000);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Melon share coins', () => {
  it('@regression shares coins and both sides see the right balance and notification', async function () {
    // This test logs in three separate times (recipient, sender, recipient
    // again), each a full onboarding-aware login plus modal dismissal — the
    // global 120s test timeout isn't enough headroom for that.
    this.timeout(300000);

    const senderPhone = process.env.TEST_PHONE_NUMBER;
    const senderPin = process.env.TEST_PIN;
    const recipientPhone = process.env.TEST_PHONE_NUMBER_2;
    const recipientPin = process.env.TEST_PIN_2;
    const recipientMelonId = process.env.TEST_MELON_ID_2;
    const amount = 1000;

    if (!senderPhone || !senderPin || !recipientPhone || !recipientPin || !recipientMelonId) {
      throw new Error(
        'Set TEST_PHONE_NUMBER, TEST_PIN, TEST_PHONE_NUMBER_2, TEST_PIN_2 and TEST_MELON_ID_2 in .env to run this spec'
      );
    }

    // Read the recipient's starting balance and display name before anything
    // is shared. Both are read live rather than hardcoded, since either can
    // change — the notification text later has to match whatever the name
    // actually is, not a value we've written into the test.
    await login(recipientPhone, recipientPin);
    await profilePage.open();
    const recipientBalanceBefore = await profilePage.getCoinsBalance();
    const recipientName = await profilePage.getName();
    await logout();

    // Share coins from the sender.
    await login(senderPhone, senderPin);
    await profilePage.open();
    const senderBalanceBefore = await profilePage.getCoinsBalance();
    const senderName = await profilePage.getName();

    await profilePage.shareCoinsButton.click();
    await shareCoinPage.shareCoins(recipientMelonId, String(amount));
    await shareCoinPage.enterPin(senderPin);
    // A real transfer happens server-side here, so give it more than the
    // default 15s.
    await shareCoinPage.successHeading.waitForDisplayed({ timeout: 30000 });
    log.info('Share confirmed successful');

    // Sender's balance should drop by exactly the shared amount.
    await profilePage.open();
    const senderBalanceAfter = await profilePage.getCoinsBalance();
    if (senderBalanceAfter !== senderBalanceBefore - amount) {
      throw new Error(
        `Expected sender balance ${senderBalanceBefore} - ${amount} = ${senderBalanceBefore - amount}, got ${senderBalanceAfter}`
      );
    }

    // Sender should see their own "shared" notification, naming the
    // recipient we actually read the balance from above.
    await homePage.homeTab.click();
    await homePage.openNotifications();
    await staticContentPage.heading(`You have Shared ${amount.toLocaleString()} Coins`).waitForDisplayed();
    await staticContentPage
      .heading(`You have Shared ${amount.toLocaleString()} Coins with ${recipientName}`)
      .waitForDisplayed();
    log.info('Sender notification confirmed');

    await logout();

    // Recipient's balance should rise by exactly the shared amount, and
    // their notification should name the sender we read above.
    await login(recipientPhone, recipientPin);
    await profilePage.open();
    const recipientBalanceAfter = await profilePage.getCoinsBalance();
    if (recipientBalanceAfter !== recipientBalanceBefore + amount) {
      throw new Error(
        `Expected recipient balance ${recipientBalanceBefore} + ${amount} = ${recipientBalanceBefore + amount}, got ${recipientBalanceAfter}`
      );
    }

    await homePage.homeTab.click();
    await homePage.openNotifications();
    await staticContentPage.heading(`You got ${amount.toLocaleString()} Coins`).waitForDisplayed();
    await staticContentPage
      .heading(`${senderName} Shared ${amount.toLocaleString()} Coins with you`)
      .waitForDisplayed();
    log.info('Recipient balance and notification confirmed');
  });

  it('@regression rejects sharing to an invalid Melon ID', async function () {
    this.timeout(180000);

    const senderPhone = process.env.TEST_PHONE_NUMBER!;
    const senderPin = process.env.TEST_PIN!;

    await login(senderPhone, senderPin);
    await profilePage.open();
    await profilePage.shareCoinsButton.click();
    await shareCoinPage.shareCoins('NOTAREALMELONID999', '10');

    // Exact wording for this rejection wasn't verified live this session —
    // the reliable check is that it never lets the share through.
    const stillOnForm = await shareCoinPage.isStillOnForm();
    if (!stillOnForm) {
      throw new Error('Expected the share-coin form to reject an invalid Melon ID, but it moved on');
    }
    log.info('Invalid Melon ID correctly rejected');

    await returnToProfileTab();
    await logout();
  });

  it('@regression rejects sharing more coins than the current balance', async function () {
    this.timeout(180000);

    const senderPhone = process.env.TEST_PHONE_NUMBER!;
    const senderPin = process.env.TEST_PIN!;
    const recipientMelonId = process.env.TEST_MELON_ID_2!;

    await login(senderPhone, senderPin);
    await profilePage.open();
    const balance = await profilePage.getCoinsBalance();

    await profilePage.shareCoinsButton.click();
    await shareCoinPage.shareCoins(recipientMelonId, String(balance + 999999));

    const stillOnForm = await shareCoinPage.isStillOnForm();
    if (!stillOnForm) {
      throw new Error('Expected the share-coin form to reject an amount above balance, but it moved on');
    }
    log.info('Over-balance amount correctly rejected');

    await returnToProfileTab();
    await logout();
  });

  it('@regression rejects a wrong PIN when confirming a share', async function () {
    this.timeout(180000);

    const senderPhone = process.env.TEST_PHONE_NUMBER!;
    const senderPin = process.env.TEST_PIN!;
    const recipientMelonId = process.env.TEST_MELON_ID_2!;

    await login(senderPhone, senderPin);
    await profilePage.open();
    await profilePage.shareCoinsButton.click();
    await shareCoinPage.shareCoins(recipientMelonId, '10');

    // Deliberately wrong — one digit off from every seeded test PIN.
    await shareCoinPage.enterPin('0000');
    await shareCoinPage.incorrectPinError.waitForDisplayed({ timeout: 15000 });
    log.info('Wrong PIN correctly rejected');

    await returnToProfileTab();
    await logout();
  });
});
