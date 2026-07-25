import { CONFIG } from "./config";

/**
 * Feature flags shared by every variant. Defaults live in shared/config.ts;
 * users override them in lisible.config.json under "features".
 */
export const SHARED_FEATURES = CONFIG.features;
