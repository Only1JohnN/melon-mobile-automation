import dotenv from 'dotenv';
dotenv.config();

export const config: Partial<WebdriverIO.Config> = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',

  // Local Appium server is started/stopped automatically by @wdio/appium-service,
  // using the `appium` binary installed as a devDependency of this project.
  services: ['appium'],
  port: 4723,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        // We attach our own recording/screenshot in wdio.conf.ts's afterTest
        // hook instead, so we don't need Allure's built-in per-command ones.
        disableWebdriverScreenshotsReporting: true,
      },
    ],
  ],

  maxInstances: 1,
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
};
