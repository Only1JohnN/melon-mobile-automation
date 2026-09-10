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

  get phoneNumberError() {
    return $('//android.widget.TextView[@text="Phone number should be 11 digits"]');
  }

  async enterPhoneNumber(phoneNumber: string) {
    step(`Entering phone number: ${phoneNumber}`);
    // This screen can follow right after tapping "Get started" or logging
    // out, both of which are still mid-transition when this runs — give it
    // more than the default 15s.
    await this.phoneNumberInput.waitForDisplayed({ timeout: 30000 });
    await this.phoneNumberInput.setValue(phoneNumber);
  }

  async submit() {
    step('Submitting phone number (tapping Continue)');
    await this.continueButton.click();
  }
}

export default new WelcomePage();
