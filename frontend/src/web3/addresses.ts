// src/web3/addresses.ts
import { ethers } from 'ethers';

const env = import.meta.env;

function clean(input?: string) {
  return (input ?? '')
    .replace(/['"]/g, '')
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
    .trim();
}

function toChecksum(label: string, raw?: string) {
  const v = clean(raw);
  if (!v) return { ok: false as const, val: '', err: `${label} vazio` };
  try {
    const lower = v.toLowerCase();
    const address = ethers.getAddress(lower);
    return { ok: true as const, val: address, err: '' };
  } catch (e: any) {
    console.error(`[CHECKSUM ERROR] ${label}`, e?.message || e);
    return { ok: false as const, val: '', err: `${label} checksum inválido (lido="${v}")` };
  }
}

const CHAIN_ID = Number(env.VITE_SEPOLIA_CHAIN_ID || 11155111);
const WEB3_ENABLED = String(env.VITE_WEB3_ENABLED || 'false').toLowerCase() === 'true';
const DEMO_MODE = String(env.VITE_WEB3_DEMO_MODE || 'false').toLowerCase() === 'true';

const tokenRes = toChecksum('TOKEN_ADDRESS', env.VITE_SEPOLIA_TOKEN_ADDRESS as string);
const shopRes = toChecksum('SHOP_ADDRESS', env.VITE_SEPOLIA_TOKENSHOP_ADDRESS as string);
const feedRes = toChecksum('CHAINLINK_FEED_ADDRESS', env.VITE_CHAINLINK_FEED_ADDRESS as string);

let reason = '';
let isConfigured = true;

if (!WEB3_ENABLED) {
  isConfigured = false;
  reason = 'WEB3 desabilitado';
} else if (!tokenRes.ok) {
  isConfigured = false;
  reason = tokenRes.err;
} else if (!shopRes.ok) {
  isConfigured = false;
  reason = shopRes.err;
} else if (Number.isNaN(CHAIN_ID)) {
  isConfigured = false;
  reason = 'CHAIN_ID inválido';
}

export const WEB3_CONFIG = {
  CHAIN_ID,
  TOKEN_ADDRESS: tokenRes.val,
  SHOP_ADDRESS: shopRes.val,
  CHAINLINK_FEED_ADDRESS: feedRes.val,
  WEB3_ENABLED,
  DEMO_MODE,
  isConfigured,
  reason,
};

(window as any).__ENV_DEBUG = {
  RAW: {
    VITE_SEPOLIA_CHAIN_ID: env.VITE_SEPOLIA_CHAIN_ID,
    VITE_SEPOLIA_TOKEN_ADDRESS: env.VITE_SEPOLIA_TOKEN_ADDRESS,
    VITE_SEPOLIA_TOKENSHOP_ADDRESS: env.VITE_SEPOLIA_TOKENSHOP_ADDRESS,
    VITE_CHAINLINK_FEED_ADDRESS: env.VITE_CHAINLINK_FEED_ADDRESS,
    VITE_WEB3_ENABLED: env.VITE_WEB3_ENABLED,
    VITE_WEB3_DEMO_MODE: env.VITE_WEB3_DEMO_MODE,
  },
  WEB3_CONFIG,
};

if (!WEB3_CONFIG.isConfigured) {
  console.warn('[WEB3_CONFIG] ⚠️ Configuração Web3 incompleta:', WEB3_CONFIG.reason);
} else {
  console.info('[WEB3_CONFIG] ✅ Configuração válida:', WEB3_CONFIG);
}

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('[WEB3_ENV_RAW]', (window as any).__ENV_DEBUG.RAW);
  // eslint-disable-next-line no-console
  console.log('[WEB3_CONFIG]', WEB3_CONFIG);
}
