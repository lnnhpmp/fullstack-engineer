import { reset } from '#lib/server/org.ts';

/** Loads the org from the database before the first request. */
export const init = reset;
