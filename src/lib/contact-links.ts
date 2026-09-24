// Helper functions to format WhatsApp & Facebook Messenger links

export function formatWhatsAppUrl(phone: string, defaultMessage?: string): string {
  if (!phone) return "";
  // Strip non-digit characters except leading plus if any
  let clean = phone.trim().replace(/[^\d+]/g, "");

  // Remove leading +
  if (clean.startsWith("+")) {
    clean = clean.substring(1);
  }

  // Handle local Egyptian mobile numbers (01xxxxxxxxx -> 201xxxxxxxxx)
  if (clean.startsWith("01") && clean.length === 11) {
    clean = "20" + clean.substring(1);
  } else if (clean.startsWith("1") && clean.length === 10) {
    clean = "20" + clean;
  }

  const message =
    defaultMessage ||
    "مرحباً أستاذ محمد، يسعدني التواصل معك بخصوص مشروع تصميم واجهات وتجربة مستخدم جديدة.";
  const encodedMsg = encodeURIComponent(message);

  return `https://wa.me/${clean}${encodedMsg ? `?text=${encodedMsg}` : ""}`;
}

export function formatMessengerUrl(idOrUrl: string): string {
  if (!idOrUrl) return "";
  const trimmed = idOrUrl.trim();

  // If already a full URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Strip leading @ or /
  const cleanId = trimmed.replace(/^[@/]+/, "");
  return `https://m.me/${cleanId}`;
}

export function formatFacebookPageUrl(idOrUrl: string): string {
  if (!idOrUrl) return "";
  const trimmed = idOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const cleanId = trimmed.replace(/^[@/]+/, "");
  return `https://www.facebook.com/${cleanId}`;
}
