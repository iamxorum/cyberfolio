export interface AnalyticsConfig {
  /**
   * Umami "Website ID" (Settings > Websites in the Umami dashboard). It is public: it appears in the page source.
   * Analytics stays off while this is empty, even if features.analytics is true.
   */
  websiteId: string;
}

export const analyticsConfig: AnalyticsConfig = {
  websiteId: '',
};
