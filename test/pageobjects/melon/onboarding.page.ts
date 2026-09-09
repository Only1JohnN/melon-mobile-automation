class OnboardingPage {
  get getStartedButton() {
    return $('~Get started');
  }

  async getStarted() {
    await this.getStartedButton.waitForDisplayed();
    await this.getStartedButton.click();
  }
}

export default new OnboardingPage();
