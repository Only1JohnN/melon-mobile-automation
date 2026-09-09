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
    await this.pinInput.waitForDisplayed();
    await this.pinInput.setValue(pin);
  }

  async submit() {
    await this.loginButton.click();
  }
}

export default new LoginPage();
