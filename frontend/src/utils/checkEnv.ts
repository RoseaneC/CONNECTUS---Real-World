/// <reference types="vite/client" />

import { getAddress } from 'ethers';

function clean(input?: string) {
  return (input ?? '')
    .replace(/['"]/g, '')
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
    .trim();
}

function validateAddress(label: string, raw?: string): boolean {
  const v = clean(raw);
  if (!v) {
    console.error(`[CONFIG] ❌ ${label} não definido (variável vazia ou null)`);
    return false;
  }
  try {
    // Normaliza para lowercase antes de validar (evita erro de checksum no ethers v6)
    const normalized = v.toLowerCase().trim();
    const address = getAddress(normalized);
    console.info(`[CONFIG] ✅ ${label} válido: ${address}`);
    return true;
  } catch (e: any) {
    console.error(`[CONFIG] ❌ ${label} inválido:`, e?.message || e);
    console.error(`[CONFIG]    Valor recebido: "${v}"`);
    return false;
  }
}

export function checkEnvVars() {
  const token = import.meta.env.VITE_SEPOLIA_TOKEN_ADDRESS;
  const shop = import.meta.env.VITE_SEPOLIA_TOKENSHOP_ADDRESS;
  const feed = import.meta.env.VITE_CHAINLINK_FEED_ADDRESS;

  const tokenValid = validateAddress('Token Address', token);
  const shopValid = validateAddress('Shop Address', shop);
  
  if (tokenValid && shopValid) {
    console.info('[CONFIG] ✅ Endereços válidos (Token & Shop)');
  }

  // Chainlink feed é opcional, então apenas avisa se estiver definido mas inválido
  if (feed) {
    validateAddress('Chainlink Feed Address', feed);
  } else {
    console.warn('[CONFIG] ⚠️ Chainlink feed não configurado (opcional)');
  }

  console.info(
    '[CONFIG] DEMO:',
    import.meta.env.VITE_WEB3_DEMO_MODE,
    'ENABLED:',
    import.meta.env.VITE_WEB3_ENABLED,
  );
}
