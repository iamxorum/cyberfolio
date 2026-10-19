import { useState } from 'react';
import { downloadBlob } from '@/lib/download-blob';

/** Runs a PDF build and saves the result, tracking the busy and "just downloaded" states for the button. */
export function usePdfDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const download = async (build: () => Promise<{ blob: Blob; filename: string }>) => {
    setIsDownloading(true);
    try {
      const { blob, filename } = await build();
      downloadBlob(blob, filename);
      setSucceeded(true);
      setTimeout(() => setSucceeded(false), 1800);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return { isDownloading, succeeded, download };
}
