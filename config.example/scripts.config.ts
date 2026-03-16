export interface ScriptConfig {
  src: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
  id?: string;
  dataAttributes?: Record<string, string>; // e.g. "website-id" for "data-website-id"
}

export const scripts: ScriptConfig[] = [
  // Example analytics script
  // {
  //   src: "https://analytics.example.com/script.js",
  //   strategy: "afterInteractive",
  //   dataAttributes: {
  //     "website-id": "your-website-id"
  //   }
  // }
];
