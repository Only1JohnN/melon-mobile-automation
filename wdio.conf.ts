import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { config as sharedConfig } from './wdio.shared.conf.ts';
import { log } from './test/utils/logger.ts';

const appPath = path.resolve(process.cwd(), process.env.APP_PATH || './apps/melon.apk');

const outputDir = (subdir: string) => {
  const dir = path.resolve(process.cwd(), subdir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

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
    // Melon checks the device's location during login, and a fresh emulator
    // never has one set — so login fails with "Validation Check Failed" even
    // with the right credentials. We set a fake GPS location, then restart
    // the app so it actually picks the fix up (it only checks once, at
    // launch, and the app has already launched by this point in the session).
    log.info('Setting emulator GPS location and restarting the app');
    execSync('adb emu geo fix 3.3792 6.5244');
    await driver.pause(1000); // give the location time to register
    await driver.terminateApp('com.melonafrica.staging');
    await driver.activateApp('com.melonafrica.staging');
    await driver.pause(2000); // give the app time to reload before the test starts
  },

  beforeTest: async () => {
    await driver.startRecordingScreen();
  },

  afterTest: async (test, _context, result) => {
    const safeName = test.title.replace(/[^a-z0-9]+/gi, '_');

    const videoPath = path.join(outputDir('recordings'), `${safeName}-${Date.now()}.mp4`);
    await driver.saveRecordingScreen(videoPath);
    log.info(`Saved recording: ${videoPath}`);

    if (!result.passed) {
      const screenshotPath = path.join(outputDir('screenshots'), `${safeName}-${Date.now()}.png`);
      await driver.saveScreenshot(screenshotPath);
      log.info(`Saved failure screenshot: ${screenshotPath}`);
    }
  },
};
