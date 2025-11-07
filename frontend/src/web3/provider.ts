import { BrowserProvider, parseEther } from 'ethers';

import { WEB3_CONFIG } from './addresses';

const SEPOLIA_CHAIN_HEX = `0x${Number(WEB3_CONFIG.CHAIN_ID || 0).toString(16)}`;

const SEPOLIA_ADD_PARAMS = {
  chainId: SEPOLIA_CHAIN_HEX,
  chainName: 'Sepolia',
  nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://sepolia.drpc.org', 'https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask não detectado');
  return new BrowserProvider(window.ethereum);
}

export async function ensureChain(): Promise<{ ok: boolean; msg: string }> {
  try {
    const provider = getProvider();
    const net = await provider.getNetwork();
    if (Number(net.chainId) === Number(WEB3_CONFIG.CHAIN_ID)) {
      return { ok: true, msg: 'Sepolia OK' };
    }
    if (!window.ethereum?.request) {
      return { ok: false, msg: 'Provider não suporta switch de rede' };
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_HEX }],
      });
      return { ok: true, msg: 'Sepolia OK (switched)' };
    } catch (err: any) {
      if (err?.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_ADD_PARAMS],
        });
        return { ok: true, msg: 'Sepolia adicionada' };
      }
      throw err;
    }
  } catch (e: any) {
    return { ok: false, msg: e?.message || 'Falha ao trocar rede' };
  }
}

export async function connectWallet() {
  if (typeof window === 'undefined') throw new Error('window não disponível');
  if (!window.ethereum) {
    alert('MetaMask não detectada! Instale a extensão.');
    return null;
  }

  try {
    delete (window as any).selectedAddress;
    delete (window as any).web3;
    console.log('[WEB3] Limpando cache antigo e solicitando conexão');

    const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    console.log('[WEB3] Conta conectada:', account);

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0xaa36a7') {
      console.warn(`[WEB3] Rede incorreta (${chainId}), solicitando troca para Sepolia`);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    }

    return account;
  } catch (err: any) {
    console.error('[WEB3] Falha ao conectar MetaMask:', err);
    alert('Falha ao conectar MetaMask. Verifique permissões da extensão.');
    return null;
  }
}

export async function buyTokens(amountEth: string) {
  if (!WEB3_CONFIG.isConfigured)
    throw new Error(`Contrato não configurado: ${WEB3_CONFIG.reason || ''}`.trim());
  const status = await ensureChain();
  if (!status.ok) throw new Error(status.msg);
  const provider = getProvider();
  const signer = await provider.getSigner();
  const tx = await signer.sendTransaction({
    to: WEB3_CONFIG.SHOP_ADDRESS,
    value: parseEther(amountEth),
  });
  return await tx.wait();
}

