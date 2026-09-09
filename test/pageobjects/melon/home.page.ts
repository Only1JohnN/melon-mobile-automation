import { log } from '../../utils/logger';

class HomePage {
  get homeTab() {
    return $('//android.widget.TextView[@text="Home"]');
  }

  // Up to three interstitials can appear right after login, in any
  // combination, before Home is actually usable: a "turn on location"
  // screen (has its own Continue button), an "earn rewards" promo modal,
  // and — if the user hasn't spun today — a free-spin modal. The two promo
  // modals have no accessible label on their close icon (NAF="true"), so
  // they're targeted by position: an unlabeled clickable ViewGroup sitting
  // in the upper part of the screen. The bottom nav's own unlabeled icons
  // sit much lower (near the very bottom), so this doesn't clash with them.
  async waitUntilLoaded() {
    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // $$ (plural) checks what's on screen right now without the implicit
      // per-element wait that $ (singular) does — that wait is up to
      // `waitforTimeout` (15s) *each*, which can blow past the mocha test
      // timeout across a few dismiss attempts.
      const homeTabs = await $$('//android.widget.TextView[@text="Home"]');
      if ((await homeTabs.length) > 0 && (await homeTabs[0].isDisplayed())) {
        return;
      }

      const continueButtons = await $$('~Continue');
      if ((await continueButtons.length) > 0) {
        log.info('Dismissing location interstitial (tapping Continue)');
        await continueButtons[0].click();
        await driver.pause(1500);
        continue;
      }

      const closeIcon = await this.findModalCloseIcon();
      if (closeIcon) {
        log.info(`Dismissing interstitial #${attempt} (closing promo modal)`);
        await closeIcon.click();
        await driver.pause(1500);
        continue;
      }

      log.info(`Home not visible yet on attempt #${attempt}, waiting`);
      await driver.pause(1500);
    }

    await this.homeTab.waitForDisplayed({ timeout: 20000 });
  }

  private async findModalCloseIcon() {
    const candidates = await $$('//android.view.ViewGroup[@clickable="true" and @NAF="true"]');
    const count = await candidates.length;

    for (let i = 0; i < count; i++) {
      const bounds = await candidates[i].getAttribute('bounds'); // e.g. "[926,1050][1022,1147]"
      const top = Number(bounds?.match(/\[\d+,(\d+)\]\[\d+,\d+\]/)?.[1]);
      if (!Number.isNaN(top) && top < 1500) {
        return candidates[i];
      }
    }

    return null;
  }
}

export default new HomePage();
