interface Html2PdfOptions {
  margin?: number | [number, number, number, number];
  filename?: string;
  image?: { type?: string; quality?: number };
  html2canvas?: Record<string, unknown>;
  jsPDF?: Record<string, unknown>;
  pagebreak?: Record<string, unknown>;
}

interface Html2PdfInstance {
  set(options: Html2PdfOptions): Html2PdfInstance;
  from(element: HTMLElement): Html2PdfInstance;
  save(): Promise<void>;
}

interface Window {
  html2pdf?: () => Html2PdfInstance;
}
