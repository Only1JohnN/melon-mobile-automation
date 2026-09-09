import { step } from '../../utils/logger';

class HomePage {
  get homeTab() {
    return $('//android.widget.TextView[@text="Home"]');
  }

  // After a successful login, up to three popups can show up before Home is
  // actually usable: a location prompt, an "earn rewards" promo, and (if the
  // user hasn't spun today) a free-spin modal. They can appear in any order,
  // so we just keep clearing whatever's on screen until Home shows up.
  async waitUntilLoaded() {
    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Using $$ here instead of $ because $ waits up to 15s for an element
      // to show up before giving up — fine for one check, too slow when
      // we're repeating it across several popups.
      const homeTabs = await $$('//android.widget.TextView[@text="Home"]');
      if ((await homeTabs.length) > 0 && (await homeTabs[0].isDisplayed())) {
        return;
      }

      const continueButtons = await $$('~Continue');
      if ((await continueButtons.length) > 0) {
        step('Dismissing location interstitial (tapping Continue)');
        await continueButtons[0].click();
        await driver.pause(1500);
        continue;
      }

      const closeIcon = await this.findModalCloseIcon();
      if (closeIcon) {
        step(`Dismissing interstitial #${attempt} (closing promo modal)`);
        await closeIcon.click();
        await driver.pause(1500);
        continue;
      }

      step(`Home not visible yet on attempt #${attempt}, waiting`);
      await driver.pause(1500);
    }

    await this.homeTab.waitForDisplayed({ timeout: 20000 });
  }

  // The close (X) buttons on the promo modals have no text or accessibility
  // label, so we can't select them directly. Instead we look for an unlabeled
  // button sitting in the upper half of the screen — that's always the popup's
  // close icon, never the bottom nav (which sits near the very bottom).
  private async findModalCloseIcon() {
    const candidates = await $$('//android.view.ViewGroup[@clickable="true" and @NAF="true"]');
    const count = await candidates.length;

    for (let i = 0; i < count; i++) {
      const bounds = await candidates[i].getAttribute('bounds'); // "[left,top][right,bottom]"
      const top = Number(bounds?.match(/\[\d+,(\d+)\]\[\d+,\d+\]/)?.[1]);
      if (!Number.isNaN(top) && top < 1500) {
        return candidates[i];
      }
    }

    return null;
  }
}

export default new HomePage();
