import logger from '@wdio/logger';

// Shared logger for page objects and specs, so test output reads as a clear
// step-by-step log instead of raw console.log noise.
export const log = logger('melon');
