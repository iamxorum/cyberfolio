export interface AnalyticsConfig {
  /** Umami website ID (Umami > Settings > Websites). Public. Empty = analytics stays off. */
  websiteId: string;
  /** Send custom events (PDF downloads, contact actions, project opens, social clicks, theme toggle). */
  events: boolean;
  /** Drop events from crawlers, headless browsers and monitors in the /stats proxy, before they reach Umami. */
  blockBots: boolean;
}

export const analyticsConfig: AnalyticsConfig = {
  websiteId: '',
  events: true,
  blockBots: true,
};
