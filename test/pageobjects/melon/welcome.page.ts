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
    await this.phoneNumberInput.waitForDisplayed();
    await this.phoneNumberInput.setValue(phoneNumber);
  }

  async submit() {
    await this.continueButton.click();
  }
}

export default new WelcomePage();
