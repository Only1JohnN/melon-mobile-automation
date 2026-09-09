import { step } from '../../utils/logger';

class LoginPage {
  // No resource-id here either — the phone number field comes first on this
  // screen, so the PIN field is the second EditText.
  get pinInput() {
    return $('(//android.widget.EditText)[2]');
  }

  get loginButton() {
    return $('~Login');
  }

  get forgotPinLink() {
    return $('~Forgot PIN?');
  }

  get validationError() {
    return $('//android.widget.TextView[@text="Validation Check Failed"]');
  }

  async enterPin(pin: string) {
    step('Entering PIN'); // never log the PIN value itself
    await this.pinInput.waitForDisplayed();
    await this.pinInput.setValue(pin);
  }

  async submit() {
    step('Submitting PIN (tapping Login)');
    await this.loginButton.click();
  }
}

export default new LoginPage();
