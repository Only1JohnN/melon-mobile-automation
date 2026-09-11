import { step } from '../../utils/logger';

// Entering a phone number that isn't registered yet on the shared Welcome
// screen routes here instead of to the login PIN screen — same entry point,
// different destination depending on whether the number already has an
// account.
class SignUpPage {
  get validNumberIndicator() {
    return $('//android.widget.TextView[@text="✓ Valid Nigerian number"]');
  }

  // Phone Number is EditText[1] (pre-filled from the previous screen), so
  // PIN and referral code are next in position — neither has a resource-id.
  get pinInput() {
    return $('(//android.widget.EditText)[2]');
  }

  get referralCodeInput() {
    return $('(//android.widget.EditText)[3]');
  }

  get createAccountButton() {
    return $('~Create account');
  }

  get termsOfUseLink() {
    return $('~Terms of Use');
  }

  get privacyPolicyLink() {
    return $('~Privacy Policy');
  }

  async createAccount(pin: string, referralCode?: string) {
    step('Creating account with PIN' + (referralCode ? ' and referral code' : ''));
    await this.pinInput.waitForDisplayed({ timeout: 15000 });
    await this.pinInput.setValue(pin);
    if (referralCode) {
      await this.referralCodeInput.setValue(referralCode);
    }
    await this.createAccountButton.click();
  }
}

export default new SignUpPage();
