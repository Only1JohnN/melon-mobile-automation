import logger from '@wdio/logger';
import { addStep } from '@wdio/allure-reporter';

// Shared logger for page objects and specs, so test output reads as a clear
// step-by-step log instead of raw console.log noise.
export const log = logger('melon');

// Records a step both in the console log and in the Allure report, so the
// report's step timeline is built from the same calls we already make —
// no separate logging just for reporting purposes.
export function step(message: string) {
  log.info(message);
  addStep(message);
}
