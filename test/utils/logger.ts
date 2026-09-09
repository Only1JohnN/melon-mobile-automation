import logger from '@wdio/logger';

// Shared logger for page objects and specs. Respects wdio.shared.conf.ts's
// `logLevel` and is tagged so its lines are easy to pick out in `wdio` output.
export const log = logger('melon');
