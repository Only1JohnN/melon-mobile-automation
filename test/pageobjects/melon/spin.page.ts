import { step } from '../../utils/logger';

class SpinPage {
  // Shown on Home once a day, before the free spin has been used.
  get freeSpinGateHeading() {
    return $('//android.widget.TextView[@text="Your free spin is waiting"]');
  }

  // The "Spin Now" CTA shows up twice on the way in — once on the Home gate
  // modal, once again on the info screen it leads to — both with this same
  // accessibility id, so we always take whichever one is on screen right now.
  get spinNowButton() {
    return $('~Spin Now');
  }

  get dailyWheelHeading() {
    return $('//android.widget.TextView[@text="Daily Melon Wheel"]');
  }

  async openFromHomeGate() {
    step('Opening the spin wheel from the Home gate modal');
    await this.freeSpinGateHeading.waitForDisplayed({ timeout: 15000 });
    await this.spinNowButton.click();
    await this.dailyWheelHeading.waitForDisplayed({ timeout: 15000 });
  }
}

export default new SpinPage();
