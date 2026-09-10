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

  // The promo modals can be genuinely asynchronous — one can pop up a moment
  // *after* waitUntilLoaded() already confirmed Home was clear, right as a
  // test tries to tap something else, and closing one can reveal another
  // queued up behind it. Call this defensively before any bottom-nav
  // interaction, and keep clearing until nothing's left to dismiss.
  async dismissStrayModalIfPresent() {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const closeIcon = await this.findModalCloseIcon();
      if (!closeIcon) {
        return;
      }
      step(`Dismissing a stray promo modal (#${attempt})`);
      await closeIcon.click();
      await driver.pause(1000);
    }
  }

  // Bounds come back as "[left,top][right,bottom]" — pull out all four
  // numbers so callers can reason about position and size.
  private async getBounds(el: ReturnType<typeof $>) {
    const raw = await el.getAttribute('bounds');
    const match = raw?.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (!match) return null;
    const [, left, top, right, bottom] = match.map(Number);
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }

  // The close (X) buttons on the promo modals have no text or accessibility
  // label, so we match on content-desc="" instead. That alone isn't enough
  // to pick out the icon though — the dialog's full-screen backdrop is also
  // clickable with an empty content-desc. What actually sets the close icon
  // apart is its size: it's a small square button, not a screen-sized scrim
  // or a text-filled card.
  private async findModalCloseIcon() {
    const candidates = await $$('//android.view.ViewGroup[@clickable="true" and @content-desc=""]');
    const count = await candidates.length;

    for (let i = 0; i < count; i++) {
      const bounds = await this.getBounds(candidates[i]);
      if (bounds && bounds.width > 0 && bounds.width < 200 && bounds.height > 0 && bounds.height < 200) {
        return candidates[i];
      }
    }

    return null;
  }

  // The notification bell has no label either. It's the header's other
  // small unlabeled icon, sitting top-right (the avatar is top-left).
  async openNotifications() {
    step('Opening notifications');
    const candidates = await $$('//android.view.ViewGroup[@clickable="true" and @content-desc=""]');
    const count = await candidates.length;

    for (let i = 0; i < count; i++) {
      const bounds = await this.getBounds(candidates[i]);
      if (bounds && bounds.width < 200 && bounds.height < 200 && bounds.left > 540 && bounds.top < 400) {
        await candidates[i].click();
        return;
      }
    }

    throw new Error('Notification bell not found');
  }
}

export default new HomePage();
