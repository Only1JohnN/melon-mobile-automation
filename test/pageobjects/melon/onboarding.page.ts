import { step } from '../../utils/logger';

class OnboardingPage {
  get getStartedButton() {
    return $('~Get started');
  }

  async getStarted() {
    step('Dismissing onboarding (tapping Get started)');
    // This is the very first screen after app launch, so it's waiting on
    // app startup too, not just its own render — give it more than the
    // default 15s.
    await this.getStartedButton.waitForDisplayed({ timeout: 30000 });

    // The onboarding carousel auto-advances between slides. Grabbing the
    // button once and clicking it can hit a stale reference if the slide
    // changes in between, so re-find and click fresh each time, stopping as
    // soon as the button is actually gone (i.e. we've navigated away). The
    // pause between attempts has to outlast the screen transition itself —
    // too short and we click again mid-transition without ever leaving.
    for (let attempt = 1; attempt <= 8; attempt++) {
      const buttons = await $$('~Get started');
      if ((await buttons.length) === 0) {
        return;
      }
      await buttons[0].click();
      await driver.pause(2500);
    }

    throw new Error('Still on onboarding after repeated "Get started" taps');
  }
}

export default new OnboardingPage();
