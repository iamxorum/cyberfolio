export interface AnalyticsConfig {
  /** Umami website ID (Umami > Settings > Websites). Public. Empty = analytics stays off. */
  websiteId: string;
}

export const analyticsConfig: AnalyticsConfig = {
  websiteId: '',
};
