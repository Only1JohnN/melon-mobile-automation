import { log } from '../../utils/logger';

// Same lack-of-testID situation as WelcomePage: the phone number (re-shown,
// read-only-looking) is the 1st EditText on this screen, PIN is the 2nd.
class LoginPage {
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
    log.info('Entering PIN'); // never log the PIN value itself
    await this.pinInput.waitForDisplayed();
    await this.pinInput.setValue(pin);
  }

  async submit() {
    log.info('Submitting PIN (tapping Login)');
    await this.loginButton.click();
  }
}

export default new LoginPage();
