// src/components/web3/VexaBox.tsx
import { useWallet } from '@/web3/useWallet';

export default function VexaBox() {
  const { connected, account, networkOk, error, price, config, connect, purchase01 } = useWallet();

  return (
    <div className="rounded-2xl p-5 bg-dark-800/60 border border-dark-700/60 text-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">🌐 VEXA Web3</h3>
        <span className="text-xs opacity-80">Sepolia (chainId {config.CHAIN_ID})</span>
      </div>

      <div className="text-sm">
        Chainlink ETH/USD:&nbsp;
        <span className="font-mono">{price != null ? `$${price}` : '—'}</span>
      </div>

      {config.isConfigured ? (
        <div className="text-emerald-300 text-sm">Contrato ativo</div>
      ) : (
        <div className="text-amber-300/90 text-sm">
          Contrato não configurado (demo). Verifique o arquivo <code>.env.local</code>.
          {config.reason && <div className="mt-1">Motivo: {config.reason}</div>}
          <pre className="mt-2 bg-black/30 p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-xs text-slate-300 space-y-1">
        <div>
          Status: {connected ? 'Conectado' : 'Desconectado'}{' '}
          {account ? `(${account.slice(0, 6)}...${account.slice(-4)})` : ''}
        </div>
        <div>Rede: {networkOk ? 'Sepolia OK' : 'Ajuste para Sepolia'}</div>
      </div>

      {error && <div className="text-rose-300 text-sm">{error}</div>}

      <div className="flex gap-3">
        <button
          onClick={connect}
          className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
        >
          Conectar carteira
        </button>
        <button
          onClick={async () => {
            const rcpt = await purchase01();
            if (rcpt?.hash) {
              console.log('[TRANSACTION] hash:', rcpt.hash);
              alert(`Tx enviada:\n${rcpt.hash}`);
            }
          }}
          disabled={!config.isConfigured || !connected || !networkOk}
          className={`px-3 py-2 rounded text-sm ${
            !config.isConfigured || !connected || !networkOk
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          Comprar 0.01 ETH → tokens
        </button>
      </div>
    </div>
  );
}
