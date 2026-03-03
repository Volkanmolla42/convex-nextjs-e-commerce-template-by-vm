import { storeConfig } from "./store-config";

export function isFeatureEnabled(feature: keyof typeof storeConfig.featureFlags): boolean {
  return storeConfig.featureFlags[feature];
}

export function withFeatureFlag<T>(
  feature: keyof typeof storeConfig.featureFlags,
  component: T,
  fallback: T | null = null
): T | null {
  return isFeatureEnabled(feature) ? component : fallback;
}
