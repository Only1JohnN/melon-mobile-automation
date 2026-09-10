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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Melon share coins', () => {
  it('@regression shares coins and both sides see the right balance and notification', async () => {
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
    await shareCoinPage.successHeading.waitForDisplayed();
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
});
