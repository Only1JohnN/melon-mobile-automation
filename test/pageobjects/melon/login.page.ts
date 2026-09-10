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

  // Shown as a dismissible banner at the top of the screen for a few
  // seconds after a wrong PIN, then it auto-hides on its own.
  get incorrectCredentialsError() {
    return $('//android.widget.TextView[@text="Incorrect Credentials"]');
  }

  async enterPin(pin: string) {
    step('Entering PIN'); // never log the PIN value itself
    // Submitting the phone number triggers a real backend validation call
    // before this screen shows up, and that can take a while under load —
    // give it more than the default 15s.
    await this.pinInput.waitForDisplayed({ timeout: 30000 });
    await this.pinInput.setValue(pin);
  }

  async submit() {
    step('Submitting PIN (tapping Login)');
    await this.loginButton.click();
  }
}

export default new LoginPage();
