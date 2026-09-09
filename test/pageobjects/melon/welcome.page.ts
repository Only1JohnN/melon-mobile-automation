import { step } from '../../utils/logger';

class WelcomePage {
  // This field has no resource-id or label, so we grab it by position —
  // it's the only text field on this screen.
  get phoneNumberInput() {
    return $('(//android.widget.EditText)[1]');
  }

  get continueButton() {
    return $('~Continue');
  }

  async enterPhoneNumber(phoneNumber: string) {
    step(`Entering phone number: ${phoneNumber}`);
    await this.phoneNumberInput.waitForDisplayed();
    await this.phoneNumberInput.setValue(phoneNumber);
  }

  async submit() {
    step('Submitting phone number (tapping Continue)');
    await this.continueButton.click();
  }
}

export default new WelcomePage();
