import { getAddress } from 'ethers';

export function checkEnvVars() {
  const token = import.meta.env.VITE_SEPOLIA_TOKEN_ADDRESS;
  const shop = import.meta.env.VITE_SEPOLIA_TOKENSHOP_ADDRESS;
  const feed = import.meta.env.VITE_CHAINLINK_FEED_ADDRESS;

  try {
    getAddress(token);
    getAddress(shop);
    console.info('[CONFIG] ✅ Endereços válidos (Token & Shop)');
  } catch (e: any) {
    console.error('[CONFIG] ❌ Endereço inválido (Token/Shop):', e?.message);
  }

  try {
    getAddress(feed);
    console.info('[CONFIG] ✅ Chainlink feed configurado');
  } catch (e: any) {
    console.error('[CONFIG] ❌ Chainlink feed inválido:', e?.message);
  }

  console.info(
    '[CONFIG] DEMO:',
    import.meta.env.VITE_WEB3_DEMO_MODE,
    'ENABLED:',
    import.meta.env.VITE_WEB3_ENABLED,
  );
}
