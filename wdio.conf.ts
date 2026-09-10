import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { addAttachment } from '@wdio/allure-reporter';
import { config as sharedConfig } from './wdio.shared.conf.ts';
import { log } from './test/utils/logger.ts';

const appPath = path.resolve(process.cwd(), process.env.APP_PATH || './apps/melon.apk');
const headless = process.env.ANDROID_EMULATOR_HEADLESS === 'true';

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
      // Don't launch the app the moment the session starts — we need to set
      // a fake GPS location first (see the `before` hook), and the app only
      // checks location once, at launch. Launching it ourselves afterwards
      // means we never have to terminate-then-relaunch, which turned out to
      // be unreliable under load (the app wouldn't die within any timeout
      // we tried).
      'appium:autoLaunch': false,
      // -no-window skips rendering an emulator GUI window at all, which
      // cuts out a real chunk of host overhead (no GPU compositing) — worth
      // it on a resource-tight machine. Appium still boots and controls the
      // emulator the same way; you just won't see it on screen.
      ...(headless && { 'appium:avdArgs': '-no-window -no-audio -gpu swiftshader_indirect' }),
    },
  ],

  before: async () => {
    // Melon checks the device's location during login, and a fresh emulator
    // never has one set — so login fails with "Validation Check Failed" even
    // with the right credentials. Fix the location before the app's first
    // launch (see `appium:autoLaunch: false` above) so it's already there
    // for that one-time check.
    log.info('Setting emulator GPS location');
    execSync('adb emu geo fix 3.3792 6.5244');
    await driver.pause(1000); // give the location time to register

    log.info('Launching the app');
    await driver.activateApp('com.melonafrica.staging');
    await driver.pause(2000); // give the app time to load before the test starts
  },

  beforeTest: async () => {
    await driver.startRecordingScreen();
  },

  afterTest: async (test, _context, result) => {
    const safeName = test.title.replace(/[^a-z0-9]+/gi, '_');

    // These save to disk *and* return the file as a Buffer, so we can hand
    // the same bytes straight to Allure without reading the file back.
    const videoPath = path.join(outputDir('recordings'), `${safeName}-${Date.now()}.mp4`);
    const videoBuffer = await driver.saveRecordingScreen(videoPath);
    await addAttachment('Recording', videoBuffer, 'video/mp4');
    log.info(`Saved recording: ${videoPath}`);

    if (!result.passed) {
      const screenshotPath = path.join(outputDir('screenshots'), `${safeName}-${Date.now()}.png`);
      const screenshotBuffer = await driver.saveScreenshot(screenshotPath);
      await addAttachment('Failure screenshot', screenshotBuffer, 'image/png');
      log.info(`Saved failure screenshot: ${screenshotPath}`);
    }
  },
};
