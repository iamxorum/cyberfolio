/** Photo as a data URL for the PDF. Undefined if unset or unreachable, so the download never breaks. */
export async function loadCVPhoto(path?: string): Promise<string | undefined> {
  if (!path) return undefined;
  try {
    const response = await fetch(path);
    if (!response.ok) return undefined;
    const blob = await response.blob();
    return await new Promise<string | undefined>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}
