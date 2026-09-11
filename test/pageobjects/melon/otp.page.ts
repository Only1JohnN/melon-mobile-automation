import { step } from '../../utils/logger';

// The 4-digit code is 4 separate boxes rather than one field, each an
// unlabeled EditText.
class OtpPage {
  get digitInputs() {
    return $$('//android.widget.EditText');
  }

  get resendCodeButton() {
    return $('~Resend Code');
  }

  get verifyButton() {
    return $('~Verify');
  }

  get expiredOrInvalidError() {
    return $('//android.widget.TextView[@text="Expired or Invalid OTP"]');
  }

  async enterCode(code: string) {
    step('Entering OTP'); // never log the actual code
    const boxes = await this.digitInputs;
    for (let i = 0; i < code.length; i++) {
      await boxes[i].setValue(code[i]);
    }
  }

  async submit() {
    step('Submitting OTP (tapping Verify)');
    await this.verifyButton.click();
  }
}

export default new OtpPage();
