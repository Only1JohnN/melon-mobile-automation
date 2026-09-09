import { log } from '../../utils/logger';

// The app has no testID/accessibilityLabel on this field, so it's targeted by
// position among EditTexts on screen (there's only one here).
class WelcomePage {
  get phoneNumberInput() {
    return $('(//android.widget.EditText)[1]');
  }

  get continueButton() {
    return $('~Continue');
  }

  async enterPhoneNumber(phoneNumber: string) {
    log.info(`Entering phone number: ${phoneNumber}`);
    await this.phoneNumberInput.waitForDisplayed();
    await this.phoneNumberInput.setValue(phoneNumber);
  }

  async submit() {
    log.info('Submitting phone number (tapping Continue)');
    await this.continueButton.click();
  }
}

export default new WelcomePage();
