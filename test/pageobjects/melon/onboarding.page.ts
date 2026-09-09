import { step } from '../../utils/logger';

class OnboardingPage {
  get getStartedButton() {
    return $('~Get started');
  }

  async getStarted() {
    step('Dismissing onboarding (tapping Get started)');
    await this.getStartedButton.waitForDisplayed();
    await this.getStartedButton.click();
  }
}

export default new OnboardingPage();
