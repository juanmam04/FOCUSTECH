export function getWhatsAppUrl(message) {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || '59899000000';
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${number}${text}`;
}
