/**
 * Web3 Provider Adapter
 * Decides between demo and real web3 based on env flags
 */
import { DemoProvider } from './demo.js';
import { EthersProvider } from './ethers.js';

const DEMO_MODE = import.meta.env?.VITE_WEB3_DEMO_MODE === 'true';

export function getWalletProvider() {
  if (DEMO_MODE) {
    console.log('[WEB3] Modo Demo ativado');
    return new DemoProvider();
  } else {
    console.log('[WEB3] Modo Real ativado');
    return new EthersProvider();
  }
}

export { DemoProvider, EthersProvider };

