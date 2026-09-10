import { step } from '../../utils/logger';

class ShareCoinPage {
  // Neither field has a resource-id — Melon ID is the only EditText on this
  // screen until the coin amount field appears, so first/second position works.
  get melonIdInput() {
    return $('(//android.widget.EditText)[1]');
  }

  get coinAmountInput() {
    return $('(//android.widget.EditText)[2]');
  }

  get submitButton() {
    return $('~Share Coin');
  }

  get successHeading() {
    return $('//android.widget.TextView[@text="Coins Shared successfully"]');
  }

  async shareCoins(melonId: string, amount: string) {
    step(`Sharing ${amount} coins with ${melonId}`);
    await this.melonIdInput.waitForDisplayed();
    await this.melonIdInput.setValue(melonId);
    await this.coinAmountInput.setValue(amount);
    await this.submitButton.click();
  }

  // Confirming a share needs the account PIN on its own screen, entered via
  // a custom in-app keypad (not the system keyboard) — the digits have no
  // resource-id either, but each one is a plain text label we can match on.
  async enterPin(pin: string) {
    step('Confirming share with PIN'); // never log the PIN value itself
    for (const digit of pin) {
      await $(`//*[@text="${digit}"]`).click();
    }
  }
}

export default new ShareCoinPage();
