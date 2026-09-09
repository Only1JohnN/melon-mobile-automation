import path from 'node:path';
import { execSync } from 'node:child_process';
import { config as sharedConfig } from './wdio.shared.conf.ts';

const appPath = path.resolve(process.cwd(), process.env.APP_PATH || './apps/melon.apk');

export const config: WebdriverIO.Config = {
  ...sharedConfig,

  specs: ['./test/specs/melon/**/*.spec.ts'],

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_AVD_NAME || 'Melon_Test',
      'appium:avd': process.env.ANDROID_AVD_NAME || 'Melon_Test',
      'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '15',
      'appium:app': appPath,
      'appium:appPackage': 'com.melonafrica.staging',
      'appium:appActivity': '.MainActivity',
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
      'appium:newCommandTimeout': 240,
    },
  ],

  before: async () => {
    // Melon's login checks the device's location; on a fresh emulator no
    // provider ever resolves a fix, so the backend rejects login with
    // "Validation Check Failed" even with correct credentials. The app has
    // already launched once session setup completes, so restart it after
    // fixing the location or its first (only) location request misses the fix.
    execSync('adb emu geo fix 3.3792 6.5244');
    await driver.terminateApp('com.melonafrica.staging');
    await driver.activateApp('com.melonafrica.staging');
  },
};
