/**
 * Integración Mercado Pago — preparada para implementación futura.
 * Configurar MERCADOPAGO_ACCESS_TOKEN y MERCADOPAGO_PUBLIC_KEY en .env
 */

export const mercadoPagoConfig = {
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || null,
  publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || null,
  enabled: false,
};

export function isMercadoPagoReady() {
  return Boolean(mercadoPagoConfig.accessToken && mercadoPagoConfig.publicKey);
}

// export async function createMercadoPagoPreference(order) { ... }
