import { log } from '../../utils/logger';

class OnboardingPage {
  get getStartedButton() {
    return $('~Get started');
  }

  async getStarted() {
    log.info('Dismissing onboarding (tapping Get started)');
    await this.getStartedButton.waitForDisplayed();
    await this.getStartedButton.click();
  }
}

export default new OnboardingPage();
