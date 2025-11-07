import { useCallback, useEffect, useState } from 'react';

import { WEB3_CONFIG } from './addresses';
import { buyTokens, connectWallet } from './provider';
import { getEthUsd } from './oracle';

interface UseWalletResult {
  connected: boolean;
  account: string | null;
  networkOk: boolean;
  error: string | null;
  price: number | null;
  config: typeof WEB3_CONFIG;
  connect: () => Promise<void>;
  purchase01: () => Promise<any>;
}

export function useWallet(): UseWalletResult {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [networkOk, setNetworkOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [config] = useState(WEB3_CONFIG);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const accountAddress = await connectWallet();
      if (!accountAddress) {
        setConnected(false);
        setNetworkOk(false);
        return;
      }
      setAccount(accountAddress);
      setConnected(true);
      setNetworkOk(true);
    } catch (e: any) {
      setError(e?.message || 'Falha ao conectar carteira');
    }
  }, []);

  const purchase01 = useCallback(async () => {
    try {
      setError(null);
      if (!config.isConfigured) throw new Error(config.reason || 'Contrato não configurado');
      const receipt = await buyTokens('0.01');
      return receipt;
    } catch (e: any) {
      setError(e?.message || 'Falha ao comprar tokens');
      return null;
    }
  }, [config]);

  useEffect(() => {
    console.info('[CONFIG]', config);
    (async () => {
      const p = await getEthUsd();
      if (p != null) {
        console.info('[ORACLE] ETH/USD', p);
      } else {
        console.warn('[ORACLE] Preço indisponível');
      }
      setPrice(p);
    })();
  }, [config]);

  return { connected, account, networkOk, error, price, config, connect, purchase01 };
}

