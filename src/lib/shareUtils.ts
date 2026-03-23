/** Open SMS composer with pre-filled message */
export function shareViaText(message: string): void {
  window.open("sms:?body=" + encodeURIComponent(message));
}

/** Open email composer with subject and body */
export function shareViaEmail(subject: string, body: string): void {
  window.open(
    "mailto:?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body)
  );
}

/** Copy text to clipboard, returns true on success */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Use Web Share API if available (mobile). Returns false if not supported. */
export async function shareNative(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  if (!canShareNative()) {
    return false;
  }
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

/** Check if Web Share API is available */
export function canShareNative(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}
