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
    await this.getStartedButton.click();
  }
}

export default new OnboardingPage();
