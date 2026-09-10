// Help Center, Privacy Policy, and Terms and Conditions are all the same
// pattern: a native (not webview) screen with a heading matching the link
// text that opened it, and body content below. This one page object covers
// all three rather than repeating the same shape three times.
class StaticContentPage {
  heading(text: string) {
    return $(`//android.widget.TextView[@text="${text}"]`);
  }
}

export default new StaticContentPage();
