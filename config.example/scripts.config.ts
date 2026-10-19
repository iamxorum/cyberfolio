/** A third-party `<script>` added to every page. */
export interface ScriptConfig {
  src: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
  id?: string;
  /** Rendered as `data-*` attributes, e.g. `"website-id"` becomes `data-website-id`. */
  dataAttributes?: Record<string, string>;
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
