import { Lock, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { WEB3_CONFIG } from '@/web3/addresses';

const StakePanel = () => {
  const enabled = WEB3_CONFIG.isConfigured;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Staking</h3>
            <p className="text-dark-400 text-sm">
              Bloqueie tokens e ganhe recompensas (versão beta)
            </p>
          </div>
        </div>
      </div>

      {!enabled && (
        <div className="rounded-lg bg-dark-700/40 border border-dark-600/40 p-4 text-sm text-dark-200 space-y-2">
          <Lock className="w-5 h-5 text-amber-300" />
          <p>
            O staking Web3 está desativado porque os contratos Sepolia não foram
            configurados. Ajuste as variáveis de ambiente acima ou mantenha o modo demo.
          </p>
        </div>
      )}

      {enabled && (
        <div className="rounded-lg bg-dark-700/50 border border-dark-600/40 p-4 space-y-3">
          <p className="text-sm text-dark-200">
            Estamos preparando a versão on-chain. Enquanto isso, use o painel VEXA
            para acompanhar saldo e compras de tokens.
          </p>
          <Button
            type="button"
            disabled
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Staking em desenvolvimento
          </Button>
        </div>
      )}
    </Card>
  );
};

export default StakePanel;

